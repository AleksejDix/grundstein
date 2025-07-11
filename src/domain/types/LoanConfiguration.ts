/**
 * LoanConfiguration domain types
 * Composite types that bring together foundation value types into meaningful business entities
 */

import { Result } from "./Brand";
import type { LoanAmount } from "./LoanAmount";
import {
  createLoanAmount,
  toMoney as loanAmountToMoney,
  formatLoanAmount,
} from "./LoanAmount";
import type { InterestRate } from "./InterestRate";
import {
  createInterestRate,
  toNumber as interestRateToNumber,
  toMonthlyRate,
  formatInterestRate,
} from "./InterestRate";
import type { MonthCount } from "./MonthCount";
import {
  createMonthCount,
  toNumber as monthCountToNumber,
  formatMonthCount,
} from "./MonthCount";
import type { YearCount } from "./YearCount";
import { createYearCount, toMonths } from "./YearCount";
import type { Money } from "./Money";
import { createMoney, toEuros as moneyToEuros, formatMoney } from "./Money";

// Core loan configuration combining all loan parameters
export type LoanConfiguration = {
  readonly amount: LoanAmount;
  readonly annualRate: InterestRate;
  readonly termInMonths: MonthCount;
  readonly monthlyPayment: Money;
};

// Validation errors for loan configuration
export type LoanConfigurationValidationError =
  | "InvalidLoanAmount"
  | "InvalidInterestRate"
  | "InvalidTerm"
  | "InvalidMonthlyPayment"
  | "InconsistentParameters"
  | "PaymentTooLow"
  | "PaymentTooHigh";

// Input parameters for creating loan configurations
export type LoanConfigurationInput = {
  amount?: number;
  annualRate?: number;
  termInMonths?: number;
  termInYears?: number;
  monthlyPayment?: number;
};

// Locked parameter configuration for recalculation scenarios
export type LockedParameters = {
  readonly amount: boolean;
  readonly rate: boolean;
  readonly term: boolean;
  readonly payment: boolean;
};

// Loan scenario for comparison purposes
export type LoanScenario = {
  readonly name: string;
  readonly configuration: LoanConfiguration;
  readonly description?: string;
};

/**
 * Create a loan configuration from validated domain types
 */
export function createLoanConfiguration(
  amount: LoanAmount,
  annualRate: InterestRate,
  termInMonths: MonthCount,
  monthlyPayment: Money
): Result<LoanConfiguration, LoanConfigurationValidationError> {
  // Basic mathematical validation - ensure parameters are consistent
  const isConsistent = validateParameterConsistency(
    amount,
    annualRate,
    termInMonths,
    monthlyPayment
  );

  if (!isConsistent) {
    return { success: false, error: "InconsistentParameters" };
  }

  return {
    success: true,
    data: {
      amount,
      annualRate,
      termInMonths,
      monthlyPayment,
    },
  };
}

/**
 * Create loan configuration from raw input values
 */
export function createLoanConfigurationFromInput(
  input: LoanConfigurationInput
): Result<LoanConfiguration, LoanConfigurationValidationError> {
  // Validate required parameters are present
  const requiredParams = [input.amount, input.annualRate, input.monthlyPayment];
  const termProvided =
    input.termInMonths !== undefined || input.termInYears !== undefined;

  if (!requiredParams.every((p) => p !== undefined) || !termProvided) {
    return { success: false, error: "InconsistentParameters" };
  }

  // Create value objects from input
  const amountResult = createLoanAmount(input.amount!);
  if (!amountResult.success) {
    return { success: false, error: "InvalidLoanAmount" };
  }

  const rateResult = createInterestRate(input.annualRate!);
  if (!rateResult.success) {
    return { success: false, error: "InvalidInterestRate" };
  }

  // Determine term (prefer months over years if both provided)
  let termResult;
  if (input.termInMonths !== undefined) {
    termResult = createMonthCount(input.termInMonths);
  } else {
    const yearResult = createYearCount(input.termInYears!);
    if (!yearResult.success) {
      return { success: false, error: "InvalidTerm" };
    }
    termResult = createMonthCount(toMonths(yearResult.data));
  }

  if (!termResult.success) {
    return { success: false, error: "InvalidTerm" };
  }

  const paymentResult = createMoney(input.monthlyPayment!);
  if (!paymentResult.success) {
    return { success: false, error: "InvalidMonthlyPayment" };
  }

  // Create final configuration with validation
  return createLoanConfiguration(
    amountResult.data,
    rateResult.data,
    termResult.data,
    paymentResult.data
  );
}

