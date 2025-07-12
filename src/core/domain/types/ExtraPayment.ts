/**
 * ExtraPayment domain type
 * Represents additional payments (Sondertilgung) made in specific months:
 * - Used to accelerate loan payoff
 * - Reduces outstanding balance directly
 * - Can significantly reduce total interest paid
 */

import { Result } from "../primitives/Brand";
import type { Money } from "../value-objects/Money";
import { createMoney, addMoney, toEuros, formatMoney } from "../value-objects/Money";
import type { PaymentMonth } from "../value-objects/PaymentMonth";
import {
  toNumber as paymentMonthToNumber,
  formatPaymentMonth,
} from "../value-objects/PaymentMonth";

// ExtraPayment record type
export type ExtraPayment = {
  readonly month: PaymentMonth;
  readonly amount: Money;
};

export type ExtraPaymentValidationError =
  | "InvalidPaymentMonth"
  | "InvalidAmount"
  | "AmountTooLarge";

// Business constants for extra payment limits
const MIN_EXTRA_PAYMENT = 1; // Minimum €1 extra payment
const MAX_EXTRA_PAYMENT = 1000000; // Maximum €1M extra payment

/**
 * Smart constructor for ExtraPayment type
 * @param month - Payment month when extra payment is made
 * @param amount - Extra payment amount in euros
 * @returns Result with either valid ExtraPayment or validation error
 */
export function createExtraPayment(
  month: PaymentMonth,
  amount: number
): Result<ExtraPayment, ExtraPaymentValidationError> {
  // Validate amount
  const amountResult = createMoney(amount);
  if (!amountResult.success) {
    return { success: false, error: "InvalidAmount" };
  }

  // Check business rules for extra payment amounts
  const amountInEuros = toEuros(amountResult.data);
  if (amountInEuros < MIN_EXTRA_PAYMENT || amountInEuros > MAX_EXTRA_PAYMENT) {
    return { success: false, error: "AmountTooLarge" };
  }

  return {
    success: true,
    data: {
      month,
      amount: amountResult.data,
    },
  };
}

/**
 * Create ExtraPayment from Money object
 */
export function createExtraPaymentFromMoney(
  month: PaymentMonth,
  amount: Money
): Result<ExtraPayment, ExtraPaymentValidationError> {
  // Check business rules for extra payment amounts
  const amountInEuros = toEuros(amount);
  if (amountInEuros < MIN_EXTRA_PAYMENT || amountInEuros > MAX_EXTRA_PAYMENT) {
    return { success: false, error: "AmountTooLarge" };
  }

  return {
    success: true,
    data: {
      month,
      amount,
    },
  };
}

/**
 * Get the payment month of the extra payment
 */
export function getPaymentMonth(extraPayment: ExtraPayment): PaymentMonth {
  return extraPayment.month;
}

/**
 * Get the amount of the extra payment
 */
export function getAmount(extraPayment: ExtraPayment): Money {
  return extraPayment.amount;
}

/**
 * Get extra payment amount as euros
 */
export function getAmountAsEuros(extraPayment: ExtraPayment): number {
  return toEuros(extraPayment.amount);
}

/**
 * Get extra payment month as number
 */
export function getMonthAsNumber(extraPayment: ExtraPayment): number {
  return paymentMonthToNumber(extraPayment.month);
}

/**
 * Compare extra payments by month
 */
export function compareExtraPaymentsByMonth(
  a: ExtraPayment,
  b: ExtraPayment
): number {
  return getMonthAsNumber(a) - getMonthAsNumber(b);
}

/**
 * Compare extra payments by amount
 */
export function compareExtraPaymentsByAmount(
  a: ExtraPayment,
  b: ExtraPayment
): number {
  return getAmountAsEuros(a) - getAmountAsEuros(b);
}

/**
 * Check if extra payments are in the same month
 */
export function isSameMonth(a: ExtraPayment, b: ExtraPayment): boolean {
  return getMonthAsNumber(a) === getMonthAsNumber(b);
}

/**
 * Check if extra payments are equal
 */
export function isEqualExtraPayment(a: ExtraPayment, b: ExtraPayment): boolean {
  return (
    getMonthAsNumber(a) === getMonthAsNumber(b) &&
    getAmountAsEuros(a) === getAmountAsEuros(b)
  );
}

/**
 * Combine extra payments in the same month
 */
