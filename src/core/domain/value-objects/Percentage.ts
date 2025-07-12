/**
 * Percentage value type using branded types for type safety
 * Makes illegal states unrepresentable by ensuring:
 * - Percentage is within valid range (0-100)
 * - Proper precision for calculations
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";

// Branded Percentage type - prevents mixing with raw numbers
export type Percentage = Branded<number, "Percentage">;

export type PercentageValidationError = "InvalidValue" | "OutOfRange";

// Constants
const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

/**
 * Smart constructor for Percentage type
 * @param value - Percentage value (0-100)
 * @returns Result with either valid Percentage or validation error
 */
export function createPercentage(
  value: number,
): Result<Percentage, PercentageValidationError> {
  // Validate input
  if (!Number.isFinite(value)) {
    return { success: false, error: "InvalidValue" };
  }

  if (value < MIN_PERCENTAGE || value > MAX_PERCENTAGE) {
    return { success: false, error: "OutOfRange" };
  }

  return {
    success: true,
    data: value as Percentage, // Safe cast after validation
  };
}

/**
 * Get the percentage value as a number (0-100)
 */
export function toPercentageValue(percentage: Percentage): number {
  return percentage as number;
}

/**
 * Convert percentage to decimal (0-1) for calculations
 */
export function toDecimal(percentage: Percentage): number {
  return (percentage as number) / 100;
}

/**
 * Create percentage from decimal (0-1)
 */
export function fromDecimal(
  decimal: number,
): Result<Percentage, PercentageValidationError> {
  return createPercentage(decimal * 100);
}

/**
 * Add two percentages (with overflow protection)
 */
export function addPercentage(
  a: Percentage,
  b: Percentage,
): Result<Percentage, PercentageValidationError> {
  const sum = toPercentageValue(a) + toPercentageValue(b);

  if (sum > MAX_PERCENTAGE) {
    return { success: false, error: "OutOfRange" };
  }

  return createPercentage(sum);
}

/**
 * Subtract percentages (with underflow protection)
 */
export function subtractPercentage(
  a: Percentage,
  b: Percentage,
): Result<Percentage, PercentageValidationError> {
  const difference = toPercentageValue(a) - toPercentageValue(b);

  if (difference < MIN_PERCENTAGE) {
    return { success: false, error: "OutOfRange" };
  }

  return createPercentage(difference);
}

/**
 * Multiply percentage by factor (with bounds checking)
 */
export function multiplyPercentage(
  percentage: Percentage,
  factor: number,
): Result<Percentage, PercentageValidationError> {
  if (!Number.isFinite(factor) || factor < 0) {
    return { success: false, error: "InvalidValue" };
  }

  const result = toPercentageValue(percentage) * factor;

  if (result > MAX_PERCENTAGE) {
    return { success: false, error: "OutOfRange" };
  }

  return createPercentage(result);
}

/**
 * Compare percentages
 */
export function comparePercentage(a: Percentage, b: Percentage): number {
  return toPercentageValue(a) - toPercentageValue(b);
}

/**
 * Check if percentages are equal
 */
export function isEqualPercentage(a: Percentage, b: Percentage): boolean {
  return Math.abs(toPercentageValue(a) - toPercentageValue(b)) < 0.001; // Allow for small floating point differences
}

/**
 * Format percentage for display
 */
export function formatPercentage(
  percentage: Percentage,
  decimals: number = 2,
): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(toDecimal(percentage));
}

/**
 * Common percentage constants
 */
export const ZERO_PERCENT: Percentage = 0 as Percentage;
export const FIFTY_PERCENT: Percentage = 50 as Percentage;
export const HUNDRED_PERCENT: Percentage = 100 as Percentage;
