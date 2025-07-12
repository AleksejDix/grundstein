/**
 * Structured Error Types for Amortization Engine
 * 
 * Replaces generic string errors with rich context for debugging
 */

import { Result } from "../primitives/Brand";

/**
 * Base error interface with context
 */
export interface AmortizationErrorBase {
  readonly type: string;
  readonly message: string;
  readonly operation: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: AmortizationErrorBase;
}

/**
 * Payment month creation failed
 */
export interface PaymentMonthCreationError extends AmortizationErrorBase {
  readonly type: "PaymentMonthCreationError";
  readonly context: {
    readonly monthNumber: number;
    readonly minAllowed: number;
    readonly maxAllowed: number;
  };
}

/**
 * Money value creation failed
 */
export interface MoneyCreationError extends AmortizationErrorBase {
  readonly type: "MoneyCreationError";
  readonly context: {
    readonly value: number;
    readonly reason: "negative" | "exceeds_maximum" | "invalid";
    readonly maxAllowed?: number;
  };
}

/**
 * Monthly payment calculation failed
 */
export interface MonthlyPaymentCalculationError extends AmortizationErrorBase {
  readonly type: "MonthlyPaymentCalculationError";
  readonly context: {
    readonly principal: number;
    readonly interest: number;
    readonly total: number;
    readonly loanAmount: number;
    readonly monthlyRate: number;
  };
}

/**
 * Percentage validation failed
 */
export interface PercentageValidationError extends AmortizationErrorBase {
  readonly type: "PercentageValidationError";
  readonly context: {
    readonly value: number;
    readonly minAllowed: number;
    readonly maxAllowed: number;
  };
}

/**
 * Remaining months calculation failed
 */
export interface RemainingMonthsCalculationError extends AmortizationErrorBase {
  readonly type: "RemainingMonthsCalculationError";
  readonly context: {
    readonly currentBalance: number;
    readonly monthlyRate: number;
    readonly paymentAmount: number;
    readonly estimatedMonths: number;
  };
}

/**
 * Union of all specific amortization errors
 */
export type AmortizationError = 
  | PaymentMonthCreationError
  | MoneyCreationError 
  | MonthlyPaymentCalculationError
  | PercentageValidationError
  | RemainingMonthsCalculationError;

/**
 * Create a payment month creation error
 */
export function createPaymentMonthCreationError(
  monthNumber: number,
  operation: string,
  cause?: AmortizationErrorBase
): PaymentMonthCreationError {
  return {
    type: "PaymentMonthCreationError",
    message: `Failed to create payment month ${monthNumber}. Must be between 1 and 480.`,
    operation,
    context: {
      monthNumber,
      minAllowed: 1,
      maxAllowed: 480,
    },
    cause,
  };
}

/**
 * Create a money creation error
 */
export function createMoneyCreationError(
  value: number,
  reason: "negative" | "exceeds_maximum" | "invalid",
  operation: string,
  cause?: AmortizationErrorBase
): MoneyCreationError {
  const maxAllowed = reason === "exceeds_maximum" ? 999_999_999 : undefined;
  
  return {
    type: "MoneyCreationError",
    message: `Failed to create money value ${value}. Reason: ${reason}`,
    operation,
    context: {
      value,
      reason,
      maxAllowed,
    },
    cause,
  };
}

/**
 * Create a monthly payment calculation error
 */
export function createMonthlyPaymentCalculationError(
  principal: number,
  interest: number,
  loanAmount: number,
  monthlyRate: number,
  operation: string,
  cause?: AmortizationErrorBase
): MonthlyPaymentCalculationError {
  return {
    type: "MonthlyPaymentCalculationError",
    message: `Failed to calculate monthly payment. Principal: ${principal}, Interest: ${interest}`,
    operation,
    context: {
      principal,
      interest,
      total: principal + interest,
      loanAmount,
      monthlyRate,
    },
    cause,
  };
}

/**
 * Create a percentage validation error
 */
export function createPercentageValidationError(
  value: number,
  operation: string,
  cause?: AmortizationErrorBase
): PercentageValidationError {
  return {
    type: "PercentageValidationError",
    message: `Invalid percentage value ${value}. Must be between 0 and 100.`,
    operation,
    context: {
      value,
      minAllowed: 0,
      maxAllowed: 100,
    },
    cause,
  };
}

/**
 * Create a remaining months calculation error
 */
export function createRemainingMonthsCalculationError(
  currentBalance: number,
  monthlyRate: number,
  paymentAmount: number,
  estimatedMonths: number,
  operation: string,
  cause?: AmortizationErrorBase
): RemainingMonthsCalculationError {
  return {
    type: "RemainingMonthsCalculationError",
    message: `Failed to calculate remaining months. Balance: ${currentBalance}, Rate: ${monthlyRate}, Payment: ${paymentAmount}`,
    operation,
    context: {
      currentBalance,
      monthlyRate,
      paymentAmount,
      estimatedMonths,
    },
    cause,
  };
}

/**
 * Helper to format error for debugging
 */
export function formatAmortizationError(error: AmortizationError): string {
  const parts = [
    `❌ ${error.type} in ${error.operation}`,
    `   Message: ${error.message}`,
  ];

  if (error.context) {
    parts.push(`   Context: ${JSON.stringify(error.context, null, 2)}`);
  }

  if (error.cause) {
    parts.push(`   Caused by: ${formatAmortizationError(error.cause)}`);
  }

  return parts.join('\n');
}

/**
 * Result type using structured errors
 */
export type AmortizationResult<T> = Result<T, AmortizationError>;