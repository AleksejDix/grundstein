/**
 * FixedRatePeriod domain type
 *
 * Critical concept for German mortgages (Zinsbindung)
 * Represents the period where the interest rate is fixed before potentially changing
 *
 * German mortgages typically have:
 * - Initial fixed rate period (5, 10, 15, 20, 25, 30 years most common)
 * - After this period, rate can be renegotiated or become variable
 * - This significantly affects mortgage calculations and refinancing decisions
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { YearCount } from "../value-objects/YearCount";
import { createYearCount, toNumber as yearCountToNumber } from "../value-objects/YearCount";
import type { InterestRate } from "../value-objects/InterestRate";
import {
  createInterestRate,
  toNumber as interestRateToNumber,
  formatInterestRate,
} from "../value-objects/InterestRate";

// Branded FixedRatePeriod type
export type FixedRatePeriod = Branded<
  {
    readonly periodYears: YearCount;
    readonly initialRate: InterestRate;
    readonly rateType: FixedRateType;
    readonly startDate: Date;
  },
  "FixedRatePeriod"
>;

// Types of rate periods available in German market
export type FixedRateType =
  | "Fixed" // Fixed rate for entire period (Festzins)
  | "InitialFixed" // Fixed initially, then renegotiable (Zinsbindung)
  | "CapFixed"; // Fixed with rate cap protection

export type FixedRatePeriodValidationError =
  | "InvalidPeriodLength"
  | "InvalidInterestRate"
  | "InvalidStartDate"
  | "UnsupportedRateType"
  | "PeriodTooShort"
  | "PeriodTooLong";

// Business constants for German mortgage market
const MIN_FIXED_PERIOD_YEARS = 1; // Minimum 1 year fixed period
const MAX_FIXED_PERIOD_YEARS = 40; // Maximum 40 years (align with YearCount limit)
const TYPICAL_PERIODS = [5, 10, 15, 20, 25, 30] as const; // Most common in Germany

/**
 * Smart constructor for FixedRatePeriod type
 * @param periodYears - Length of fixed rate period in years
 * @param initialRate - Interest rate during fixed period
 * @param rateType - Type of fixed rate period
 * @param startDate - When the fixed period starts
 * @returns Result with either valid FixedRatePeriod or validation error
 */
export function createFixedRatePeriod(
  periodYears: number,
  initialRate: number,
  rateType: FixedRateType = "InitialFixed",
  startDate: Date = new Date()
): Result<FixedRatePeriod, FixedRatePeriodValidationError> {
  // Validate period length
  if (periodYears < MIN_FIXED_PERIOD_YEARS) {
    return { success: false, error: "PeriodTooShort" };
  }

  if (periodYears > MAX_FIXED_PERIOD_YEARS) {
    return { success: false, error: "PeriodTooLong" };
  }

  // Create domain value objects
  const yearCountResult = createYearCount(periodYears);
  if (!yearCountResult.success) {
    return { success: false, error: "InvalidPeriodLength" };
  }

  const interestRateResult = createInterestRate(initialRate);
  if (!interestRateResult.success) {
    return { success: false, error: "InvalidInterestRate" };
  }

  // Validate start date (not in the past more than reasonable)
  const now = new Date();
  const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);

  if (startDate < fiveYearsAgo) {
    return { success: false, error: "InvalidStartDate" };
  }

  // Validate rate type
  const validRateTypes: FixedRateType[] = ["Fixed", "InitialFixed", "CapFixed"];
  if (!validRateTypes.includes(rateType)) {
    return { success: false, error: "UnsupportedRateType" };
  }

  return {
    success: true,
    data: {
      periodYears: yearCountResult.data,
      initialRate: interestRateResult.data,
      rateType,
      startDate: new Date(startDate), // Clone to ensure immutability
    } as FixedRatePeriod,
  };
}

/**
 * Get the period length in years
 */
export function getPeriodYears(fixedRatePeriod: FixedRatePeriod): number {
  return yearCountToNumber((fixedRatePeriod as any).periodYears);
}

/**
 * Get the initial interest rate
 */
export function getInitialRate(fixedRatePeriod: FixedRatePeriod): number {
  return interestRateToNumber((fixedRatePeriod as any).initialRate);
}

/**
 * Get the rate type
 */
export function getRateType(fixedRatePeriod: FixedRatePeriod): FixedRateType {
  return (fixedRatePeriod as any).rateType;
}

/**
 * Get the start date
 */