export function combineExtraPayments(
  payment1: ExtraPayment,
  payment2: ExtraPayment
): Result<ExtraPayment, ExtraPaymentValidationError> {
  if (!isSameMonth(payment1, payment2)) {
    return { success: false, error: "InvalidPaymentMonth" };
  }

  const combinedAmountResult = addMoney(payment1.amount, payment2.amount);
  if (!combinedAmountResult.success) {
    return { success: false, error: "InvalidAmount" };
  }

  return createExtraPaymentFromMoney(payment1.month, combinedAmountResult.data);
}

/**
 * Format extra payment for display
 */
export function formatExtraPayment(extraPayment: ExtraPayment): string {
  const month = formatPaymentMonth(extraPayment.month);
  const amount = formatMoney(extraPayment.amount);

  return `Sondertilgung: ${amount} in ${month}`;
}

/**
 * Format extra payment in short form
 */
export function formatExtraPaymentShort(extraPayment: ExtraPayment): string {
  const monthNumber = getMonthAsNumber(extraPayment);
  const amount = formatMoney(extraPayment.amount);

  return `${amount} (Monat ${monthNumber})`;
}

/**
 * Check if extra payment is in first year
 */
export function isInFirstYear(extraPayment: ExtraPayment): boolean {
  return getMonthAsNumber(extraPayment) <= 12;
}

/**
 * Check if extra payment is large (>= €10,000)
 */
export function isLargeExtraPayment(extraPayment: ExtraPayment): boolean {
  return getAmountAsEuros(extraPayment) >= 10000;
}

/**
 * Check if extra payment is small (< €1,000)
 */
export function isSmallExtraPayment(extraPayment: ExtraPayment): boolean {
  return getAmountAsEuros(extraPayment) < 1000;
}

/**
 * Calculate total amount from array of extra payments
 */
export function calculateTotalExtraPayments(
  extraPayments: ExtraPayment[]
): Result<Money, ExtraPaymentValidationError> {
  if (extraPayments.length === 0) {
    const zeroResult = createMoney(0);
    if (!zeroResult.success) {
      return { success: false, error: "InvalidAmount" };
    }
    return zeroResult;
  }

  let total = extraPayments[0].amount;

  for (let i = 1; i < extraPayments.length; i++) {
    const addResult = addMoney(total, extraPayments[i].amount);
    if (!addResult.success) {
      return { success: false, error: "InvalidAmount" };
    }
    total = addResult.data;
  }

  return { success: true, data: total };
}

/**
 * Group extra payments by month (combining amounts for same month)
 */
export function groupExtraPaymentsByMonth(
  extraPayments: ExtraPayment[]
): Result<ExtraPayment[], ExtraPaymentValidationError> {
  if (extraPayments.length === 0) {
    return { success: true, data: [] };
  }

  // Sort by month first
  const sortedPayments = [...extraPayments].sort(compareExtraPaymentsByMonth);
  const grouped: ExtraPayment[] = [];

  let currentPayment = sortedPayments[0];

  for (let i = 1; i < sortedPayments.length; i++) {
    const nextPayment = sortedPayments[i];

    if (isSameMonth(currentPayment, nextPayment)) {
      // Combine payments in same month
      const combinedResult = combineExtraPayments(currentPayment, nextPayment);
      if (!combinedResult.success) {
        return combinedResult;
      }
      currentPayment = combinedResult.data;
    } else {
      // Different month, add current to results and start new
      grouped.push(currentPayment);
      currentPayment = nextPayment;
    }
  }

  // Add the last payment
  grouped.push(currentPayment);

  return { success: true, data: grouped };
}

/**
 * Filter extra payments by year
 */
export function filterExtraPaymentsByYear(
  extraPayments: ExtraPayment[],
  year: number
): ExtraPayment[] {
  return extraPayments.filter((payment) => {
    const monthNumber = getMonthAsNumber(payment);
    const paymentYear = Math.ceil(monthNumber / 12);
    return paymentYear === year;
  });
}

/**
 * Get minimum extra payment amount
 */
export function getMinimumExtraPaymentAmount(): number {
  return MIN_EXTRA_PAYMENT;
}

/**
 * Get maximum extra payment amount
 */
export function getMaximumExtraPaymentAmount(): number {
  return MAX_EXTRA_PAYMENT;
}

/**
 * Check if amount is valid for extra payment
 */
export function isValidExtraPaymentAmount(amount: number): boolean {
  return amount >= MIN_EXTRA_PAYMENT && amount <= MAX_EXTRA_PAYMENT;
}
