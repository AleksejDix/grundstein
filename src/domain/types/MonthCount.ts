/**
 * MonthCount domain-specific value type
 * Extends PositiveInteger with mortgage loan term specific constraints:
 * - Minimum term: 1 month (very short term)
 * - Maximum term: 480 months (40 years, extreme long term)
 * - Used for loan duration calculations
 */

import type { Branded } from "./Brand";
import { Result } from "./Brand";
import type { PositiveInteger } from "./PositiveInteger";
import {
  createPositiveInteger,
  toNumber as positiveIntegerToNumber,
} from "./PositiveInteger";

// Branded MonthCount type - semantically different from regular PositiveInteger
export type MonthCount = Branded<PositiveInteger, "MonthCount">;

export type MonthCountValidationError =
  | "PositiveIntegerValidationError"
  | "BelowMinimumTerm"
  | "AboveMaximumTerm";

// Business constants for loan term limits
const MIN_LOAN_TERM_MONTHS = 1; // 1 month minimum
const MAX_LOAN_TERM_MONTHS = 480; // 480 months (40 years) maximum

/**
 * Smart constructor for MonthCount type
 * @param months - Number of months for loan term
 * @returns Result with either valid MonthCount or validation error
 */
export function createMonthCount(
  months: number
): Result<MonthCount, MonthCountValidationError> {
  // First validate as PositiveInteger
  const positiveIntegerResult = createPositiveInteger(months);
  if (!positiveIntegerResult.success) {
    return { success: false, error: "PositiveIntegerValidationError" };
  }

  const monthValue = positiveIntegerToNumber(positiveIntegerResult.data);

  // Apply loan term specific business rules
  if (monthValue < MIN_LOAN_TERM_MONTHS) {
    return { success: false, error: "BelowMinimumTerm" };
  }

  if (monthValue > MAX_LOAN_TERM_MONTHS) {
    return { success: false, error: "AboveMaximumTerm" };
  }

  return {
    success: true,
    data: positiveIntegerResult.data as MonthCount, // Safe cast after validation
  };
}

/**
 * Convert MonthCount to underlying PositiveInteger type
 */
export function toPositiveInteger(monthCount: MonthCount): PositiveInteger {
  return monthCount as PositiveInteger;
}

/**
 * Get the month count value as a number
 */
export function toNumber(monthCount: MonthCount): number {
  return positiveIntegerToNumber(toPositiveInteger(monthCount));
}

/**
 * Convert months to years (with decimal precision)
 */
export function toYears(monthCount: MonthCount): number {
  return toNumber(monthCount) / 12;
}

/**
 * Create MonthCount from years
 */
export function fromYears(
  years: number
): Result<MonthCount, MonthCountValidationError> {
  const months = Math.round(years * 12);
  return createMonthCount(months);
}

/**
 * Add months to existing term
 */
export function addMonths(
  monthCount: MonthCount,
  additionalMonths: number
): Result<MonthCount, MonthCountValidationError> {
  const totalMonths = toNumber(monthCount) + additionalMonths;
  return createMonthCount(totalMonths);
}

/**
 * Subtract months from existing term
 */
export function subtractMonths(
  monthCount: MonthCount,
  monthsToSubtract: number
): Result<MonthCount, MonthCountValidationError> {
  const remainingMonths = toNumber(monthCount) - monthsToSubtract;
  return createMonthCount(remainingMonths);
}

/**
 * Calculate remaining months after a certain period
 */
export function remainingMonths(
  totalTerm: MonthCount,
  elapsedMonths: MonthCount
): Result<MonthCount, MonthCountValidationError> {
  const remaining = toNumber(totalTerm) - toNumber(elapsedMonths);
  return createMonthCount(remaining);
}

/**
 * Compare month counts
 */
export function compareMonthCount(a: MonthCount, b: MonthCount): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if month counts are equal
 */
export function isEqualMonthCount(a: MonthCount, b: MonthCount): boolean {
  return toNumber(a) === toNumber(b);
}

/**
 * Format month count for display
 */
export function formatMonthCount(monthCount: MonthCount): string {
  const months = toNumber(monthCount);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (months < 12) {
    return `${months} ${months === 1 ? "Monat" : "Monate"}`;
  } else if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "Jahr" : "Jahre"}`;
  } else {
    return `${years} ${years === 1 ? "Jahr" : "Jahre"} ${remainingMonths} ${
      remainingMonths === 1 ? "Monat" : "Monate"
    }`;
  }
}

/**
 * Get minimum loan term
 */
export function getMinimumTerm(): MonthCount {
  const result = createMonthCount(MIN_LOAN_TERM_MONTHS);
  if (!result.success) {
    throw new Error("Failed to create minimum term - this should never happen");
  }
  return result.data;
}

/**
 * Get maximum loan term
 */
export function getMaximumTerm(): MonthCount {
  const result = createMonthCount(MAX_LOAN_TERM_MONTHS);
  if (!result.success) {
    throw new Error("Failed to create maximum term - this should never happen");
  }
  return result.data;
}

/**
 * Check if months is within valid term range without creating MonthCount
 */
export function isValidTermRange(months: number): boolean {
  return (
    months >= MIN_LOAN_TERM_MONTHS &&
    months <= MAX_LOAN_TERM_MONTHS &&
    Number.isInteger(months)
  );
}

/**
 * Common loan term constants for German mortgage market
 */
export const SHORT_TERM: MonthCount = (() => {
  const result = createMonthCount(60); // 5 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const MEDIUM_TERM: MonthCount = (() => {
  const result = createMonthCount(180); // 15 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const LONG_TERM: MonthCount = (() => {
  const result = createMonthCount(300); // 25 years
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const MAXIMUM_STANDARD_TERM: MonthCount = (() => {
  const result = createMonthCount(360); // 30 years (common maximum)
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();
