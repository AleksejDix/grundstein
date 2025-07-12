/**
 * LoanAmount domain-specific value type
 * Extends Money with mortgage loan specific constraints:
 * - Minimum loan amount: €1,000 (typical banking minimum)
 * - Maximum loan amount: €10,000,000 (ultra-high net worth limit)
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { Money } from "./Money";
import { createMoney, toEuros, formatMoney } from "./Money";

// Branded LoanAmount type - semantically different from regular Money
export type LoanAmount = Branded<Money, "LoanAmount">;

export type LoanAmountValidationError =
  | "MoneyValidationError"
  | "BelowMinimum"
  | "AboveMaximum";

// Business constants for loan amount limits
const MIN_LOAN_AMOUNT_EUR = 1000; // €1,000 minimum
const MAX_LOAN_AMOUNT_EUR = 10000000; // €10,000,000 maximum

/**
 * Smart constructor for LoanAmount type
 * @param amount - Amount in EUR that should be valid for a mortgage loan
 * @returns Result with either valid LoanAmount or validation error
 */
export function createLoanAmount(
  amount: number,
): Result<LoanAmount, LoanAmountValidationError> {
  // First validate as Money
  const moneyResult = createMoney(amount);
  if (!moneyResult.success) {
    return { success: false, error: "MoneyValidationError" };
  }

  const moneyValue = toEuros(moneyResult.data);

  // Apply loan-specific business rules
  if (moneyValue < MIN_LOAN_AMOUNT_EUR) {
    return { success: false, error: "BelowMinimum" };
  }

  if (moneyValue > MAX_LOAN_AMOUNT_EUR) {
    return { success: false, error: "AboveMaximum" };
  }

  return {
    success: true,
    data: moneyResult.data as LoanAmount, // Safe cast after validation
  };
}

/**
 * Convert LoanAmount to underlying Money type
 */
export function toMoney(loanAmount: LoanAmount): Money {
  return loanAmount as Money;
}

/**
 * Get the loan amount value as a number (in EUR)
 */
export function toNumber(loanAmount: LoanAmount): number {
  return toEuros(toMoney(loanAmount));
}

/**
 * Format loan amount for display (uses Money formatting)
 */
export function formatLoanAmount(loanAmount: LoanAmount): string {
  return formatMoney(toMoney(loanAmount));
}

/**
 * Get minimum loan amount
 */
export function getMinimumLoanAmount(): LoanAmount {
  const result = createLoanAmount(MIN_LOAN_AMOUNT_EUR);
  if (!result.success) {
    throw new Error(
      "Failed to create minimum loan amount - this should never happen",
    );
  }
  return result.data;
}

/**
 * Get maximum loan amount
 */
export function getMaximumLoanAmount(): LoanAmount {
  const result = createLoanAmount(MAX_LOAN_AMOUNT_EUR);
  if (!result.success) {
    throw new Error(
      "Failed to create maximum loan amount - this should never happen",
    );
  }
  return result.data;
}
