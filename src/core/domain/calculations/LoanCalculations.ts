/**
 * Pure Calculation Functions for Mortgage Mathematics
 *
 * These are the core mathematical functions that power all mortgage calculations.
 * They operate on domain types and return precise financial calculations.
 * All functions are pure (no side effects) and thoroughly tested.
 * 
 * Uses decimal.js for arbitrary precision arithmetic to avoid floating-point errors.
 */

import { Decimal } from "decimal.js";
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

// Configure Decimal.js for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

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
  loanConfiguration: LoanConfiguration,
): Result<MonthlyPayment, LoanCalculationError> {
  try {
    const loanAmount = new Decimal(loanAmountToNumber(loanConfiguration.amount));
    const annualRate = new Decimal(toDecimal(loanConfiguration.annualRate));
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    // Handle special case: 0% interest rate
    if (annualRate.isZero()) {
      const monthlyPayment = loanAmount.dividedBy(termInMonths);
      const paymentResult = createMonthlyPayment(monthlyPayment.toNumber(), 0);
      if (!paymentResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return paymentResult;
    }

    // Calculate monthly interest rate
    const monthlyRate = annualRate.dividedBy(12);

    // Apply loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    const onePlusRate = monthlyRate.plus(1);
    const factor = onePlusRate.pow(termInMonths);
    const numerator = loanAmount.times(monthlyRate).times(factor);
    const denominator = factor.minus(1);

    if (denominator.isZero()) {
      return { success: false, error: "MathematicalError" };
    }

    const monthlyPaymentAmount = numerator.dividedBy(denominator);

    // Calculate first month's interest and principal breakdown
    const firstMonthInterest = loanAmount.times(monthlyRate);
    const firstMonthPrincipal = monthlyPaymentAmount.minus(firstMonthInterest);

    const paymentResult = createMonthlyPayment(
      firstMonthPrincipal.toNumber(),
      firstMonthInterest.toNumber(),
    );
    if (!paymentResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return paymentResult;
  } catch {
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
  monthlyPayment: Money,
): Result<MonthCount, LoanCalculationError> {
  try {
    const amount = new Decimal(loanAmountToNumber(loanAmount));
    const rate = new Decimal(toDecimal(annualRate));
    const payment = new Decimal(toEuros(monthlyPayment));

    // Validate payment is sufficient
    if (payment.isZero() || payment.isNegative()) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Handle special case: 0% interest rate
    if (rate.isZero()) {
      const months = amount.dividedBy(payment).ceil();
      const monthCountResult = createMonthCount(months.toNumber());
      if (!monthCountResult.success) {
        return { success: false, error: "InvalidParameters" };
      }
      return monthCountResult;
    }

    const monthlyRate = rate.dividedBy(12);

    // Check if payment is sufficient to cover interest
    const monthlyInterest = amount.times(monthlyRate);
    if (payment.lessThanOrEqualTo(monthlyInterest)) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Apply loan term formula: n = -ln(1 - (L * c / P)) / ln(1 + c)
    const ratio = amount.times(monthlyRate).dividedBy(payment);
    const onePlusRate = monthlyRate.plus(1);
    const termInMonths = Decimal.ln(Decimal.sub(1, ratio)).negated()
      .dividedBy(Decimal.ln(onePlusRate));

    // Validate result
    if (!termInMonths.isFinite() || termInMonths.isNegative() || termInMonths.isZero()) {
      return { success: false, error: "MathematicalError" };
    }

    const roundedMonths = termInMonths.ceil();
    const monthCountResult = createMonthCount(roundedMonths.toNumber());
    if (!monthCountResult.success) {
      return { success: false, error: "InvalidParameters" };
    }
    return monthCountResult;
  } catch {
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
  termInMonths: MonthCount,
): Result<InterestRate, LoanCalculationError> {
  try {
    const amount = new Decimal(loanAmountToNumber(loanAmount));
    const payment = new Decimal(toEuros(monthlyPayment));
    const months = monthCountToNumber(termInMonths);

    // Validate inputs
    if (payment.isZero() || payment.isNegative() || months <= 0 || amount.isZero() || amount.isNegative()) {
      return { success: false, error: "InvalidParameters" };
    }

    // Check if payment matches 0% interest scenario
    const zeroInterestPayment = amount.dividedBy(months);
    if (payment.minus(zeroInterestPayment).abs().lessThan(0.01)) {
      const rateResult = createInterestRate(0);
      if (!rateResult.success) {
        return { success: false, error: "InvalidParameters" };
      }
      return rateResult;
    }

    // Check if payment is reasonable
    if (payment.lessThan(zeroInterestPayment)) {
      return { success: false, error: "InsufficientPayment" };
    }

    // Use bisection method for more robust convergence
    let lowerBound = new Decimal(0.0001); // 0.01% annual
    let upperBound = new Decimal(0.30); // 30% annual
    const maxIterations = 50;
    const tolerance = new Decimal(0.01); // €0.01 tolerance on payment

    // Helper function to calculate payment for given annual rate
    const calculatePaymentForRate = (annualRate: Decimal): Decimal => {
      const monthlyRate = annualRate.dividedBy(12);
      const onePlusRate = monthlyRate.plus(1);
      const factor = onePlusRate.pow(months);
      const numerator = amount.times(monthlyRate).times(factor);
      const denominator = factor.minus(1);
      return numerator.dividedBy(denominator);
    };

    // Check if payment is feasible with the bounds
    const lowerPayment = calculatePaymentForRate(lowerBound);
    const upperPayment = calculatePaymentForRate(upperBound);
    
    if (payment.lessThan(lowerPayment) || payment.greaterThan(upperPayment)) {
      return { success: false, error: "MathematicalError" };
    }

    // Bisection method
    for (let i = 0; i < maxIterations; i++) {
      const midRate = lowerBound.plus(upperBound).dividedBy(2);
      const calculatedPayment = calculatePaymentForRate(midRate);
      const error = calculatedPayment.minus(payment);

      if (error.abs().lessThan(tolerance)) {
        const annualRatePercent = midRate.times(100); // Convert to percentage
        const rateResult = createInterestRate(annualRatePercent.toNumber());
        if (!rateResult.success) {
          return { success: false, error: "InvalidParameters" };
        }
        return rateResult;
      }

      if (error.isPositive()) {
        upperBound = midRate;
      } else {
        lowerBound = midRate;
      }
    }

    return { success: false, error: "MathematicalError" };
  } catch {
    return { success: false, error: "MathematicalError" };
  }
}


/**
 * Calculate total interest paid over the life of the loan
 */
export function calculateTotalInterest(
  loanConfiguration: LoanConfiguration,
): Result<Money, LoanCalculationError> {
  try {
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfiguration);
    if (!monthlyPaymentResult.success) {
      return { success: false, error: monthlyPaymentResult.error };
    }

    const monthlyPaymentAmount = new Decimal(toEuros(monthlyPaymentResult.data.total));
    const loanAmount = new Decimal(loanAmountToNumber(loanConfiguration.amount));
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    const totalPayments = monthlyPaymentAmount.times(termInMonths);
    const totalInterest = totalPayments.minus(loanAmount);

    const moneyResult = createMoney(totalInterest.toNumber());
    if (!moneyResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return moneyResult;
  } catch {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate remaining balance after a number of payments
 */
export function calculateRemainingBalance(
  loanConfiguration: LoanConfiguration,
  paymentsMade: number,
): Result<Money, LoanCalculationError> {
  try {
    if (paymentsMade < 0) {
      return { success: false, error: "InvalidParameters" };
    }

    const loanAmount = new Decimal(loanAmountToNumber(loanConfiguration.amount));
    const annualRate = new Decimal(toDecimal(loanConfiguration.annualRate));
    const termInMonths = monthCountToNumber(loanConfiguration.termInMonths);

    if (paymentsMade >= termInMonths) {
      const zeroResult = createMoney(0); // Loan is paid off
      if (!zeroResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return zeroResult;
    }

    if (annualRate.isZero()) {
      // Simple calculation for 0% interest
      const monthlyPrincipal = loanAmount.dividedBy(termInMonths);
      const remainingBalance = loanAmount.minus(monthlyPrincipal.times(paymentsMade));
      const balanceResult = createMoney(Decimal.max(0, remainingBalance).toNumber());
      if (!balanceResult.success) {
        return { success: false, error: "MathematicalError" };
      }
      return balanceResult;
    }

    const monthlyRate = annualRate.dividedBy(12);
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfiguration);

    if (!monthlyPaymentResult.success) {
      return { success: false, error: monthlyPaymentResult.error };
    }

    // Calculate remaining balance using amortization formula
    const onePlusRate = monthlyRate.plus(1);
    const factor1 = onePlusRate.pow(termInMonths);
    const factor2 = onePlusRate.pow(paymentsMade);

    const remainingBalance = loanAmount.times(factor1.minus(factor2))
      .dividedBy(factor1.minus(1));

    const balanceResult = createMoney(Decimal.max(0, remainingBalance).toNumber());
    if (!balanceResult.success) {
      return { success: false, error: "MathematicalError" };
    }
    return balanceResult;
  } catch {
    return { success: false, error: "MathematicalError" };
  }
}

/**
 * Calculate break-even point for refinancing
 */
export function calculateBreakEvenPoint(
  currentLoan: LoanConfiguration,
  newLoan: LoanConfiguration,
  refinancingCosts: Money,
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

    const currentPayment = new Decimal(toEuros(currentPaymentResult.data.total));
    const newPayment = new Decimal(toEuros(newPaymentResult.data.total));
    const costs = new Decimal(toEuros(refinancingCosts));

    if (currentPayment.lessThanOrEqualTo(newPayment)) {
      return { success: false, error: "InsufficientPayment" }; // No savings
    }

    const monthlySavings = currentPayment.minus(newPayment);
    const breakEvenMonths = costs.dividedBy(monthlySavings).ceil();

    const monthCountResult = createMonthCount(breakEvenMonths.toNumber());
    if (!monthCountResult.success) {
      return { success: false, error: "InvalidParameters" };
    }
    return monthCountResult;
  } catch {
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
  }[],
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
  } catch {
    return { success: false, error: "MathematicalError" };
  }
}
