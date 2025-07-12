/**
 * Pure Calculation Functions for Mortgage Mathematics
 *
 * These are the core mathematical functions that power all mortgage calculations.
 * They operate on domain types and return precise financial calculations.
 * All functions are pure (no side effects) and thoroughly tested.
 */

import { Result } from "../primitives/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { MonthlyPayment } from "../types/MonthlyPayment";
import { createMonthlyPayment } from "../types/MonthlyPayment";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { LoanAmount } from "../value-objects/LoanAmount";
import { toNumber as loanAmountToNumber } from "../value-objects/LoanAmount";
import type { InterestRate } from "../value-objects/InterestRate";
import { createInterestRate, toDecimal } from "../value-objects/InterestRate";
import type { MonthCount } from "../value-objects/MonthCount";
import {
  createMonthCount,
  toNumber as monthCountToNumber,
} from "../value-objects/MonthCount";

/**
 * Calculation errors for loan mathematics
 */
export type LoanCalculationError =
  | "InvalidLoanConfiguration"
  | "MathematicalError"
  | "InsufficientPayment"
  | "PaymentTooHigh"
  | "InvalidParameters";

/**
 * Calculate monthly payment for a loan configuration
 * Uses the standard loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
 * Where: P = payment, L = loan amount, c = monthly rate, n = number of payments
 */
