/**
 * MonthlyPayment domain type
 * Represents the breakdown of a monthly mortgage payment:
 * - Principal: Amount going toward loan balance reduction
 * - Interest: Amount going toward interest charges
 * - Total: Sum of principal and interest (must equal monthly payment amount)
 */

import { Result } from "./Brand";
import type { Money } from "./Money";
import { createMoney, addMoney, toEuros, formatMoney } from "./Money";

// MonthlyPayment record type
export type MonthlyPayment = {
  readonly principal: Money;
  readonly interest: Money;
  readonly total: Money;
};

export type MonthlyPaymentValidationError =
  | "InvalidPrincipal"
  | "InvalidInterest"
  | "InvalidTotal"
  | "InconsistentAmounts"
  | "NegativeAmounts";

/**
 * Smart constructor for MonthlyPayment type
 * @param principal - Principal amount
 * @param interest - Interest amount
 * @returns Result with either valid MonthlyPayment or validation error
 */
export function createMonthlyPayment(
  principal: number,
  interest: number
): Result<MonthlyPayment, MonthlyPaymentValidationError> {
  // Validate individual amounts
  const principalResult = createMoney(principal);
  if (!principalResult.success) {
    return { success: false, error: "InvalidPrincipal" };
  }

  const interestResult = createMoney(interest);
  if (!interestResult.success) {
    return { success: false, error: "InvalidInterest" };
  }

  // Calculate total
  const totalResult = addMoney(principalResult.data, interestResult.data);
  if (!totalResult.success) {
    return { success: false, error: "InvalidTotal" };
  }

  return {
    success: true,
    data: {
      principal: principalResult.data,
      interest: interestResult.data,
      total: totalResult.data,
    },
  };
}

/**
 * Create MonthlyPayment from Money objects
 */
export function createMonthlyPaymentFromMoney(
  principal: Money,
  interest: Money
): Result<MonthlyPayment, MonthlyPaymentValidationError> {
  const totalResult = addMoney(principal, interest);
  if (!totalResult.success) {
    return { success: false, error: "InvalidTotal" };
  }

  return {
    success: true,
    data: {
      principal,
      interest,
      total: totalResult.data,
    },
  };
}

/**
 * Create MonthlyPayment with validation that total matches expected amount
 */
export function createMonthlyPaymentWithTotal(
  principal: number,
  interest: number,
  expectedTotal: number
): Result<MonthlyPayment, MonthlyPaymentValidationError> {
  const paymentResult = createMonthlyPayment(principal, interest);
  if (!paymentResult.success) {
    return paymentResult;
  }

  const totalAmount = toEuros(paymentResult.data.total);
  const tolerance = 0.01; // €0.01 tolerance for rounding

  if (Math.abs(totalAmount - expectedTotal) > tolerance) {
    return { success: false, error: "InconsistentAmounts" };
  }

  return paymentResult;
}

/**
 * Get principal amount as euros
 */
export function getPrincipalAmount(payment: MonthlyPayment): number {
  return toEuros(payment.principal);
}

/**
 * Get interest amount as euros
 */
export function getInterestAmount(payment: MonthlyPayment): number {
  return toEuros(payment.interest);
}

/**
 * Get total amount as euros
 */
export function getTotalAmount(payment: MonthlyPayment): number {
  return toEuros(payment.total);
}

/**
 * Calculate principal to interest ratio
 */
export function getPrincipalToInterestRatio(payment: MonthlyPayment): number {
  const interestAmount = getInterestAmount(payment);
  if (interestAmount === 0) {
    return Infinity; // All principal, no interest
  }
  return getPrincipalAmount(payment) / interestAmount;
}

/**
 * Calculate interest percentage of total payment
 */
export function getInterestPercentage(payment: MonthlyPayment): number {
  const totalAmount = getTotalAmount(payment);
  if (totalAmount === 0) {
    return 0;
  }
  return (getInterestAmount(payment) / totalAmount) * 100;
}

/**
 * Calculate principal percentage of total payment
 */
export function getPrincipalPercentage(payment: MonthlyPayment): number {
  const totalAmount = getTotalAmount(payment);
  if (totalAmount === 0) {
    return 0;
  }
  return (getPrincipalAmount(payment) / totalAmount) * 100;
}

/**
 * Add two monthly payments together
 */
export function addMonthlyPayments(
  payment1: MonthlyPayment,
  payment2: MonthlyPayment
): Result<MonthlyPayment, MonthlyPaymentValidationError> {
  const principalResult = addMoney(payment1.principal, payment2.principal);
  if (!principalResult.success) {
    return { success: false, error: "InvalidPrincipal" };
  }

  const interestResult = addMoney(payment1.interest, payment2.interest);
  if (!interestResult.success) {
    return { success: false, error: "InvalidInterest" };
  }

  return createMonthlyPaymentFromMoney(
    principalResult.data,
    interestResult.data
  );
}

/**
 * Compare monthly payments by total amount
 */
export function compareMonthlyPayments(
  a: MonthlyPayment,
  b: MonthlyPayment
): number {
  return getTotalAmount(a) - getTotalAmount(b);
}

/**
 * Check if monthly payments are equal
 */
export function isEqualMonthlyPayment(
  a: MonthlyPayment,
  b: MonthlyPayment
): boolean {
  return (
    toEuros(a.principal) === toEuros(b.principal) &&
    toEuros(a.interest) === toEuros(b.interest) &&
    toEuros(a.total) === toEuros(b.total)
  );
}

/**
 * Format monthly payment for display
 */
export function formatMonthlyPayment(payment: MonthlyPayment): string {
  const principal = formatMoney(payment.principal);
  const interest = formatMoney(payment.interest);
  const total = formatMoney(payment.total);

  return `Monatliche Rate: ${total} (Tilgung: ${principal}, Zinsen: ${interest})`;
}

/**
 * Format payment breakdown with percentages
 */
export function formatMonthlyPaymentBreakdown(payment: MonthlyPayment): string {
  const principal = formatMoney(payment.principal);
  const interest = formatMoney(payment.interest);
  const total = formatMoney(payment.total);
  const principalPct = getPrincipalPercentage(payment).toFixed(1);
  const interestPct = getInterestPercentage(payment).toFixed(1);

  return `${total} = ${principal} (${principalPct}% Tilgung) + ${interest} (${interestPct}% Zinsen)`;
}

/**
 * Check if payment is principal-heavy (more than 60% principal)
 */
export function isPrincipalHeavy(payment: MonthlyPayment): boolean {
  return getPrincipalPercentage(payment) > 60;
}

/**
 * Check if payment is interest-heavy (more than 60% interest)
 */
export function isInterestHeavy(payment: MonthlyPayment): boolean {
  return getInterestPercentage(payment) > 60;
}

/**
 * Create a zero monthly payment (useful for calculations)
 */
export function createZeroMonthlyPayment(): MonthlyPayment {
  const result = createMonthlyPayment(0, 0);
  if (!result.success) {
    throw new Error("Failed to create zero payment - this should never happen");
  }
  return result.data;
}
