/**
 * PortfolioService - Domain Service
 *
 * Business logic for portfolio management operations
 * Handles complex portfolio calculations and analysis
 */

import { Result } from "../primitives/Brand";
import { createMoney } from "../value-objects/Money";
import type {
  MortgagePortfolio,
  PortfolioSummary,
  MortgageEntry,
  PortfolioValidationError,
} from "../entities/MortgagePortfolio";
import { getLoanParameters } from "../types/LoanConfiguration";

/**
 * Calculate portfolio summary statistics
 */
export function calculatePortfolioSummary(
  portfolio: MortgagePortfolio
): Result<PortfolioSummary, PortfolioValidationError> {
  const activeMortgages = portfolio.mortgages.filter((m) => m.isActive);

  if (activeMortgages.length === 0) {
    const emptyMoney = createMoney(0);
    if (!emptyMoney.success) {
      return { success: false, error: "InvalidMortgageEntry" };
    }

    return {
      success: true,
      data: {
        totalPrincipal: emptyMoney.data,
        totalMonthlyPayment: emptyMoney.data,
        averageInterestRate: 0,
        activeMortgages: 0,
        totalMortgages: portfolio.mortgages.length,
        marketDistribution: {
          german: 0,
          swiss: 0,
        },
      },
    };
  }

  try {
    // Calculate totals
    let totalPrincipalAmount = 0;
    let totalMonthlyPaymentAmount = 0;
    let totalInterestWeighted = 0;

    for (const mortgage of activeMortgages) {
      const params = getLoanParameters(mortgage.configuration);

      totalPrincipalAmount += params.amount;
      totalMonthlyPaymentAmount += params.monthlyPayment;
      totalInterestWeighted += params.amount * params.annualRate;
    }

    // Create Money objects
    const totalPrincipal = createMoney(totalPrincipalAmount);
    const totalMonthlyPayment = createMoney(totalMonthlyPaymentAmount);

    if (!totalPrincipal.success || !totalMonthlyPayment.success) {
      return { success: false, error: "InvalidMortgageEntry" };
    }

    // Calculate weighted average interest rate
    const averageInterestRate =
      totalPrincipalAmount > 0
        ? totalInterestWeighted / totalPrincipalAmount
        : 0;

    // Calculate market distribution
    const marketCounts = activeMortgages.reduce(
      (acc, mortgage) => {
        if (mortgage.market === "DE") {
          acc.german++;
        } else if (mortgage.market === "CH") {
          acc.swiss++;
        }
        return acc;
      },
      { german: 0, swiss: 0 }
    );

    return {
      success: true,
      data: {
        totalPrincipal: totalPrincipal.data,
        totalMonthlyPayment: totalMonthlyPayment.data,
        averageInterestRate: Math.round(averageInterestRate * 100) / 100,
        activeMortgages: activeMortgages.length,
        totalMortgages: portfolio.mortgages.length,
        marketDistribution: marketCounts,
      },
    };
  } catch (error) {
    return { success: false, error: "InvalidMortgageEntry" };
  }
}

/**
 * Compare mortgages within portfolio for optimization opportunities
 */
export function analyzePortfolioOptimization(portfolio: MortgagePortfolio): {
  refinancingOpportunities: MortgageEntry[];
  consolidationOpportunities: MortgageEntry[];
  riskAnalysis: {
    highInterestMortgages: MortgageEntry[];
    variableRateMortgages: MortgageEntry[];
  };
} {
  const activeMortgages = portfolio.mortgages.filter((m) => m.isActive);

  // Find refinancing opportunities (high interest rates)
  const averageRate =
    activeMortgages.reduce((sum, m) => {
      const params = getLoanParameters(m.configuration);
      return sum + params.annualRate;
    }, 0) / activeMortgages.length;

  const refinancingOpportunities = activeMortgages.filter((m) => {
    const params = getLoanParameters(m.configuration);
    return params.annualRate > averageRate + 1; // 1% above average
  });

  // Find consolidation opportunities (small loans that could be combined)
  const consolidationOpportunities = activeMortgages.filter((m) => {
    const params = getLoanParameters(m.configuration);
    return params.amount < 100000; // Less than €100k
  });

  // Risk analysis
  const highInterestMortgages = activeMortgages.filter((m) => {
    const params = getLoanParameters(m.configuration);
    return params.annualRate > 5; // Above 5%
  });

  // For now, assume no variable rate mortgages (would need additional domain modeling)
  const variableRateMortgages: MortgageEntry[] = [];

  return {
    refinancingOpportunities,
    consolidationOpportunities,
    riskAnalysis: {
      highInterestMortgages,
      variableRateMortgages,
    },
  };
}

/**
 * Calculate portfolio cash flow projection
 */
export function calculatePortfolioCashFlow(
  portfolio: MortgagePortfolio,
  months: number
): {
  monthlyPayments: number[];
  cumulativeInterest: number[];
  remainingBalance: number[];
} {
  const activeMortgages = portfolio.mortgages.filter((m) => m.isActive);

  const monthlyPayments: number[] = [];
  const cumulativeInterest: number[] = [];
  const remainingBalance: number[] = [];

  for (let month = 1; month <= months; month++) {
    let totalPayment = 0;
    let totalInterest = 0;
    let totalBalance = 0;

    for (const mortgage of activeMortgages) {
      const params = getLoanParameters(mortgage.configuration);

      // Simplified calculation - would use proper amortization schedule
      totalPayment += params.monthlyPayment;

      // Estimate remaining balance (simplified)
      const monthsElapsed = month;
      const monthlyRate = params.monthlyRate;
      const totalMonths = params.termInMonths;

      if (monthsElapsed < totalMonths) {
        const factor = Math.pow(1 + monthlyRate, totalMonths - monthsElapsed);
        const balance =
          (params.amount *
            (factor - Math.pow(1 + monthlyRate, monthsElapsed))) /
          (factor - 1);
        totalBalance += Math.max(0, balance);
      }

      // Estimate interest portion (simplified)
      totalInterest += totalBalance * monthlyRate;
    }

    monthlyPayments.push(Math.round(totalPayment * 100) / 100);
    cumulativeInterest.push(Math.round(totalInterest * 100) / 100);
    remainingBalance.push(Math.round(totalBalance * 100) / 100);
  }

  return {
    monthlyPayments,
    cumulativeInterest,
    remainingBalance,
  };
}