export function calculateMonthlyPayment(
  loanConfiguration: LoanConfiguration
): Result<MonthlyPayment, LoanCalculationError> {
  try {
    const loanAmount = loanAmountToNumber(loanConfiguration.amount);
    const annualRate = toDecimal(loanConfiguration.annualRate);
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    // Handle special case: 0% interest rate
    if (annualRate === 0) {
      const monthlyPayment = loanAmount / termInMonths;
      const paymentResult = createMonthlyPayment(monthlyPayment, 0);
      if (!paymentResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return paymentResult;
    }

    // Calculate monthly interest rate
    const monthlyRate = annualRate / 12;

    // Apply loan payment formula
    const numerator =
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths));
    const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1;

    if (denominator === 0) {
      return { success: false, error: "MathematicalError" };
    }

    const monthlyPaymentAmount = numerator / denominator;

    // Calculate first month's interest and principal breakdown
    const firstMonthInterest = loanAmount * monthlyRate;
    const firstMonthPrincipal = monthlyPaymentAmount - firstMonthInterest;

    const paymentResult = createMonthlyPayment(
      firstMonthPrincipal,
      firstMonthInterest
    );
    if (!paymentResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return paymentResult;
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate loan term given amount, rate, and payment
 * Uses the formula: n = -log(1 - (L * c / P)) / log(1 + c)
 * Where: n = number of payments, L = loan amount, c = monthly rate, P = payment
 */
export function calculateLoanTerm(
  loanAmount: LoanAmount,
  annualRate: InterestRate,
  monthlyPayment: Money
): Result<MonthCount, LoanCalculationError> {
  try {
    const amount = loanAmountToNumber(loanAmount);
    const rate = toDecimal(annualRate);
    const payment = toEuros(monthlyPayment);

    // Validate payment is sufficient
    if (payment <= 0) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Handle special case: 0% interest rate
    if (rate === 0) {
      const months = Math.ceil(amount / payment);
      const monthCountResult = createMonthCount(months);
      if (!monthCountResult.success) {
        return { success: false, error: "InvalidParameters" };
      }
      return monthCountResult;
    }

    const monthlyRate = rate / 12;

    // Check if payment is sufficient to cover interest
    const monthlyInterest = amount * monthlyRate;
    if (payment <= monthlyInterest) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Apply loan term formula
    const ratio = (amount * monthlyRate) / payment;
    const termInMonths = -Math.log(1 - ratio) / Math.log(1 + monthlyRate);

    // Validate result
    if (!isFinite(termInMonths) || termInMonths <= 0) {
      return { success: false, error: "MathematicalError" };
    }

    const roundedMonths = Math.ceil(termInMonths);
    const monthCountResult = createMonthCount(roundedMonths);
    if (!monthCountResult.success) {
      return { success: false, error: "InvalidParameters" };
    }
    return monthCountResult;
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate interest rate given amount, payment, and term
 * Uses numerical approximation (Newton's method) since there's no closed form
 */
export function calculateInterestRate(
  loanAmount: LoanAmount,
  monthlyPayment: Money,
  termInMonths: MonthCount
): Result<InterestRate, LoanCalculationError> {
  try {
    const amount = loanAmountToNumber(loanAmount);
    const payment = toEuros(monthlyPayment);
    const months = monthCountToNumber(termInMonths);

    // Validate inputs
    if (payment <= 0 || months <= 0 || amount <= 0) {
      return { success: false, error: "InvalidParameters" };
    }

    // Check if payment matches 0% interest scenario
    const zeroInterestPayment = amount / months;
    if (Math.abs(payment - zeroInterestPayment) < 0.01) {
      const rateResult = createInterestRate(0);
      if (!rateResult.success) {
        return { success: false, error: "InvalidParameters" };
      }
      return rateResult;
    }

    // Check if payment is reasonable
    if (payment < zeroInterestPayment) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Use Newton's method to find the interest rate
    let rate = 0.05; // Initial guess: 5%
    const maxIterations = 100;
    const tolerance = 0.000001;

    for (let i = 0; i < maxIterations; i++) {
      const monthlyRate = rate / 12;

      if (monthlyRate === 0) {
        rate = 0.000001; // Avoid division by zero
        continue;
      }

      // Calculate payment with current rate
      const factor = Math.pow(1 + monthlyRate, months);
      const calculatedPayment =
        (amount * (monthlyRate * factor)) / (factor - 1);

      // Calculate derivative for Newton's method
      const derivative = calculatePaymentDerivative(
        amount,
        months,
        monthlyRate
      );

      if (derivative === 0) {
        return { success: false, error: "MathematicalError" };
      }

      const error = calculatedPayment - payment;
      const newRate = rate - error / derivative;

      if (Math.abs(newRate - rate) < tolerance) {
        const annualRate = newRate * 100; // Convert to percentage
        const rateResult = createInterestRate(annualRate);
        if (!rateResult.success) {
          return { success: false, error: "InvalidParameters" };
        }
        return rateResult;
      }

      rate = Math.max(0.0001, Math.min(25, newRate)); // Keep rate in reasonable bounds
    }

    return { success: false, error: "MathematicalError" };
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Helper function to calculate derivative for Newton's method
 */
function calculatePaymentDerivative(
  amount: number,
  months: number,
  monthlyRate: number
): number {
  const factor = Math.pow(1 + monthlyRate, months);
  const numerator = amount * months * factor;
  const denominator = 12 * Math.pow(factor - 1, 2);

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  loanConfiguration: LoanConfiguration
): Result<Money, LoanCalculationError> {
  try {
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfiguration);
    if (!monthlyPaymentResult.success) {
      return { success: false, error: monthlyPaymentResult.error };
    }

    const monthlyPaymentAmount = toEuros(monthlyPaymentResult.data.total);
    const loanAmount = loanAmountToNumber(loanConfiguration.amount);
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    const totalPayments = monthlyPaymentAmount * termInMonths;
    const totalInterest = totalPayments - loanAmount;

    const moneyResult = createMoney(totalInterest);
    if (!moneyResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return moneyResult;
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate remaining balance after a number of payments
 */
export function calculateRemainingBalance(
  loanConfiguration: LoanConfiguration,
  paymentsMade: number
): Result<Money, LoanCalculationError> {
  try {
    if (paymentsMade < 0) {
      return { success: false, error: "InvalidParameters" };
    }

    const loanAmount = loanAmountToNumber(loanConfiguration.amount);
    const annualRate = toDecimal(loanConfiguration.annualRate);
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    if (paymentsMade >= termInMonths) {
      const zeroResult = createMoney(0); // Loan is paid off
      if (!zeroResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return zeroResult;
    }

    if (annualRate === 0) {
      // Simple calculation for 0% interest
      const monthlyPrincipal = loanAmount / termInMonths;
      const remainingBalance = loanAmount - monthlyPrincipal * paymentsMade;
      const balanceResult = createMoney(Math.max(0, remainingBalance));
      if (!balanceResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return balanceResult;
    }

    const monthlyRate = annualRate / 12;
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfiguration);

    if (!monthlyPaymentResult.success) {
      return { success: false, error: monthlyPaymentResult.error };
    }

    const monthlyPaymentAmount = toEuros(monthlyPaymentResult.data.total);

    // Calculate remaining balance using amortization formula
    const factor1 = Math.pow(1 + monthlyRate, termInMonths);
    const factor2 = Math.pow(1 + monthlyRate, paymentsMade);

    const remainingBalance = (loanAmount * (factor1 - factor2)) / (factor1 - 1);

    const balanceResult = createMoney(Math.max(0, remainingBalance));
    if (!balanceResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return balanceResult;
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate break-even point for refinancing
 */
export function calculateBreakEvenPoint(
  currentLoan: LoanConfiguration,
  newLoan: LoanConfiguration,
  refinancingCosts: Money
): Result<MonthCount, LoanCalculationError> {
  try {
    const currentPaymentResult = calculateMonthlyPayment(currentLoan);
    const newPaymentResult = calculateMonthlyPayment(newLoan);

    if (!currentPaymentResult.success) {
      return { success: false, error: currentPaymentResult.error };
    }
    if (!newPaymentResult.success) {
      return { success: false, error: newPaymentResult.error };
    }

    const currentPayment = toEuros(currentPaymentResult.data.total);
    const newPayment = toEuros(newPaymentResult.data.total);
    const costs = toEuros(refinancingCosts);

    if (currentPayment <= newPayment) {
      return { success: false, error: "InsufficientPayment" }; // No savings
    }

    const monthlySavings = currentPayment - newPayment;
    const breakEvenMonths = Math.ceil(costs / monthlySavings);

    const monthCountResult = createMonthCount(breakEvenMonths);
    if (!monthCountResult.success) {
      return { success: false, error: "InvalidParameters" };
    }
    return monthCountResult;
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate payment for different loan scenarios (what-if analysis)
 */
export function calculatePaymentScenarios(
  baseLoan: LoanConfiguration,
  scenarios: {
    amountMultiplier?: number;
    rateAdjustment?: number; // In percentage points
    termAdjustment?: number; // In months
  }[]
): Result<MonthlyPayment[], LoanCalculationError> {
  try {
    const results: MonthlyPayment[] = [];

    for (const scenario of scenarios) {
      // Adjust loan amount
      let adjustedAmount = loanAmountToNumber(baseLoan.amount);
      if (scenario.amountMultiplier) {
        adjustedAmount *= scenario.amountMultiplier;
      }

      // Adjust interest rate
      let adjustedRate = toDecimal(baseLoan.annualRate) * 100; // Convert to percentage
      if (scenario.rateAdjustment) {
        adjustedRate += scenario.rateAdjustment;
      }

      // Adjust term
      let adjustedTerm = monthCountToNumber(baseLoan.termInMonths);
      if (scenario.termAdjustment) {
        adjustedTerm += scenario.termAdjustment;
      }

      // Create adjusted loan configuration
      const loanAmountResult = createMoney(adjustedAmount);
      const interestRateResult = createInterestRate(adjustedRate);
      const termResult = createMonthCount(adjustedTerm);

      if (
        !loanAmountResult.success ||
        !interestRateResult.success ||
        !termResult.success
      ) {
        return { success: false, error: "InvalidParameters" };
      }

      // Calculate payment for this scenario
      const scenarioLoan: LoanConfiguration = {
        amount: loanAmountResult.data as LoanAmount,
        annualRate: interestRateResult.data,
        termInMonths: termResult.data,
        monthlyPayment: baseLoan.monthlyPayment, // Will be recalculated
      };

      const paymentResult = calculateMonthlyPayment(scenarioLoan);
      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error };
      }

      results.push(paymentResult.data);
    }

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: "MathematicalError" };
  }
}