/**
 * Validate that loan parameters are mathematically consistent
 * Uses basic loan formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 * Where: P = payment, L = loan amount, c = monthly rate, n = number of payments
 */
function validateParameterConsistency(
  amount: LoanAmount,
  annualRate: InterestRate,
  termInMonths: MonthCount,
  monthlyPayment: Money
): boolean {
  const principal = loanAmountToMoney(amount);
  const monthlyRate = toMonthlyRate(annualRate);
  const numberOfPayments = monthCountToNumber(termInMonths);
  const payment = moneyToEuros(monthlyPayment);

  // Handle edge case: zero interest rate
  if (monthlyRate === 0) {
    const expectedPayment = moneyToEuros(principal) / numberOfPayments;
    const tolerance = 0.01; // €0.01 tolerance
    return Math.abs(payment - expectedPayment) <= tolerance;
  }

  // Standard loan payment calculation
  const factor = Math.pow(1 + monthlyRate, numberOfPayments);
  const expectedPayment =
    (moneyToEuros(principal) * monthlyRate * factor) / (factor - 1);

  // Allow for small rounding differences (€1 tolerance)
  const tolerance = 1.0;
  return Math.abs(payment - expectedPayment) <= tolerance;
}

/**
 * Get loan configuration parameters as numbers for calculations
 */
export function getLoanParameters(config: LoanConfiguration) {
  return {
    amount: moneyToEuros(loanAmountToMoney(config.amount)),
    annualRate: interestRateToNumber(config.annualRate),
    monthlyRate: toMonthlyRate(config.annualRate),
    termInMonths: monthCountToNumber(config.termInMonths),
    monthlyPayment: moneyToEuros(config.monthlyPayment),
  };
}

/**
 * Format loan configuration for display
 */
export function formatLoanConfiguration(config: LoanConfiguration): string {
  const amount = formatLoanAmount(config.amount);
  const rate = formatInterestRate(config.annualRate);
  const term = formatMonthCount(config.termInMonths);
  const payment = formatMoney(config.monthlyPayment);

  return `Darlehen: ${amount}, Zinssatz: ${rate}, Laufzeit: ${term}, Monatliche Rate: ${payment}`;
}

/**
 * Compare two loan configurations
 */
export function compareLoanConfigurations(
  a: LoanConfiguration,
  b: LoanConfiguration
) {
  const paramsA = getLoanParameters(a);
  const paramsB = getLoanParameters(b);

  return {
    amountDifference: paramsB.amount - paramsA.amount,
    rateDifference: paramsB.annualRate - paramsA.annualRate,
    termDifference: paramsB.termInMonths - paramsA.termInMonths,
    paymentDifference: paramsB.monthlyPayment - paramsA.monthlyPayment,
  };
}

/**
 * Create a loan scenario for comparison
 */
export function createLoanScenario(
  name: string,
  configuration: LoanConfiguration,
  description?: string
): LoanScenario {
  return {
    name,
    configuration,
    description,
  };
}

/**
 * Common loan configuration presets for German market
 */
export const LOAN_PRESETS = {
  TYPICAL_FIRST_HOME: {
    amount: 300000, // €300k
    annualRate: 3.5, // 3.5%
    termInYears: 25, // 25 years
  },

  LUXURY_HOME: {
    amount: 800000, // €800k
    annualRate: 3.8, // 3.8%
    termInYears: 30, // 30 years
  },

  INVESTMENT_PROPERTY: {
    amount: 500000, // €500k
    annualRate: 4.2, // 4.2%
    termInYears: 20, // 20 years
  },
} as const;
