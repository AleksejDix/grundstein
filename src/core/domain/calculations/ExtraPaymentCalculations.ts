/**
 * Extra Payment Calculation Functions
 *
 * Simple functions to calculate the impact of extra payments on mortgages.
 * Focuses on essential calculations without over-engineering.
 */

import { Result } from "../primitives/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { ExtraPayment } from "../types/ExtraPayment";
import type { ExtraPaymentPlan } from "../types/ExtraPaymentPlan";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { MonthCount } from "../value-objects/MonthCount";
import { toNumber as monthCountToNumber, createMonthCount } from "../value-objects/MonthCount";
import { calculateMonthlyPayment } from "./LoanCalculations";

/**
 * Extra payment calculation errors
 */
export type ExtraPaymentCalculationError =
  | "InvalidConfiguration"
  | "InvalidExtraPayment"
  | "CalculationError";

/**
 * Impact of extra payments on a loan
 */
export type ExtraPaymentImpact = {
  readonly originalTerm: MonthCount;
  readonly newTerm: MonthCount;
  readonly monthsSaved: number;
  readonly originalTotalInterest: Money;
  readonly newTotalInterest: Money;
  readonly interestSaved: Money;
  readonly totalExtraPayments: Money;
};

/**
 * Calculate the impact of extra payments on a loan
 */
export function calculateExtraPaymentImpact(
  loanConfig: LoanConfiguration,
  extraPayments: readonly ExtraPayment[]
): Result<ExtraPaymentImpact, ExtraPaymentCalculationError> {
  try {
    // Calculate original loan metrics
    const originalPayment = calculateMonthlyPayment(loanConfig);
    if (!originalPayment.success) {
      return Result.error("InvalidConfiguration");
    }

    const originalTerm = loanConfig.termInMonths;
    const originalTotalPayment = toEuros(originalPayment.data.total) * monthCountToNumber(originalTerm);
    const originalTotalInterest = createMoney(
      originalTotalPayment - toEuros(loanConfig.amount)
    );

    if (!originalTotalInterest.success) {
      return Result.error("CalculationError");
    }

    // Simple calculation: each extra payment reduces remaining balance
    let remainingBalance = toEuros(loanConfig.amount);
    const monthlyPaymentAmount = toEuros(originalPayment.data.total);
    const monthlyPrincipal = toEuros(originalPayment.data.principal);
    
    let totalExtraPayments = 0;
    let monthsSaved = 0;

    // Apply extra payments and calculate new payoff time
    for (const extraPayment of extraPayments) {
      const extraAmount = toEuros((extraPayment as any).amount);
      totalExtraPayments += extraAmount;
      
      // Simple approximation: extra payment reduces balance directly
      remainingBalance -= extraAmount;
      
      // Each extra payment saves approximately extraAmount / monthlyPrincipal months
      monthsSaved += Math.round(extraAmount / monthlyPrincipal);
    }

    const newTermMonths = Math.max(1, monthCountToNumber(originalTerm) - monthsSaved);
    const newTotalPayment = monthlyPaymentAmount * newTermMonths + totalExtraPayments;
    const newTotalInterest = createMoney(
      newTotalPayment - toEuros(loanConfig.amount)
    );

    if (!newTotalInterest.success) {
      return Result.error("CalculationError");
    }

    const interestSaved = createMoney(
      toEuros(originalTotalInterest.data) - toEuros(newTotalInterest.data)
    );

    if (!interestSaved.success) {
      return Result.error("CalculationError");
    }

    // Create money value with proper error handling
    const totalExtraPaymentsResult = createMoney(totalExtraPayments);
    
    if (!totalExtraPaymentsResult.success) {
      return Result.error("CalculationError");
    }

    const newTermResult = createMonthCount(monthCountToNumber(originalTerm) - monthsSaved);
    if (!newTermResult.success) {
      return Result.error("CalculationError");
    }

    return Result.ok({
      originalTerm,
      newTerm: newTermResult.data,
      monthsSaved,
      originalTotalInterest: originalTotalInterest.data,
      newTotalInterest: newTotalInterest.data,
      interestSaved: interestSaved.data,
      totalExtraPayments: totalExtraPaymentsResult.data,
    });
  } catch (error) {
    return Result.error("CalculationError");
  }
}

/**
 * Calculate simple extra payment recommendations
 */
export function calculateExtraPaymentRecommendation(
  loanConfig: LoanConfiguration,
  availableAmount: Money
): {
  recommendedAmount: Money;
  estimatedSavings: Money;
  payoffReduction: number; // months
} {
  const availableEuros = toEuros(availableAmount);
  const loanAmountEuros = toEuros(loanConfig.amount);
  
  // Recommend 5-10% of loan amount, limited by available amount
  const recommendedEuros = Math.min(
    availableEuros,
    loanAmountEuros * 0.1 // 10% max
  );

  // Simple approximation: 3% annual savings rate over remaining term
  const estimatedSavingsEuros = recommendedEuros * 0.03 * (monthCountToNumber(loanConfig.termInMonths) / 12);
  
  // Simple payoff reduction: ~1 month per 1% of loan amount
  const payoffReductionMonths = Math.round((recommendedEuros / loanAmountEuros) * 12);

  // Create money values with proper error handling
  const recommendedAmountResult = createMoney(recommendedEuros);
  const estimatedSavingsResult = createMoney(estimatedSavingsEuros);

  if (!recommendedAmountResult.success || !estimatedSavingsResult.success) {
    // Return reasonable defaults if creation fails
    const zeroMoney = createMoney(0);
    return {
      recommendedAmount: availableAmount,
      estimatedSavings: zeroMoney.success ? zeroMoney.data : availableAmount,
      payoffReduction: 0,
    };
  }

  return {
    recommendedAmount: recommendedAmountResult.data,
    estimatedSavings: estimatedSavingsResult.data,
    payoffReduction: payoffReductionMonths,
  };
}