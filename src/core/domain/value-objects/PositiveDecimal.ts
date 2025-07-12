/**
 * PositiveDecimal value type using branded types for type safety
 * Makes illegal states unrepresentable by ensuring:
 * - Value is always positive (> 0)
 * - Allows decimal values for precise calculations
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";

// Branded PositiveDecimal type - prevents mixing with raw numbers
export type PositiveDecimal = Branded<number, "PositiveDecimal">;

export type PositiveDecimalValidationError = "InvalidValue" | "NotPositive";

/**
 * Smart constructor for PositiveDecimal type
 * @param value - Number that should be positive (allows decimals)
 * @returns Result with either valid PositiveDecimal or validation error
 */
export function createPositiveDecimal(
  value: number
): Result<PositiveDecimal, PositiveDecimalValidationError> {
  // Validate input
  if (!Number.isFinite(value)) {
    return { success: false, error: "InvalidValue" };
  }

  if (value <= 0) {
    return { success: false, error: "NotPositive" };
  }

  return {
    success: true,
    data: value as PositiveDecimal, // Safe cast after validation
  };
}

/**
 * Get the decimal value as a number
 */
export function toNumber(positiveDecimal: PositiveDecimal): number {
  return positiveDecimal as number;
}

/**
 * Add two positive decimals
 */
export function addPositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal
): PositiveDecimal {
  // Addition of two positive decimals is always positive, so no validation needed
  return (toNumber(a) + toNumber(b)) as PositiveDecimal;
}

/**
 * Subtract positive decimals (result must remain positive)
 */
export function subtractPositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal
): Result<PositiveDecimal, PositiveDecimalValidationError> {
  const result = toNumber(a) - toNumber(b);

  if (result <= 0) {
    return { success: false, error: "NotPositive" };
  }

  return {
    success: true,
    data: result as PositiveDecimal,
  };
}

/**
 * Multiply positive decimals
 */
export function multiplyPositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal
): PositiveDecimal {
  // Multiplication of two positive decimals is always positive
  return (toNumber(a) * toNumber(b)) as PositiveDecimal;
}

/**
 * Divide positive decimals (result must remain positive)
 */
export function dividePositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal
): PositiveDecimal {
  // Division of two positive decimals is always positive
  return (toNumber(a) / toNumber(b)) as PositiveDecimal;
}

/**
 * Multiply by a positive factor
 */
export function multiplyByFactor(
  decimal: PositiveDecimal,
  factor: number
): Result<PositiveDecimal, PositiveDecimalValidationError> {
  if (!Number.isFinite(factor) || factor <= 0) {
    return { success: false, error: "InvalidValue" };
  }

  const result = toNumber(decimal) * factor;

  return {
    success: true,
    data: result as PositiveDecimal,
  };
}

/**
 * Compare positive decimals
 */
export function comparePositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal
): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if positive decimals are equal (with small tolerance for floating point)
 */
export function isEqualPositiveDecimal(
  a: PositiveDecimal,
  b: PositiveDecimal,
  epsilon: number = 1e-10
): boolean {
  return Math.abs(toNumber(a) - toNumber(b)) < epsilon;
}

/**
 * Format positive decimal for display
 */
export function formatPositiveDecimal(
  positiveDecimal: PositiveDecimal,
  decimals: number = 2
): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(toNumber(positiveDecimal));
}

/**
 * Round to specified decimal places
 */
export function roundPositiveDecimal(
  decimal: PositiveDecimal,
  places: number
): PositiveDecimal {
  const factor = Math.pow(10, places);
  const rounded = Math.round(toNumber(decimal) * factor) / factor;
  return rounded as PositiveDecimal; // Safe since rounding a positive number stays positive
}

/**
 * Common positive decimal constants
 */
export const ONE_DECIMAL: PositiveDecimal = 1.0 as PositiveDecimal;
export const HALF: PositiveDecimal = 0.5 as PositiveDecimal;
