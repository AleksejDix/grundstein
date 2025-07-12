/**
 * Mortgage Service - Application Layer
 *
 * This service coordinates all domain calculations and provides clean,
 * high-level operations for the UI. It acts as the bridge between our
 * robust domain types and the application layer.
 *
 * Key responsibilities:
 * - Coordinate multiple domain calculations
 * - Provide UI-friendly data structures
 * - Handle complex loan scenarios and comparisons
 * - Manage Sondertilgung planning and analysis
 * - Convert domain errors to user-friendly messages
 */

import {
  Result,
  type LoanConfiguration,
  createLoanConfiguration,
  type ExtraPayment,
  createExtraPayment,
  type SondertilgungPlan,
  type Money,
  createMoney,
  toEuros,
  type LoanAmount,
  createLoanAmount,
  type InterestRate,
  createInterestRate,
  type MonthCount,
  createMonthCount,
  type YearCount,
  createYearCount,
  type PaymentMonth,
  createPaymentMonth,
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateRemainingBalance,
  calculateBreakEvenPoint,
  type LoanCalculationError,
  calculateSondertilgungImpact,
  compareSondertilgungStrategies,
  type SondertilgungCalculationError,
} from "../../../../core/domain";

/**
 * Service-level errors with user-friendly context
 */
export type MortgageServiceError =
  | "InvalidLoanParameters"
  | "CalculationFailed"
  | "SondertilgungPlanInvalid"
  | "InsufficientData"
  | "ConfigurationError";

/**
 * Loan scenario input (from UI forms)
 */
export type LoanScenarioInput = {
  loanAmount: number; // in euros
  interestRate: number; // as percentage (e.g., 5.5 for 5.5%)
  termYears?: number; // loan term in years
  termMonths?: number; // OR loan term in months
  monthlyPayment?: number; // optional for reverse calculations
};

/**
 * UI-friendly loan analysis result
 */
export type LoanAnalysis = {
  configuration: LoanConfiguration;
  monthlyPayment: {
    total: number;
    principal: number;
    interest: number;
    principalPercentage: number;
  };
  totals: {
    interestPaid: number;
    totalPaid: number;
    termInMonths: number;
    termInYears: number;
  };
  firstYearSummary: {
    totalPayments: number;
    totalInterest: number;
    totalPrincipal: number;
    endingBalance: number;
  };
};

/**
 * Sondertilgung analysis result
 */
export type SondertilgungAnalysis = {
  originalLoan: LoanAnalysis;
  withExtraPayments: LoanAnalysis;
  impact: {
    totalInterestSaved: number;
    termReductionMonths: number;
    totalExtraPayments: number;
    effectiveReturnRate: number;
    isWorthwhile: boolean;
  };
  monthlyBreakdown: Array<{
    month: number;
    regularPayment: number;
    extraPayment?: number;
    totalPayment: number;
    remainingBalance: number;
    interestSaved: number;
  }>;
};

/**
 * Multiple scenario comparison
 */
export type ScenarioComparison = {
  scenarios: LoanAnalysis[];
  bestCase: {
    lowestPayment: LoanAnalysis;
    shortestTerm: LoanAnalysis;
    lowestTotalInterest: LoanAnalysis;
  };
  insights: string[];
};

/**
 * Mortgage Service Functions
 */
/**
 * Create and analyze a loan configuration
 */
