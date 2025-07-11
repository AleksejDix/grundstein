/**
 * Simple Mortgage Data Service for Testing
 *
 * Creates mock mortgage data for visualization without complex domain dependencies.
 */

export type SimpleMortgageData = {
  // Basic loan information
  originalLoanAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;

  // Property information
  propertyValue: number;
  originalPurchasePrice: number;

  // Payment tracking
  totalPayments: number;
  totalPaid: number;
  paymentsRemaining: number;

  // Calculated metrics
  ltvRatio: number;
  equityBuilt: number;
  percentagePaid: number;
  payoffDate: Date;
};

/**
 * Create simple apartment mortgage example
 */
export function createSimpleApartmentMortgage(): SimpleMortgageData {
  // Your example: €50k loan from May 2021, 0.8% interest, €375 monthly payment
  const originalLoanAmount = 50000;
  const monthlyPayment = 375;
  const interestRate = 0.8;

  // Calculate months elapsed from May 2021 to July 2025
  const startDate = new Date(2021, 4, 1); // May 1, 2021
  const currentDate = new Date(2025, 6, 11); // July 11, 2025
  const monthsElapsed = calculateMonthsElapsed(startDate, currentDate);

  // Simple balance calculation
  const monthlyRate = interestRate / 100 / 12;
  let currentBalance = originalLoanAmount;

  for (let i = 0; i < monthsElapsed; i++) {
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    currentBalance = Math.max(0, currentBalance - principalPayment);
  }

  currentBalance = Math.round(currentBalance);
  const totalPaid = monthsElapsed * monthlyPayment;

  // Property information (small Berlin apartment)
  const originalPurchasePrice = 60000;
  const propertyValue = 65000; // Appreciated 5k over 4 years

  // Calculate metrics
  const ltvRatio = (currentBalance / propertyValue) * 100;
  const equityBuilt = propertyValue - currentBalance;
  const percentagePaid =
    ((originalLoanAmount - currentBalance) / originalLoanAmount) * 100;

  // Estimate remaining payments
  const remainingPayments = Math.ceil(
    Math.log(1 + (currentBalance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate)
  );

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + remainingPayments);

  return {
    originalLoanAmount,
    currentBalance,
    monthlyPayment,
    interestRate,
    propertyValue,
    originalPurchasePrice,
    totalPayments: monthsElapsed,
    totalPaid,
    paymentsRemaining: remainingPayments,
    ltvRatio: Math.round(ltvRatio * 10) / 10,
    equityBuilt,
    percentagePaid: Math.round(percentagePaid * 10) / 10,
    payoffDate,
  };
}

/**
 * Get mortgage summary for dashboard
 */
export function getSimpleMortgageSummary(mortgage: SimpleMortgageData) {
  return {
    loanProgress: {
      originalAmount: mortgage.originalLoanAmount,
      currentBalance: mortgage.currentBalance,
      totalPaid: mortgage.totalPaid,
      percentagePaid: mortgage.percentagePaid,
    },
    propertyEquity: {
      propertyValue: mortgage.propertyValue,
      remainingDebt: mortgage.currentBalance,
      equityBuilt: mortgage.equityBuilt,
      ltvRatio: mortgage.ltvRatio,
    },
    paymentPerformance: {
      totalPayments: mortgage.totalPayments,
      onTimePayments: mortgage.totalPayments, // All on time
      consistencyScore: 100,
      averagePayment: mortgage.monthlyPayment,
    },
    futureProjections: {
      paymentsRemaining: mortgage.paymentsRemaining,
      yearsRemaining: Math.ceil(mortgage.paymentsRemaining / 12),
      remainingInterest:
        mortgage.paymentsRemaining * mortgage.monthlyPayment -
        mortgage.currentBalance,
      payoffDate: mortgage.payoffDate,
    },
  };
}

/**
 * Get simple Sondertilgung recommendations
 */
export function getSimpleSondertilgungRecommendations(
  mortgage: SimpleMortgageData
) {
  const availablePercentages = [10, 20, 50]; // Online bank example
  const recommendedAmount = mortgage.originalLoanAmount * 0.1; // 10% recommendation
  const potentialSavings = recommendedAmount * 0.05; // Rough estimate

  return {
    availablePercentages,
    recommendedAmount,
    potentialSavings,
    optimalTiming: "Sofort",
    riskAssessment: "Niedrig",
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
