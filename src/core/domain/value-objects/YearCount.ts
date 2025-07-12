/**
 * YearCount domain-specific value type
 * Extends PositiveInteger with mortgage loan term specific constraints in years:
 * - Minimum term: 1 year
 * - Maximum term: 40 years (extreme long term)
 * - Used for user-friendly year-based loan duration input/display
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { PositiveInteger } from "./PositiveInteger";
import {
  createPositiveInteger,
  toNumber as positiveIntegerToNumber,
} from "./PositiveInteger";

// Branded YearCount type - semantically different from regular PositiveInteger
export type YearCount = Branded<PositiveInteger, "YearCount">;

export type YearCountValidationError =
  | "PositiveIntegerValidationError"
  | "BelowMinimumTerm"
  | "AboveMaximumTerm";

// Business constants for loan term limits in years
const MIN_LOAN_TERM_YEARS = 1; // 1 year minimum
const MAX_LOAN_TERM_YEARS = 40; // 40 years maximum

/**
 * Smart constructor for YearCount type
 * @param years - Number of years for loan term
 * @returns Result with either valid YearCount or validation error
 */
export function createYearCount(
  years: number,
): Result<YearCount, YearCountValidationError> {
  // First validate as PositiveInteger
  const positiveIntegerResult = createPositiveInteger(years);
  if (!positiveIntegerResult.success) {
    return { success: false, error: "PositiveIntegerValidationError" };
  }

  const yearValue = positiveIntegerToNumber(positiveIntegerResult.data);

  // Apply loan term specific business rules
  if (yearValue < MIN_LOAN_TERM_YEARS) {
    return { success: false, error: "BelowMinimumTerm" };
  }

  if (yearValue > MAX_LOAN_TERM_YEARS) {
    return { success: false, error: "AboveMaximumTerm" };
  }

  return {
    success: true,
    data: positiveIntegerResult.data as YearCount, // Safe cast after validation
  };
}

/**
 * Convert YearCount to underlying PositiveInteger type
 */
export function toPositiveInteger(yearCount: YearCount): PositiveInteger {
  return yearCount as PositiveInteger;
}

/**
 * Get the year count value as a number
 */
export function toNumber(yearCount: YearCount): number {
  return positiveIntegerToNumber(toPositiveInteger(yearCount));
}

/**
 * Convert years to months
 */
export function toMonths(yearCount: YearCount): number {
  return toNumber(yearCount) * 12;
}

/**
 * Create YearCount from months (with rounding)
 */
export function fromMonths(
  months: number,
): Result<YearCount, YearCountValidationError> {
  const years = Math.round(months / 12);
  return createYearCount(years);
}

/**
 * Add years to existing term
 */
export function addYears(
  yearCount: YearCount,
  additionalYears: number,
): Result<YearCount, YearCountValidationError> {
  const totalYears = toNumber(yearCount) + additionalYears;
  return createYearCount(totalYears);
}

/**
 * Subtract years from existing term
 */
export function subtractYears(
  yearCount: YearCount,
  yearsToSubtract: number,
): Result<YearCount, YearCountValidationError> {
  const remainingYears = toNumber(yearCount) - yearsToSubtract;
  return createYearCount(remainingYears);
}

/**
 * Calculate remaining years after a certain period
 */
export function remainingYears(
  totalTerm: YearCount,
  elapsedYears: YearCount,
): Result<YearCount, YearCountValidationError> {
  const remaining = toNumber(totalTerm) - toNumber(elapsedYears);
  return createYearCount(remaining);
}

/**
 * Compare year counts
 */
export function compareYearCount(a: YearCount, b: YearCount): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if year counts are equal
 */
export function isEqualYearCount(a: YearCount, b: YearCount): boolean {
  return toNumber(a) === toNumber(b);
}

/**
 * Format year count for display (German)
 */
export function formatYearCount(yearCount: YearCount): string {
  const years = toNumber(yearCount);

  if (years === 1) {
    return "1 Jahr";
  } else {
    return `${years} Jahre`;
  }
}

/**
 * Get minimum loan term in years
 */
export function getMinimumTermYears(): YearCount {
  const result = createYearCount(MIN_LOAN_TERM_YEARS);
  if (!result.success) {
    throw new Error(
      "Failed to create minimum term years - this should never happen",
    );
  }
  return result.data;
}

/**
 * Get maximum loan term in years
 */
export function getMaximumTermYears(): YearCount {
  const result = createYearCount(MAX_LOAN_TERM_YEARS);
  if (!result.success) {
    throw new Error(
      "Failed to create maximum term years - this should never happen",
    );
  }
  return result.data;
}

/**
 * Check if years is within valid term range without creating YearCount
 */
export function isValidYearTermRange(years: number): boolean {
  return (
    years >= MIN_LOAN_TERM_YEARS &&
    years <= MAX_LOAN_TERM_YEARS &&
    Number.isInteger(years)
  );
}

/**
 * Common loan term constants for German mortgage market (in years)
 */
export const SHORT_TERM_YEARS: YearCount = (() => {
  const result = createYearCount(5); // 5 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const MEDIUM_TERM_YEARS: YearCount = (() => {
  const result = createYearCount(15); // 15 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const LONG_TERM_YEARS: YearCount = (() => {
  const result = createYearCount(25); // 25 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const MAXIMUM_STANDARD_TERM_YEARS: YearCount = (() => {
  const result = createYearCount(30); // 30 years (common maximum)
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();
