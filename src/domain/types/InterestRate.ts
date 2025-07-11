/**
 * InterestRate domain-specific value type
 * Extends Percentage with mortgage interest rate specific constraints:
 * - Minimum rate: 0.1% (historically low rates)
 * - Maximum rate: 25% (extreme high rates, prevents unrealistic inputs)
 * - Designed for annual percentage rates (APR)
 */

import type { Branded } from "./Brand";
import { Result } from "./Brand";
import type { Percentage } from "./Percentage";
import {
  createPercentage,
  toPercentageValue,
  formatPercentage,
} from "./Percentage";

// Branded InterestRate type - semantically different from regular Percentage
export type InterestRate = Branded<Percentage, "InterestRate">;

export type InterestRateValidationError =
  | "PercentageValidationError"
  | "BelowMinimumRate"
  | "AboveMaximumRate";

// Business constants for interest rate limits
const MIN_INTEREST_RATE = 0.1; // 0.1% minimum (historically low)
const MAX_INTEREST_RATE = 25.0; // 25% maximum (extreme high, prevents unrealistic inputs)

/**
 * Smart constructor for InterestRate type
 * @param rate - Interest rate as percentage (e.g., 3.5 for 3.5%)
 * @returns Result with either valid InterestRate or validation error
 */
export function createInterestRate(
  rate: number
): Result<InterestRate, InterestRateValidationError> {
  // First validate as Percentage
  const percentageResult = createPercentage(rate);
  if (!percentageResult.success) {
    return { success: false, error: "PercentageValidationError" };
  }

  const percentageValue = toPercentageValue(percentageResult.data);

  // Apply interest rate specific business rules
  if (percentageValue < MIN_INTEREST_RATE) {
    return { success: false, error: "BelowMinimumRate" };
  }

  if (percentageValue > MAX_INTEREST_RATE) {
    return { success: false, error: "AboveMaximumRate" };
  }

  return {
    success: true,
    data: percentageResult.data as InterestRate, // Safe cast after validation
  };
}

/**
 * Convert InterestRate to underlying Percentage type
 */
export function toPercentage(interestRate: InterestRate): Percentage {
  return interestRate as Percentage;
}

/**
 * Get the interest rate value as a number (percentage)
 */
export function toNumber(interestRate: InterestRate): number {
  return toPercentageValue(toPercentage(interestRate));
}

/**
 * Convert interest rate to decimal for calculations (e.g., 3.5% -> 0.035)
 */
export function toDecimal(interestRate: InterestRate): number {
  return toNumber(interestRate) / 100;
}

/**
 * Create InterestRate from decimal (e.g., 0.035 -> 3.5%)
 */
export function fromDecimal(
  decimal: number
): Result<InterestRate, InterestRateValidationError> {
  const percentage = decimal * 100;
  return createInterestRate(percentage);
}

/**
 * Calculate monthly interest rate from annual rate
 */
export function toMonthlyRate(annualRate: InterestRate): number {
  return toDecimal(annualRate) / 12;
}

/**
 * Create annual interest rate from monthly rate
 */
export function fromMonthlyRate(
  monthlyDecimal: number
): Result<InterestRate, InterestRateValidationError> {
  const annualDecimal = monthlyDecimal * 12;
  return fromDecimal(annualDecimal);
}

/**
 * Add basis points to interest rate (1 basis point = 0.01%)
 */
export function addBasisPoints(
  interestRate: InterestRate,
  basisPoints: number
): Result<InterestRate, InterestRateValidationError> {
  const currentRate = toNumber(interestRate);
  const newRate = currentRate + basisPoints / 100;
  return createInterestRate(newRate);
}

/**
 * Compare interest rates
 */
export function compareInterestRate(a: InterestRate, b: InterestRate): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if interest rates are equal
 */
export function isEqualInterestRate(a: InterestRate, b: InterestRate): boolean {
  return toNumber(a) === toNumber(b);
}

/**
 * Format interest rate for display (uses Percentage formatting)
 */
export function formatInterestRate(
  interestRate: InterestRate,
  decimals: number = 2
): string {
  return formatPercentage(toPercentage(interestRate), decimals);
}

/**
 * Get minimum interest rate
 */
export function getMinimumInterestRate(): InterestRate {
  const result = createInterestRate(MIN_INTEREST_RATE);
  if (!result.success) {
    throw new Error(
      "Failed to create minimum interest rate - this should never happen"
    );
  }
  return result.data;
}

/**
 * Get maximum interest rate
 */
export function getMaximumInterestRate(): InterestRate {
  const result = createInterestRate(MAX_INTEREST_RATE);
  if (!result.success) {
    throw new Error(
      "Failed to create maximum interest rate - this should never happen"
    );
  }
  return result.data;
}

/**
 * Check if rate is within valid interest rate range without creating InterestRate
 */
export function isValidInterestRateRange(rate: number): boolean {
  return rate >= MIN_INTEREST_RATE && rate <= MAX_INTEREST_RATE;
}

/**
 * Common interest rate constants for German mortgage market
 */
export const TYPICAL_LOW_RATE: InterestRate = (() => {
  const result = createInterestRate(1.5); // 1.5% historical low
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const TYPICAL_CURRENT_RATE: InterestRate = (() => {
  const result = createInterestRate(3.5); // 3.5% current typical
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const TYPICAL_HIGH_RATE: InterestRate = (() => {
  const result = createInterestRate(6.0); // 6% high but reasonable
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const STRESS_TEST_RATE: InterestRate = (() => {
  const result = createInterestRate(10.0); // 10% stress test scenario
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();
