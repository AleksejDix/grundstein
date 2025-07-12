/**
 * Currency value types for multi-market support
 * 
 * Prevents mixing currencies and ensures type safety
 * Supports German (EUR) and Swiss (CHF) markets
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";

// Currency-specific branded types
export type EUR = Branded<number, "EUR">;
export type CHF = Branded<number, "CHF">;
export type USD = Branded<number, "USD">; // For future expansion

// Union of supported currencies
export type Currency = EUR | CHF | USD;

// Currency codes
export type CurrencyCode = "EUR" | "CHF" | "USD";

// Amount validation errors
export type CurrencyValidationError =
  | "NegativeAmount"
  | "InvalidAmount"
  | "ExceedsMaximum"
  | "TooManyDecimals";

// Constants
const MAX_AMOUNT_CENTS = 999_999_999_00; // ~1 billion in cents

/**
 * Create EUR amount
 */
export function createEUR(euros: number): Result<EUR, CurrencyValidationError> {
  return validateAndCreateCurrency(euros, "EUR") as Result<EUR, CurrencyValidationError>;
}

/**
 * Create CHF amount
 */
export function createCHF(francs: number): Result<CHF, CurrencyValidationError> {
  return validateAndCreateCurrency(francs, "CHF") as Result<CHF, CurrencyValidationError>;
}

/**
 * Create USD amount (for future use)
 */
export function createUSD(dollars: number): Result<USD, CurrencyValidationError> {
  return validateAndCreateCurrency(dollars, "USD") as Result<USD, CurrencyValidationError>;
}

/**
 * Generic currency validation and creation
 */
function validateAndCreateCurrency(
  amount: number,
  _code: CurrencyCode
): Result<Currency, CurrencyValidationError> {
  // Validate input
  if (!Number.isFinite(amount)) {
    return Result.error("InvalidAmount");
  }

  if (amount < 0) {
    return Result.error("NegativeAmount");
  }

  // Check decimal places (max 2 for currency)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return Result.error("TooManyDecimals");
  }

  // Convert to cents to avoid floating point issues
  const cents = Math.round(amount * 100);

  if (cents > MAX_AMOUNT_CENTS) {
    return Result.error("ExceedsMaximum");
  }

  // Return as branded type (stored as cents internally)
  return Result.ok(cents as Currency);
}

/**
 * Convert currency to display amount (from cents to units)
 */
export function toDisplayAmount(currency: Currency): number {
  return (currency as number) / 100;
}

/**
 * Format currency for display
 */
export function formatEUR(amount: EUR): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDisplayAmount(amount));
}

export function formatCHF(amount: CHF): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDisplayAmount(amount));
}

export function formatUSD(amount: USD): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toDisplayAmount(amount));
}

/**
 * Type guards
 */
export function isEUR(_currency: Currency): _currency is EUR {
  return true; // Since they're all numbers internally, we'd need runtime tags for real discrimination
}

export function isCHF(_currency: Currency): _currency is CHF {
  return true; // In practice, you'd track the currency type separately
}

/**
 * Math operations (same currency only)
 */
export function addEUR(a: EUR, b: EUR): EUR {
  return ((a as number) + (b as number)) as EUR;
}

export function subtractEUR(a: EUR, b: EUR): Result<EUR, "NegativeAmount"> {
  const result = (a as number) - (b as number);
  if (result < 0) {
    return Result.error("NegativeAmount");
  }
  return Result.ok(result as EUR);
}

export function addCHF(a: CHF, b: CHF): CHF {
  return ((a as number) + (b as number)) as CHF;
}

export function subtractCHF(a: CHF, b: CHF): Result<CHF, "NegativeAmount"> {
  const result = (a as number) - (b as number);
  if (result < 0) {
    return Result.error("NegativeAmount");
  }
  return Result.ok(result as CHF);
}

/**
 * Currency conversion (would need real exchange rates)
 */
export type ExchangeRate = Branded<number, "ExchangeRate">;

export function convertEURtoCHF(amount: EUR, rate: ExchangeRate): CHF {
  const euros = toDisplayAmount(amount);
  const francs = euros * (rate as number);
  return Math.round(francs * 100) as CHF;
}

export function convertCHFtoEUR(amount: CHF, rate: ExchangeRate): EUR {
  const francs = toDisplayAmount(amount);
  const euros = francs / (rate as number);
  return Math.round(euros * 100) as EUR;
}