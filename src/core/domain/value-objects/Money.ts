/**
 * Money value type using branded types for type safety
 * Makes illegal states unrepresentable by ensuring:
 * - Amount is never negative
 * - Amount has proper precision (cents)
 * - Currency is always EUR (for this domain)
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";

// Branded Money type - prevents mixing with raw numbers
export type Money = Branded<number, "Money">;

export type MoneyValidationError =
  | "NegativeAmount"
  | "InvalidAmount"
  | "ExceedsMaximum";

// Constants
const MAX_MONEY_CENTS = 999_999_999_00; // 999,999,999.00 EUR in cents

/**
 * Smart constructor for Money type
 * @param euros - Amount in euros (can have decimals)
 * @returns Result with either valid Money or validation error
 */
export function createMoney(
  euros: number,
): Result<Money, MoneyValidationError> {
  // Validate input
  if (!Number.isFinite(euros)) {
    return { success: false, error: "InvalidAmount" };
  }

  if (euros < 0) {
    return { success: false, error: "NegativeAmount" };
  }

  // Convert to cents to avoid floating point issues
  const cents = Math.round(euros * 100);

  if (cents > MAX_MONEY_CENTS) {
    return { success: false, error: "ExceedsMaximum" };
  }

  return {
    success: true,
    data: cents as Money, // Safe cast after validation
  };
}

/**
 * Convert Money back to euros (for display/calculation)
 */
export function toEuros(money: Money): number {
  return (money as number) / 100;
}

/**
 * Get raw cents value (internal use)
 */
export function toCents(money: Money): number {
  return money as number;
}

/**
 * Create Money from cents (internal use)
 */
function fromCents(cents: number): Money {
  return cents as Money;
}

/**
 * Add two Money amounts
 */
export function addMoney(
  a: Money,
  b: Money,
): Result<Money, MoneyValidationError> {
  const totalCents = toCents(a) + toCents(b);

  if (totalCents > MAX_MONEY_CENTS) {
    return { success: false, error: "ExceedsMaximum" };
  }

  return {
    success: true,
    data: fromCents(totalCents),
  };
}

/**
 * Subtract Money amounts (result must be non-negative)
 */
export function subtractMoney(
  a: Money,
  b: Money,
): Result<Money, MoneyValidationError> {
  const resultCents = toCents(a) - toCents(b);

  if (resultCents < 0) {
    return { success: false, error: "NegativeAmount" };
  }

  return {
    success: true,
    data: fromCents(resultCents),
  };
}

/**
 * Multiply Money by a factor
 */
export function multiplyMoney(
  money: Money,
  factor: number,
): Result<Money, MoneyValidationError> {
  if (!Number.isFinite(factor) || factor < 0) {
    return { success: false, error: "InvalidAmount" };
  }

  const resultCents = Math.round(toCents(money) * factor);

  if (resultCents > MAX_MONEY_CENTS) {
    return { success: false, error: "ExceedsMaximum" };
  }

  return {
    success: true,
    data: fromCents(resultCents),
  };
}

/**
 * Compare Money amounts
 */
export function compareMoney(a: Money, b: Money): number {
  return toCents(a) - toCents(b);
}

/**
 * Check if Money amounts are equal
 */
export function isEqualMoney(a: Money, b: Money): boolean {
  return toCents(a) === toCents(b);
}

/**
 * Format Money for display
 */
export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(toEuros(money));
}

/**
 * Zero Money constant
 */
export const ZERO_MONEY: Money = 0 as Money;