export function getStartDate(fixedRatePeriod: FixedRatePeriod): Date {
  return new Date((fixedRatePeriod as any).startDate);
}

/**
 * Calculate the end date of the fixed rate period
 */
export function getEndDate(fixedRatePeriod: FixedRatePeriod): Date {
  const startDate = getStartDate(fixedRatePeriod);
  const periodYears = getPeriodYears(fixedRatePeriod);

  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + periodYears);

  return endDate;
}

/**
 * Check if the fixed rate period is currently active
 */
export function isCurrentlyActive(
  fixedRatePeriod: FixedRatePeriod,
  currentDate: Date = new Date()
): boolean {
  const startDate = getStartDate(fixedRatePeriod);
  const endDate = getEndDate(fixedRatePeriod);

  return currentDate >= startDate && currentDate <= endDate;
}

/**
 * Calculate remaining years in fixed rate period
 */
export function getRemainingYears(
  fixedRatePeriod: FixedRatePeriod,
  currentDate: Date = new Date()
): number {
  if (!isCurrentlyActive(fixedRatePeriod, currentDate)) {
    return 0;
  }

  const endDate = getEndDate(fixedRatePeriod);
  const diffMs = endDate.getTime() - currentDate.getTime();
  const diffYears = diffMs / (365.25 * 24 * 60 * 60 * 1000);

  return Math.max(0, Math.round(diffYears * 100) / 100); // Round to 2 decimal places
}

/**
 * Check if this is a typical German mortgage period
 */
export function isTypicalPeriod(fixedRatePeriod: FixedRatePeriod): boolean {
  const years = getPeriodYears(fixedRatePeriod);
  return TYPICAL_PERIODS.includes(years as any);
}

/**
 * Format fixed rate period for display
 */
export function formatFixedRatePeriod(
  fixedRatePeriod: FixedRatePeriod
): string {
  const years = getPeriodYears(fixedRatePeriod);
  const rate = formatInterestRate((fixedRatePeriod as any).initialRate);
  const rateType = getRateType(fixedRatePeriod);

  const typeLabel =
    rateType === "Fixed"
      ? "Festzins"
      : rateType === "InitialFixed"
      ? "Zinsbindung"
      : "Zinsobergrenze";

  return `${years} Jahre ${typeLabel} @ ${rate}`;
}

/**
 * Create a standard German mortgage fixed rate period
 */
export function createStandardGermanPeriod(
  years: 5 | 10 | 15 | 20 | 25 | 30,
  rate: number,
  startDate: Date = new Date()
): Result<FixedRatePeriod, FixedRatePeriodValidationError> {
  return createFixedRatePeriod(years, rate, "InitialFixed", startDate);
}

/**
 * Calculate days until rate period expires
 */
export function getDaysUntilExpiry(
  fixedRatePeriod: FixedRatePeriod,
  currentDate: Date = new Date()
): number {
  const endDate = getEndDate(fixedRatePeriod);
  const diffMs = endDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  return Math.max(0, diffDays);
}

/**
 * Check if rate period is expiring soon (within next 12 months)
 */
export function isExpiringSoon(
  fixedRatePeriod: FixedRatePeriod,
  currentDate: Date = new Date(),
  monthsThreshold: number = 12
): boolean {
  const daysUntilExpiry = getDaysUntilExpiry(fixedRatePeriod, currentDate);
  const daysThreshold = monthsThreshold * 30; // Approximate

  return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}

/**
 * Compare two fixed rate periods by their end dates
 */
export function compareByEndDate(
  a: FixedRatePeriod,
  b: FixedRatePeriod
): number {
  const endDateA = getEndDate(a);
  const endDateB = getEndDate(b);

  return endDateA.getTime() - endDateB.getTime();
}

/**
 * Get all typical German mortgage periods for selection
 */
export function getTypicalPeriods(): readonly number[] {
  return TYPICAL_PERIODS;
}

/**
 * Validate if a period length is acceptable for German mortgages
 */
export function isValidPeriodLength(years: number): boolean {
  return years >= MIN_FIXED_PERIOD_YEARS && years <= MAX_FIXED_PERIOD_YEARS;
}

/**
 * Get minimum period length
 */
export function getMinimumPeriodYears(): number {
  return MIN_FIXED_PERIOD_YEARS;
}

/**
 * Get maximum period length
 */
export function getMaximumPeriodYears(): number {
  return MAX_FIXED_PERIOD_YEARS;
}
