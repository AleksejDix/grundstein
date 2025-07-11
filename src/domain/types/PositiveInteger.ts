/**
 * PositiveInteger value type using branded types for type safety
 * Makes illegal states unrepresentable by ensuring:
 * - Value is always a positive integer (> 0)
 * - No fractional parts allowed
 */

import type { Branded } from "./Brand";
import { Result } from "./Brand";

// Branded PositiveInteger type - prevents mixing with raw numbers
export type PositiveInteger = Branded<number, "PositiveInteger">;

export type PositiveIntegerValidationError =
  | "InvalidValue"
  | "NotPositive"
  | "NotInteger";

/**
 * Smart constructor for PositiveInteger type
 * @param value - Number that should be a positive integer
 * @returns Result with either valid PositiveInteger or validation error
 */
export function createPositiveInteger(
  value: number
): Result<PositiveInteger, PositiveIntegerValidationError> {
  // Validate input
  if (!Number.isFinite(value)) {
    return { success: false, error: "InvalidValue" };
  }

  if (value <= 0) {
    return { success: false, error: "NotPositive" };
  }

  if (!Number.isInteger(value)) {
    return { success: false, error: "NotInteger" };
  }

  return {
    success: true,
    data: value as PositiveInteger, // Safe cast after validation
  };
}

/**
 * Get the integer value as a number
 */
export function toNumber(positiveInt: PositiveInteger): number {
  return positiveInt as number;
}

/**
 * Add two positive integers
 */
export function addPositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): PositiveInteger {
  // Addition of two positive integers is always positive, so no validation needed
  return (toNumber(a) + toNumber(b)) as PositiveInteger;
}

/**
 * Subtract positive integers (result must remain positive)
 */
export function subtractPositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): Result<PositiveInteger, PositiveIntegerValidationError> {
  const result = toNumber(a) - toNumber(b);

  if (result <= 0) {
    return { success: false, error: "NotPositive" };
  }

  return {
    success: true,
    data: result as PositiveInteger,
  };
}

/**
 * Multiply positive integers
 */
export function multiplyPositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): PositiveInteger {
  // Multiplication of two positive integers is always positive
  return (toNumber(a) * toNumber(b)) as PositiveInteger;
}

/**
 * Integer division (result must be positive integer)
 */
export function dividePositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): Result<PositiveInteger, PositiveIntegerValidationError> {
  const result = Math.floor(toNumber(a) / toNumber(b));

  if (result <= 0) {
    return { success: false, error: "NotPositive" };
  }

  return {
    success: true,
    data: result as PositiveInteger,
  };
}

/**
 * Compare positive integers
 */
export function comparePositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if positive integers are equal
 */
export function isEqualPositiveInteger(
  a: PositiveInteger,
  b: PositiveInteger
): boolean {
  return toNumber(a) === toNumber(b);
}

/**
 * Format positive integer for display
 */
export function formatPositiveInteger(positiveInt: PositiveInteger): string {
  return new Intl.NumberFormat("de-DE").format(toNumber(positiveInt));
}

/**
 * Common positive integer constants
 */
export const ONE: PositiveInteger = 1 as PositiveInteger;
export const TWELVE: PositiveInteger = 12 as PositiveInteger; // Useful for month calculations
