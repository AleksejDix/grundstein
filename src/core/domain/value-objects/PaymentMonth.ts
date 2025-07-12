/**
 * PaymentMonth domain-specific value type
 * Represents a month number in a payment schedule:
 * - Month 1 = first payment
 * - Month 12 = end of first year
 * - Used for scheduling extra payments and tracking payment position
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { PositiveInteger } from "./PositiveInteger";
import {
  createPositiveInteger,
  toNumber as positiveIntegerToNumber,
} from "./PositiveInteger";

// Branded PaymentMonth type - semantically different from regular PositiveInteger
export type PaymentMonth = Branded<PositiveInteger, "PaymentMonth">;

export type PaymentMonthValidationError =
  | "PositiveIntegerValidationError"
  | "InvalidPaymentMonth";

// Business constants for payment month limits
const MIN_PAYMENT_MONTH = 1; // First payment month
const MAX_PAYMENT_MONTH = 480; // Maximum loan term (40 years)

/**
 * Smart constructor for PaymentMonth type
 * @param month - Month number in payment schedule (1-based)
 * @returns Result with either valid PaymentMonth or validation error
 */
export function createPaymentMonth(
  month: number
): Result<PaymentMonth, PaymentMonthValidationError> {
  // First validate as PositiveInteger
  const positiveIntegerResult = createPositiveInteger(month);
  if (!positiveIntegerResult.success) {
    return { success: false, error: "PositiveIntegerValidationError" };
  }

  const monthValue = positiveIntegerToNumber(positiveIntegerResult.data);

  // Apply payment month specific business rules
  if (monthValue < MIN_PAYMENT_MONTH || monthValue > MAX_PAYMENT_MONTH) {
    return { success: false, error: "InvalidPaymentMonth" };
  }

  return {
    success: true,
    data: positiveIntegerResult.data as PaymentMonth, // Safe cast after validation
  };
}

/**
 * Convert PaymentMonth to underlying PositiveInteger type
 */
export function toPositiveInteger(paymentMonth: PaymentMonth): PositiveInteger {
  return paymentMonth as PositiveInteger;
}

/**
 * Get the payment month value as a number
 */
export function toNumber(paymentMonth: PaymentMonth): number {
  return positiveIntegerToNumber(toPositiveInteger(paymentMonth));
}

/**
 * Calculate which year this payment month falls in
 */
export function getPaymentYear(paymentMonth: PaymentMonth): number {
  return Math.ceil(toNumber(paymentMonth) / 12);
}

/**
 * Calculate month within the year (1-12)
 */
export function getMonthInYear(paymentMonth: PaymentMonth): number {
  const month = toNumber(paymentMonth);
  const monthInYear = month % 12;
  return monthInYear === 0 ? 12 : monthInYear;
}

/**
 * Create PaymentMonth from year and month
 */
export function fromYearAndMonth(
  year: number,
  monthInYear: number
): Result<PaymentMonth, PaymentMonthValidationError> {
  if (year < 1 || year > 40 || monthInYear < 1 || monthInYear > 12) {
    return { success: false, error: "InvalidPaymentMonth" };
  }

  const paymentMonthNumber = (year - 1) * 12 + monthInYear;
  return createPaymentMonth(paymentMonthNumber);
}

/**
 * Add months to payment month
 */
export function addMonths(
  paymentMonth: PaymentMonth,
  monthsToAdd: number
): Result<PaymentMonth, PaymentMonthValidationError> {
  const newMonth = toNumber(paymentMonth) + monthsToAdd;
  return createPaymentMonth(newMonth);
}

/**
 * Check if payment month is in first year
 */
export function isFirstYear(paymentMonth: PaymentMonth): boolean {
  return toNumber(paymentMonth) <= 12;
}

/**
 * Check if payment month is end of year (December payment)
 */
export function isEndOfYear(paymentMonth: PaymentMonth): boolean {
  return getMonthInYear(paymentMonth) === 12;
}

/**
 * Compare payment months
 */
export function comparePaymentMonth(a: PaymentMonth, b: PaymentMonth): number {
  return toNumber(a) - toNumber(b);
}

/**
 * Check if payment months are equal
 */
export function isEqualPaymentMonth(a: PaymentMonth, b: PaymentMonth): boolean {
  return toNumber(a) === toNumber(b);
}

/**
 * Format payment month for display
 */
export function formatPaymentMonth(paymentMonth: PaymentMonth): string {
  const year = getPaymentYear(paymentMonth);
  const month = getMonthInYear(paymentMonth);

  return `Monat ${toNumber(paymentMonth)} (Jahr ${year}, ${month}. Monat)`;
}

/**
 * Get minimum payment month (first payment)
 */
export function getFirstPaymentMonth(): PaymentMonth {
  const result = createPaymentMonth(MIN_PAYMENT_MONTH);
  if (!result.success) {
    throw new Error(
      "Failed to create first payment month - this should never happen"
    );
  }
  return result.data;
}

/**
 * Get maximum payment month
 */
export function getMaximumPaymentMonth(): PaymentMonth {
  const result = createPaymentMonth(MAX_PAYMENT_MONTH);
  if (!result.success) {
    throw new Error(
      "Failed to create maximum payment month - this should never happen"
    );
  }
  return result.data;
}

/**
 * Check if month number is within valid payment month range
 */
export function isValidPaymentMonthRange(month: number): boolean {
  return (
    month >= MIN_PAYMENT_MONTH &&
    month <= MAX_PAYMENT_MONTH &&
    Number.isInteger(month)
  );
}

/**
 * Common payment month constants
 */
export const FIRST_PAYMENT: PaymentMonth = (() => {
  const result = createPaymentMonth(1);
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const END_OF_FIRST_YEAR: PaymentMonth = (() => {
  const result = createPaymentMonth(12);
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();

export const END_OF_FIFTH_YEAR: PaymentMonth = (() => {
  const result = createPaymentMonth(60);
  if (!result.success) throw new Error("Failed to create constant");
  return result.data;
})();
