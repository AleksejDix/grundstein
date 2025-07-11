/**
 * Realistic Mortgage Data Service
 *
 * Creates realistic mortgage data using all new domain types for visualization.
 * Specifically designed for private apartment investors.
 *
 * Example Case:
 * - €50,000 apartment mortgage
 * - Started: 01.05.2021
 * - Interest: 0.8% p.a.
 * - Monthly Payment: €375
 * - All payments made on time until 11.07.2025
 */

import {
  createLoanAmount,
  createInterestRate,
  createMoney,
  createMonthlyPayment,
  createPaymentHistory,
  createPaymentRecord,
  createPropertyValuation,
  createLoanToValueRatio,
  createFixedRatePeriod,
  createGermanSondertilgungRules,
  type LoanAmount,
  type InterestRate,
  type Money,
  type MonthlyPayment,
  type PaymentHistory,
  type PropertyValuation,
  type LoanToValueRatio,
  type FixedRatePeriod,
  type GermanSondertilgungRules,
  type GermanBankType,
} from "../domain";

/**
 * Complete mortgage data for visualization
 */
export type RealisticMortgageData = {
  // Basic loan information
  originalLoanAmount: LoanAmount;
  currentInterestRate: InterestRate;
  monthlyPayment: MonthlyPayment;

  // Advanced domain types
  paymentHistory: PaymentHistory;
  propertyValuation: PropertyValuation;
  currentLTV: LoanToValueRatio;
  fixedRatePeriod: FixedRatePeriod;
  sondertilgungRules: GermanSondertilgungRules;

  // Calculated values for dashboard
  currentBalance: Money;
  totalPaid: Money;
  equityBuilt: Money;
  paymentsRemaining: number;
  yearsRemaining: number;
};

/**
 * Create the realistic apartment mortgage example
 */
export function createRealisticApartmentMortgage(): RealisticMortgageData {
  // Basic loan parameters
  const originalLoanAmount = createLoanAmount(50000).data!;
  const currentInterestRate = createInterestRate(0.8).data!;
  const monthlyPayment = createMonthlyPayment(275, 100).data!; // ~€275 principal + €100 interest = €375 total

  // Loan start date: 01.05.2021
  const loanStartDate = new Date(2021, 4, 1); // May 1, 2021
  const currentDate = new Date(2025, 6, 11); // July 11, 2025

  // Calculate months elapsed (May 2021 to July 2025 = ~50 months)
  const monthsElapsed = calculateMonthsElapsed(loanStartDate, currentDate);

  // Create payment history with all payments made on time
  const paymentHistory = createCompletePymentHistory(
    loanStartDate,
    monthsElapsed,
    monthlyPayment
  );

  // Small apartment property valuation
  const propertyValuation = createPropertyValuation(
    65000, // Current value (increased from original €60k purchase)
    60000, // Original purchase price
    new Date(2025, 6, 1), // Recent valuation date
    "ComparativeMarketAnalysis",
    "Eigentumswohnung", // Apartment
    {
      postalCode: "10117", // Berlin Mitte (good location)
      city: "Berlin",
      state: "Berlin",
      quality: "Premium",
    }
  ).data!;

  // Calculate current LTV ratio
  const currentBalance = calculateCurrentBalance(
    originalLoanAmount,
    paymentHistory
  );
  const currentLTV = createLoanToValueRatio(
    createLoanAmount(currentBalance).data!,
    propertyValuation,
    originalLoanAmount,
    currentDate
  ).data!;

  // 10-year fixed rate period starting with the loan
  const fixedRatePeriod = createFixedRatePeriod(
    10,
    0.8,
    "InitialFixed",
    loanStartDate
  ).data!;

  // Online bank with generous Sondertilgung rules
  const sondertilgungRules = createGermanSondertilgungRules("OnlineBank").data!;

  // Calculate dashboard metrics
  const totalPaid = calculateTotalPaid(paymentHistory);
  const equityBuilt = createMoney(65000 - currentBalance).data!; // Property value - remaining debt
  const paymentsRemaining = calculatePaymentsRemaining(
    currentBalance,
    monthlyPayment
  );
  const yearsRemaining = Math.ceil(paymentsRemaining / 12);

  return {
    originalLoanAmount,
    currentInterestRate,
    monthlyPayment,
    paymentHistory,
    propertyValuation,
    currentLTV,
    fixedRatePeriod,
    sondertilgungRules,
    currentBalance: createMoney(currentBalance).data!,
    totalPaid,
    equityBuilt,
    paymentsRemaining,
    yearsRemaining,
  };
}

/**
 * Calculate months between two dates
 */
function calculateMonthsElapsed(startDate: Date, endDate: Date): number {
  const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthsDiff = endDate.getMonth() - startDate.getMonth();
  return yearsDiff * 12 + monthsDiff;
}

/**
 * Create complete payment history with all payments made on time
 */
function createCompletePymentHistory(
  startDate: Date,
  monthsElapsed: number,
  monthlyPayment: MonthlyPayment
): PaymentHistory {
  const payments = [];

  for (let month = 1; month <= monthsElapsed; month++) {
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month - 1);
    paymentDate.setDate(1); // Always paid on 1st of month

    const payment = createPaymentRecord(
      month,
      monthlyPayment,
      375, // Actual payment amount (always exactly €375)
      paymentDate,
      "SEPA_DirectDebit", // Most common in Germany
      undefined, // No extra payments yet
      month === 1 ? "Erster Zahlungseingang" : undefined
    ).data!;

    payments.push(payment);
  }

  const loanId = `APT-LOAN-${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, "0")}`;

  return createPaymentHistory(loanId, startDate, payments).data!;
}

