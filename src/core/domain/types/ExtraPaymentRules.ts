/**
 * Extra Payment Rules
 * 
 * Simple implementation of extra payment limits and validation.
 * Covers common mortgage market percentages: 5%, 10%, 20%, 50%, unlimited.
 */

import { Result } from "../primitives/Brand";

/**
 * Common extra payment percentage limits
 */
export type ExtraPaymentPercentage = 5 | 10 | 20 | 50 | 100; // 100 = unlimited

/**
 * Extra payment yearly limit
 */
export type ExtraPaymentLimit =
  | { readonly type: "Percentage"; readonly value: ExtraPaymentPercentage }
  | { readonly type: "Unlimited" };

/**
 * Create percentage-based extra payment limit
 */
export const createPercentageLimit = (
  percentage: ExtraPaymentPercentage
): ExtraPaymentLimit => ({
  type: "Percentage",
  value: percentage
});

/**
 * Create unlimited extra payment allowance
 */
export const createUnlimitedLimit = (): ExtraPaymentLimit => ({
  type: "Unlimited"
});

/**
 * Check if yearly payment amount is within the allowed limit
 */
export const validateYearlyLimit = (
  yearlyAmount: number,
  originalLoanAmount: number,
  limit: ExtraPaymentLimit
): Result<void, "ExceedsYearlyLimit"> => {
  if (limit.type === "Unlimited") {
    return Result.ok(undefined);
  }

  const yearlyPercentage = (yearlyAmount / originalLoanAmount) * 100;
  
  if (yearlyPercentage > limit.value) {
    return Result.error("ExceedsYearlyLimit");
  }

  return Result.ok(undefined);
};

/**
 * Calculate maximum allowed yearly amount for a limit
 */
export const calculateMaxYearlyAmount = (
  originalLoanAmount: number,
  limit: ExtraPaymentLimit
): number => {
  if (limit.type === "Unlimited") {
    return originalLoanAmount; // Can pay off entire loan
  }

  return originalLoanAmount * (limit.value / 100);
};

/**
 * Get available percentage options for UI
 */
export const getAvailablePercentages = (): ExtraPaymentPercentage[] => [5, 10, 20, 50, 100];

/**
 * Format limit for display
 */
export const formatExtraPaymentLimit = (limit: ExtraPaymentLimit): string => {
  if (limit.type === "Unlimited") {
    return "Unlimited";
  }
  return `${limit.value}%`;
};