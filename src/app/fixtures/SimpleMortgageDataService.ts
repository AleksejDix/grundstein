/**
 * Simple Mortgage Data Service
 *
 * Creates basic mortgage data for visualization without over-engineering.
 * Example: €50,000 apartment mortgage with 0.8% interest.
 */

import {
  createLoanAmount,
  createInterestRate,
  createMoney,
  createMonthlyPayment,
  createMonthlyPaymentFromMoney,
  createPercentageLimit,
  percentageFromDecimal,
  type LoanAmount,
  type InterestRate,
  type Money,
  type MonthlyPayment,
  type SondertilgungLimit,
} from "../../core/domain";

/**
 * Simple mortgage data for visualization
 */
export type SimpleMortgageData = {
  // Basic loan information
  originalLoanAmount: LoanAmount;
  currentInterestRate: InterestRate;
  monthlyPayment: MonthlyPayment;

  // Simple calculated values
  currentBalance: Money;
  totalPaid: Money;
  equityBuilt: Money;
  paymentsRemaining: number;
  yearsRemaining: number;

  // Optional extra payment limit
  extraPaymentLimit: SondertilgungLimit;
};

/**
 * Create simple apartment mortgage example
 */
export function createSimpleApartmentMortgage(): SimpleMortgageData {
  // Basic loan parameters
  const loanAmountResult = createLoanAmount(50000);
  const interestRateResult = createInterestRate(0.8);
  const principalResult = createMoney(275);
  const interestResult = createMoney(100);
  const totalResult = createMoney(375);

  if (
    !loanAmountResult.success ||
    !interestRateResult.success ||
    !principalResult.success ||
    !interestResult.success ||
    !totalResult.success
  ) {
    throw new Error("Failed to create mortgage data");
  }

  const monthlyPaymentResult = createMonthlyPaymentFromMoney(
    principalResult.data,
    interestResult.data,
  );

  if (!monthlyPaymentResult.success) {
    throw new Error("Failed to create monthly payment");
  }

  const originalLoanAmount = loanAmountResult.data;
  const currentInterestRate = interestRateResult.data;
  const monthlyPayment = monthlyPaymentResult.data;

  // Loan started May 1, 2021 - now July 11, 2025 = ~50 months
  const monthsElapsed = 50;

  // Create Money values with proper error handling
  const totalPaidResult = createMoney(375 * monthsElapsed); // €18,750
  const currentBalanceResult = createMoney(50000 - 275 * monthsElapsed); // ~€36,250 remaining
  const equityBuiltResult = createMoney(65000 - 36250); // Property worth €65k, owe €36.25k = €28.75k equity

  if (
    !totalPaidResult.success ||
    !currentBalanceResult.success ||
    !equityBuiltResult.success
  ) {
    throw new Error("Failed to create calculated monetary values");
  }

  const totalPaid = totalPaidResult.data;
  const currentBalance = currentBalanceResult.data;
  const equityBuilt = equityBuiltResult.data;

  // Approximate remaining payments (depends on amortization)
  const paymentsRemaining = Math.round(36250 / 275); // ~132 payments
  const yearsRemaining = Math.round((paymentsRemaining / 12) * 10) / 10; // ~11 years

  // 20% extra payment limit
  const percentageResult = percentageFromDecimal(0.2);
  if (!percentageResult.success) {
    throw new Error("Failed to create percentage for extra payment limit");
  }
  const extraPaymentLimit = createPercentageLimit(percentageResult.data);

  return {
    originalLoanAmount,
    currentInterestRate,
    monthlyPayment,
    currentBalance,
    totalPaid,
    equityBuilt,
    paymentsRemaining,
    yearsRemaining,
    extraPaymentLimit,
  };
}

/**
 * Get extra payment analysis for the mortgage
 */
export function getExtraPaymentAnalysis(mortgage: SimpleMortgageData): {
  availablePercentages: number[];
  recommendedAmount: number;
  potentialSavings: number;
  optimalTiming: string;
  riskAssessment: string;
} {
  const availablePercentages = [5, 10, 20, 50, 100]; // Standard German percentages

  // Simple recommendation: use 10% if available
  const recommendedPercentage =
    mortgage.extraPaymentLimit.type === "Percentage"
      ? Math.min(10, mortgage.extraPaymentLimit.value)
      : 10;
  const recommendedAmount = 50000 * (recommendedPercentage / 100); // €5,000 for 10%

  return {
    availablePercentages,
    recommendedAmount,
    potentialSavings: Math.round(recommendedAmount * 0.03 * 10), // Simple 3% savings over 10 years
    optimalTiming: "Within first 5 years",
    riskAssessment: recommendedPercentage >= 20 ? "Medium risk" : "Low risk",
  };
}