export async function analyzeLoan(
  input: LoanScenarioInput
): Promise<Result<LoanAnalysis, MortgageServiceError>> {
  try {
    // Create domain objects from input
    const loanAmountResult = createLoanAmount(input.loanAmount);
    const interestRateResult = createInterestRate(input.interestRate);

    if (!loanAmountResult.success || !interestRateResult.success) {
      return { success: false, error: "InvalidLoanParameters" };
    }

    // Handle term specification (years OR months)
    let termInMonths: MonthCount;
    if (input.termYears) {
      const yearResult = createYearCount(input.termYears);
      if (!yearResult.success) {
        return { success: false, error: "InvalidLoanParameters" };
      }
      const monthResult = createMonthCount(input.termYears * 12);
      if (!monthResult.success) {
        return { success: false, error: "InvalidLoanParameters" };
      }
      termInMonths = monthResult.data;
    } else if (input.termMonths) {
      const monthResult = createMonthCount(input.termMonths);
      if (!monthResult.success) {
        return { success: false, error: "InvalidLoanParameters" };
      }
      termInMonths = monthResult.data;
    } else {
      return { success: false, error: "InvalidLoanParameters" };
    }

    // Create base monthly payment (calculate if not provided)
    let basePaymentAmount: number;
    if (input.monthlyPayment) {
      basePaymentAmount = input.monthlyPayment;
    } else {
      // Calculate correct payment using loan formula
      const monthlyRate = input.interestRate / 100 / 12;
      const termMonths = input.termYears
        ? input.termYears * 12
        : input.termMonths!;

      if (input.interestRate === 0) {
        basePaymentAmount = input.loanAmount / termMonths;
      } else {
        const numerator =
          input.loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
        const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
        basePaymentAmount = numerator / denominator;
      }
    }

    const basePayment = createMoney(basePaymentAmount);
    if (!basePayment.success) {
      return { success: false, error: "InvalidLoanParameters" };
    }

    // Create loan configuration
    const configResult = createLoanConfiguration(
      loanAmountResult.data,
      interestRateResult.data,
      termInMonths,
      basePayment.data
    );

    if (!configResult.success) {
      return { success: false, error: "ConfigurationError" };
    }

    // Calculate monthly payment
    const paymentResult = calculateMonthlyPayment(configResult.data);
    if (!paymentResult.success) {
      return { success: false, error: "CalculationFailed" };
    }

    // Calculate total interest
    const totalInterestResult = calculateTotalInterest(configResult.data);
    if (!totalInterestResult.success) {
      return { success: false, error: "CalculationFailed" };
    }

    // Calculate first year summary
    const firstYearBalance = calculateRemainingBalance(configResult.data, 12);
    if (!firstYearBalance.success) {
      return { success: false, error: "CalculationFailed" };
    }

    // Build analysis result
    const analysis: LoanAnalysis = {
      configuration: configResult.data,
      monthlyPayment: {
        total: toEuros(paymentResult.data.total),
        principal: toEuros(paymentResult.data.principal),
        interest: toEuros(paymentResult.data.interest),
        principalPercentage:
          (toEuros(paymentResult.data.principal) /
            toEuros(paymentResult.data.total)) *
          100,
      },
      totals: {
        interestPaid: toEuros(totalInterestResult.data),
        totalPaid: toEuros(totalInterestResult.data) + input.loanAmount,
        termInMonths: input.termMonths || input.termYears! * 12,
        termInYears:
          Math.round(((input.termMonths || input.termYears! * 12) / 12) * 10) /
          10,
      },
      firstYearSummary: {
        totalPayments: toEuros(paymentResult.data.total) * 12,
        totalInterest: toEuros(paymentResult.data.interest) * 12, // Simplified
        totalPrincipal: toEuros(paymentResult.data.principal) * 12, // Simplified
        endingBalance: toEuros(firstYearBalance.data),
      },
    };

    return { success: true, data: analysis };
  } catch (error) {
    return { success: false, error: "CalculationFailed" };
  }
}

/**
 * Analyze the impact of Sondertilgung (extra payments)
 */
/**
 * Analyze Sondertilgung scenarios
 */
export async function analyzeSondertilgung(
  baseLoan: LoanScenarioInput,
  extraPayments: Array<{ month: number; amount: number }>
): Promise<Result<SondertilgungAnalysis, MortgageServiceError>> {
  try {
    // Analyze base loan
    const baseLoanResult = await analyzeLoan(baseLoan);
    if (!baseLoanResult.success) {
      return { success: false, error: baseLoanResult.error };
    }

    // Create extra payments
    const extraPaymentObjects: ExtraPayment[] = [];
    for (const ep of extraPayments) {
      const monthResult = createPaymentMonth(ep.month);
      const amountResult = createMoney(ep.amount);

      if (!monthResult.success || !amountResult.success) {
        return { success: false, error: "SondertilgungPlanInvalid" };
      }

      const extraPaymentResult = createExtraPayment(
        monthResult.data,
        amountResult.data
      );
      if (!extraPaymentResult.success) {
        return { success: false, error: "SondertilgungPlanInvalid" };
      }

      extraPaymentObjects.push(extraPaymentResult.data);
    }

    // Create simple Sondertilgung plan (assuming unlimited for now)
    const sondertilgungPlan: SondertilgungPlan = {
      yearlyLimit: { type: "Unlimited" },
      payments: extraPaymentObjects,
    };

    // Calculate impact
    const impactResult = calculateSondertilgungImpact(
      baseLoanResult.data.configuration,
      sondertilgungPlan
    );

    if (!impactResult.success) {
      return { success: false, error: "CalculationFailed" };
    }

    // Create analysis with placeholder data (would be more detailed in full implementation)
    const totalExtraPayments = extraPayments.reduce(
      (sum, ep) => sum + ep.amount,
      0
    );
    const interestSaved = toEuros(impactResult.data.totalInterestSaved);

    const analysis: SondertilgungAnalysis = {
      originalLoan: baseLoanResult.data,
      withExtraPayments: baseLoanResult.data, // Simplified - would recalculate
      impact: {
        totalInterestSaved: interestSaved,
        termReductionMonths: 12, // Simplified
        totalExtraPayments,
        effectiveReturnRate:
          totalExtraPayments > 0
            ? (interestSaved / totalExtraPayments) * 100
            : 0,
        isWorthwhile: interestSaved > totalExtraPayments * 0.02, // 2% minimum return
      },
      monthlyBreakdown: [], // Would be populated from full schedule calculation
    };

    return { success: true, data: analysis };
  } catch (error) {
    return { success: false, error: "CalculationFailed" };
  }
}