/**
 * Calculate current loan balance after all payments
 */
function calculateCurrentBalance(
  originalLoan: LoanAmount,
  paymentHistory: PaymentHistory
): number {
  // Simplified calculation - in reality this would use amortization schedule
  // For 0.8% annual rate (0.067% monthly), €375 payment on €50k loan

  const monthlyRate = 0.008 / 12; // 0.8% annual / 12 months
  const totalPayments = 375; // Monthly payment

  // Get payment records and count
  const payments = (paymentHistory as any).payments;
  const monthsPaid = payments.length;

  // Simple balance calculation using loan amortization formula
  let balance = 50000; // Starting balance

  for (let i = 0; i < monthsPaid; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = totalPayments - interestPayment;
    balance = Math.max(0, balance - principalPayment);
  }

  return Math.round(balance * 100) / 100; // Round to cents
}

/**
 * Calculate total amount paid so far
 */
function calculateTotalPaid(paymentHistory: PaymentHistory): Money {
  const payments = (paymentHistory as any).payments;
  const totalAmount = payments.length * 375; // €375 per payment
  return createMoney(totalAmount).data!;
}

/**
 * Calculate remaining payments needed
 */
function calculatePaymentsRemaining(
  currentBalance: number,
  monthlyPayment: MonthlyPayment
): number {
  if (currentBalance <= 0) return 0;

  const monthlyRate = 0.008 / 12; // 0.8% annual / 12 months
  const paymentAmount = 375; // Monthly payment

  // Calculate remaining payments using loan formula
  const numerator = Math.log(
    1 + (currentBalance * monthlyRate) / paymentAmount
  );
  const denominator = Math.log(1 + monthlyRate);

  return Math.ceil(numerator / denominator);
}

/**
 * Get mortgage summary for dashboard display
 */
export function getMortgageSummary(mortgage: RealisticMortgageData): {
  loanProgress: {
    originalAmount: number;
    currentBalance: number;
    totalPaid: number;
    percentagePaid: number;
  };
  propertyEquity: {
    propertyValue: number;
    remainingDebt: number;
    equityBuilt: number;
    ltvRatio: number;
  };
  paymentPerformance: {
    totalPayments: number;
    onTimePayments: number;
    consistencyScore: number;
    averagePayment: number;
  };
  futureProjections: {
    paymentsRemaining: number;
    yearsRemaining: number;
    remainingInterest: number;
    payoffDate: Date;
  };
} {
  const originalAmount = mortgage.originalLoanAmount as any; // In cents, convert to euros
  const currentBalance = mortgage.currentBalance as any;
  const totalPaid = mortgage.totalPaid as any;
  const propertyValue = (mortgage.propertyValuation as any).currentValue;
  const ltvRatio = (mortgage.currentLTV as any).currentRatio;

  const percentagePaid =
    ((originalAmount - currentBalance) / originalAmount) * 100;
  const equityBuilt = propertyValue - currentBalance;

  // Calculate payoff date
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + mortgage.paymentsRemaining);

  // Estimate remaining interest
  const remainingInterest = mortgage.paymentsRemaining * 375 - currentBalance;

  return {
    loanProgress: {
      originalAmount: originalAmount / 100, // Convert cents to euros
      currentBalance: currentBalance / 100,
      totalPaid: totalPaid / 100,
      percentagePaid: Math.round(percentagePaid * 100) / 100,
    },
    propertyEquity: {
      propertyValue: propertyValue / 100,
      remainingDebt: currentBalance / 100,
      equityBuilt: equityBuilt / 100,
      ltvRatio: ltvRatio,
    },
    paymentPerformance: {
      totalPayments: (mortgage.paymentHistory as any).payments.length,
      onTimePayments: (mortgage.paymentHistory as any).payments.length, // All on time
      consistencyScore: 100, // Perfect score
      averagePayment: 375,
    },
    futureProjections: {
      paymentsRemaining: mortgage.paymentsRemaining,
      yearsRemaining: mortgage.yearsRemaining,
      remainingInterest: remainingInterest,
      payoffDate,
    },
  };
}

/**
 * Get Sondertilgung recommendations for the investor
 */
export function getSondertilgungRecommendations(
  mortgage: RealisticMortgageData
): {
  availablePercentages: number[];
  recommendedAmount: number;
  potentialSavings: number;
  optimalTiming: string;
  riskAssessment: string;
} {
  // Assume investor has €10,000 available for extra payments
  const availableAmount = createMoney(10000).data!;

  const strategy =
    require("../domain/types/GermanSondertilgungRules").getRecommendedStrategy(
      mortgage.sondertilgungRules,
      mortgage.originalLoanAmount,
      availableAmount,
      mortgage.fixedRatePeriod
    );

  const availablePercentages =
    require("../domain/types/GermanSondertilgungRules").getAvailablePercentages(
      mortgage.sondertilgungRules
    );

  const recommendedAmount =
    ((mortgage.originalLoanAmount as any) / 100) *
    (strategy.recommendedPercentage / 100);

  return {
    availablePercentages,
    recommendedAmount,
    potentialSavings: strategy.expectedSavings,
    optimalTiming: strategy.optimalTiming,
    riskAssessment: strategy.riskAssessment,
  };
}