/**
 * Compare multiple loan scenarios
 */
/**
 * Compare multiple loan scenarios
 */
export async function compareScenarios(
  scenarios: LoanScenarioInput[]
): Promise<Result<ScenarioComparison, MortgageServiceError>> {
  try {
    const analyses: LoanAnalysis[] = [];

    // Analyze each scenario
    for (const scenario of scenarios) {
      const result = await analyzeLoan(scenario);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      analyses.push(result.data);
    }

    if (analyses.length === 0) {
      return { success: false, error: "InsufficientData" };
    }

    // Find best cases
    const lowestPayment = analyses.reduce((min, current) =>
      current.monthlyPayment.total < min.monthlyPayment.total ? current : min
    );

    const shortestTerm = analyses.reduce((min, current) =>
      current.totals.termInMonths < min.totals.termInMonths ? current : min
    );

    const lowestTotalInterest = analyses.reduce((min, current) =>
      current.totals.interestPaid < min.totals.interestPaid ? current : min
    );

    // Generate insights
    const insights: string[] = [];
    const paymentRange =
      Math.max(...analyses.map((a) => a.monthlyPayment.total)) -
      Math.min(...analyses.map((a) => a.monthlyPayment.total));

    if (paymentRange > 100) {
      insights.push(
        `Monthly payments vary by €${paymentRange.toFixed(0)} across scenarios`
      );
    }

    const interestRange =
      Math.max(...analyses.map((a) => a.totals.interestPaid)) -
      Math.min(...analyses.map((a) => a.totals.interestPaid));

    if (interestRange > 1000) {
      insights.push(
        `Total interest varies by €${interestRange.toFixed(0)} across scenarios`
      );
    }

    const comparison: ScenarioComparison = {
      scenarios: analyses,
      bestCase: {
        lowestPayment,
        shortestTerm,
        lowestTotalInterest,
      },
      insights,
    };

    return { success: true, data: comparison };
  } catch (error) {
    return { success: false, error: "CalculationFailed" };
  }
}

/**
 * Calculate affordability analysis
 */
/**
 * Calculate affordability based on income
 */
export async function calculateAffordability(
  monthlyIncome: number,
  monthlyExpenses: number,
  desiredLoanAmount: number,
  interestRate: number
): Promise<
  Result<
    {
      maxAffordablePayment: number;
      recommendedLoanAmount: number;
      riskLevel: "low" | "medium" | "high";
    },
    MortgageServiceError
  >
> {
  try {
    const availableIncome = monthlyIncome - monthlyExpenses;
    const maxAffordablePayment = availableIncome * 0.35; // 35% rule

    // Find maximum loan amount for this payment
    // This would use our loan calculation functions to reverse-engineer the loan amount
    const recommendedLoanAmount = desiredLoanAmount * 0.8; // Simplified calculation

    const riskLevel =
      maxAffordablePayment < desiredLoanAmount * 0.004
        ? "high"
        : maxAffordablePayment < desiredLoanAmount * 0.006
        ? "medium"
        : "low";

    return {
      success: true,
      data: {
        maxAffordablePayment,
        recommendedLoanAmount,
        riskLevel,
      },
    };
  } catch (error) {
    return { success: false, error: "CalculationFailed" };
  }
}

/**
 * Get quick loan estimate (simplified calculation for immediate feedback)
 */
/**
 * Get quick payment estimate without full validation
 */
export function getQuickEstimate(
  loanAmount: number,
  interestRate: number,
  termYears: number
): {
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
} {
  // Simple loan payment formula for quick estimates
  const monthlyRate = interestRate / 100 / 12;
  const termInMonths = termYears * 12;

  let monthlyPayment: number;

  if (interestRate === 0) {
    monthlyPayment = loanAmount / termInMonths;
  } else {
    const numerator =
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths));
    const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1;
    monthlyPayment = numerator / denominator;
  }

  const totalPaid = monthlyPayment * termInMonths;
  const totalInterest = totalPaid - loanAmount;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
  };
}

/**
 * Functional service object for convenient imports
 */
export const MortgageService = {
  analyzeLoan,
  analyzeSondertilgung,
  compareScenarios,
  calculateAffordability,
  getQuickEstimate,
} as const;
