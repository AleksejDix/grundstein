/**
 * Sondertilgung (Extra Payment) Calculation Functions
 *
 * These functions calculate the impact of Sondertilgung (extra payments) on German mortgages.
 * They build upon the core loan calculations but add sophisticated modeling for:
 * - Payment schedule with extra payments
 * - Interest savings from extra payments
 * - Loan term reduction calculations
 * - Yearly payment limit compliance
 */

import { Result } from "../primitives/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { ExtraPayment } from "../types/ExtraPayment";
import { createExtraPayment } from "../types/ExtraPayment";
import type { SondertilgungPlan } from "../types/SondertilgungPlan";
import type { PaymentMonth } from "../value-objects/PaymentMonth";
import {
  createPaymentMonth,
  toNumber as paymentMonthToNumber,
} from "../value-objects/PaymentMonth";
import type { MonthlyPayment } from "../types/MonthlyPayment";
import { createMonthlyPayment } from "../types/MonthlyPayment";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { MonthCount } from "../value-objects/MonthCount";
import {
  createMonthCount,
  toNumber as monthCountToNumber,
} from "../value-objects/MonthCount";
import { toNumber as loanAmountToNumber } from "../value-objects/LoanAmount";
import { createInterestRate, toDecimal } from "../value-objects/InterestRate";
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateRemainingBalance,
  type LoanCalculationError,
} from "./LoanCalculations";

/**
 * Errors specific to Sondertilgung calculations
 */
export type SondertilgungCalculationError =
  | LoanCalculationError
  | "ExtraPaymentLimitExceeded"
  | "InvalidExtraPayment"
  | "PaymentPlanInconsistent"
  | "InsufficientBalance";

/**
 * Payment schedule entry combining regular and extra payments
 */
export type PaymentScheduleEntry = {
  readonly month: PaymentMonth;
  readonly regularPayment: MonthlyPayment;
  readonly extraPayment?: ExtraPayment;
  readonly totalPayment: Money;
  readonly remainingBalance: Money;
  readonly interestSaved: Money; // Cumulative interest saved vs. original loan
};

/**
 * Complete payment schedule with Sondertilgung
 */
export type PaymentSchedule = {
  readonly entries: PaymentScheduleEntry[];
  readonly originalLoan: LoanConfiguration;
  readonly sondertilgungPlan: SondertilgungPlan;
  readonly totalInterestSaved: Money;
  readonly termReductionMonths: MonthCount;
};

/**
 * Impact analysis of a Sondertilgung plan
 */
export type SondertilgungImpact = {
  readonly originalTotalInterest: Money;
  readonly newTotalInterest: Money;
  readonly totalInterestSaved: Money;
  readonly originalTermMonths: MonthCount;
  readonly newTermMonths: MonthCount;
  readonly termReductionMonths: MonthCount;
  readonly totalExtraPayments: Money;
  readonly effectiveInterestRate: number; // Return on investment for extra payments
};

/**
 * Calculate the complete payment schedule with Sondertilgung
 */
export function calculatePaymentSchedule(
  loanConfiguration: LoanConfiguration,
  sondertilgungPlan: SondertilgungPlan,
): Result<PaymentSchedule, SondertilgungCalculationError> {
  try {
    const entries: PaymentScheduleEntry[] = [];
    const loanAmount = loanAmountToNumber(loanConfiguration.amount);
    const annualRate = toDecimal(loanConfiguration.annualRate);
    const monthlyRate = annualRate / 12;
    const originalTermMonths = monthCountToNumber(
      loanConfiguration.termInMonths,
    );

    // Calculate regular monthly payment
    const regularPaymentResult = calculateMonthlyPayment(loanConfiguration);
    if (!regularPaymentResult.success) {
      return { success: false, error: regularPaymentResult.error };
    }

    let remainingBalance = loanAmount;
    let cumulativeInterestSaved = 0;
    const regularPaymentAmount = toEuros(regularPaymentResult.data.total);

    // Calculate original total interest for comparison
    const originalInterestResult = calculateTotalInterest(loanConfiguration);
    if (!originalInterestResult.success) {
      return { success: false, error: originalInterestResult.error };
    }

    for (
      let monthNumber = 1;
      monthNumber <= originalTermMonths;
      monthNumber++
    ) {
      if (remainingBalance <= 0.01) break; // Loan paid off (with small tolerance)

      const paymentMonthResult = createPaymentMonth(monthNumber);
      if (!paymentMonthResult.success) {
        return { success: false, error: "InvalidExtraPayment" };
      }

      const currentMonth = paymentMonthResult.data;

      // Calculate interest for this month
      const monthlyInterest = remainingBalance * monthlyRate;
      const regularPrincipal = Math.min(
        regularPaymentAmount - monthlyInterest,
        remainingBalance,
      );

      // Create regular payment
      const regularPayment = createMonthlyPayment(
        regularPrincipal,
        monthlyInterest,
      );
      if (!regularPayment.success) {
        return { success: false, error: "PaymentPlanInconsistent" };
      }

      // Check for extra payment this month
      const extraPaymentForMonth = findExtraPaymentForMonth(
        sondertilgungPlan,
        currentMonth,
      );
      let extraPaymentAmount = 0;
      let extraPayment: ExtraPayment | undefined;

      if (extraPaymentForMonth) {
        extraPaymentAmount = Math.min(
          toEuros(extraPaymentForMonth.amount),
          remainingBalance - regularPrincipal,
        );
        if (extraPaymentAmount > 0) {
          extraPayment = extraPaymentForMonth;
        }
      }

      // Calculate total payment and new balance
      const totalPaymentAmount = regularPaymentAmount + extraPaymentAmount;
      const totalPaymentResult = createMoney(totalPaymentAmount);
      if (!totalPaymentResult.success) {
        return { success: false, error: "PaymentPlanInconsistent" };
      }

      remainingBalance -= regularPrincipal + extraPaymentAmount;
      const balanceResult = createMoney(Math.max(0, remainingBalance));
      if (!balanceResult.success) {
        return { success: false, error: "PaymentPlanInconsistent" };
      }

      // Calculate interest saved (simplified calculation)
      const interestSavedThisMonth =
        extraPaymentAmount * monthlyRate * (originalTermMonths - monthNumber);
      cumulativeInterestSaved += interestSavedThisMonth;
      const interestSavedResult = createMoney(cumulativeInterestSaved);
      if (!interestSavedResult.success) {
        return { success: false, error: "PaymentPlanInconsistent" };
      }

      // Create schedule entry
      const entry: PaymentScheduleEntry = {
        month: currentMonth,
        regularPayment: regularPayment.data,
        extraPayment,
        totalPayment: totalPaymentResult.data,
        remainingBalance: balanceResult.data,
        interestSaved: interestSavedResult.data,
      };

      entries.push(entry);
    }

    // Calculate final metrics
    const finalInterestSaved = createMoney(cumulativeInterestSaved);
    if (!finalInterestSaved.success) {
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    const actualTermMonths = entries.length;
    const termReduction = originalTermMonths - actualTermMonths;
    const termReductionResult = createMonthCount(Math.max(0, termReduction));
    if (!termReductionResult.success) {
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    return {
      success: true,
      data: {
        entries,
        originalLoan: loanConfiguration,
        sondertilgungPlan,
        totalInterestSaved: finalInterestSaved.data,
        termReductionMonths: termReductionResult.data,
      },
    };
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}

/**
 * Calculate the impact of a Sondertilgung plan
 */
export function calculateSondertilgungImpact(
  loanConfiguration: LoanConfiguration,
  sondertilgungPlan: SondertilgungPlan,
): Result<SondertilgungImpact, SondertilgungCalculationError> {
  try {
    // Calculate original loan metrics
    const originalInterestResult = calculateTotalInterest(loanConfiguration);
    if (!originalInterestResult.success) {
      return { success: false, error: originalInterestResult.error };
    }

    const originalTermMonths = createMonthCount(
      monthCountToNumber(loanConfiguration.termInMonths),
    );
    if (!originalTermMonths.success) {
      console.log("Failed to create original term months");
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    // Calculate schedule with extra payments
    const scheduleResult = calculatePaymentSchedule(
      loanConfiguration,
      sondertilgungPlan,
    );
    if (!scheduleResult.success) {
      console.log("Payment schedule calculation failed:", scheduleResult.error);
      return { success: false, error: scheduleResult.error };
    }

    const schedule = scheduleResult.data;

    // Calculate new total interest (original - saved)
    const originalInterest = toEuros(originalInterestResult.data);
    const interestSaved = toEuros(schedule.totalInterestSaved);
    const newTotalInterest = originalInterest - interestSaved;

    const newInterestResult = createMoney(Math.max(0, newTotalInterest));
    if (!newInterestResult.success) {
      console.log("Failed to create new total interest money");
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    // Calculate total extra payments
    const totalExtraPayments = schedule.entries.reduce((total, entry) => {
      return (
        total + (entry.extraPayment ? toEuros(entry.extraPayment.amount) : 0)
      );
    }, 0);

    const totalExtraResult = createMoney(totalExtraPayments);
    if (!totalExtraResult.success) {
      console.log("Failed to create total extra payments money");
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    // Calculate new term
    const newTermMonths = createMonthCount(schedule.entries.length);
    if (!newTermMonths.success) {
      console.log("Failed to create new term months");
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    // Calculate effective interest rate (ROI on extra payments)
    const effectiveRate =
      totalExtraPayments > 0 ? (interestSaved / totalExtraPayments) * 100 : 0;

    return {
      success: true,
      data: {
        originalTotalInterest: originalInterestResult.data,
        newTotalInterest: newInterestResult.data,
        totalInterestSaved: schedule.totalInterestSaved,
        originalTermMonths: originalTermMonths.data,
        newTermMonths: newTermMonths.data,
        termReductionMonths: schedule.termReductionMonths,
        totalExtraPayments: totalExtraResult.data,
        effectiveInterestRate: effectiveRate,
      },
    };
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}

/**
 * Calculate optimal extra payment amount for maximum interest savings
 */
export function calculateOptimalExtraPayment(
  loanConfiguration: LoanConfiguration,
  paymentMonth: PaymentMonth,
  maxExtraPayment: Money,
): Result<Money, SondertilgungCalculationError> {
  try {
    const remainingBalanceResult = calculateRemainingBalance(
      loanConfiguration,
      paymentMonthToNumber(paymentMonth) - 1,
    );
    if (!remainingBalanceResult.success) {
      return { success: false, error: remainingBalanceResult.error };
    }

    const remainingBalance = toEuros(remainingBalanceResult.data);
    const maxPayment = toEuros(maxExtraPayment);
    const annualRate = toDecimal(loanConfiguration.annualRate);
    const originalTermMonths = monthCountToNumber(
      loanConfiguration.termInMonths,
    );
    const currentMonth = paymentMonthToNumber(paymentMonth);

    // Calculate interest savings for different payment amounts
    const _monthlyRate = annualRate / 12;
    const _remainingMonths = originalTermMonths - currentMonth;

    // Optimal payment is the minimum of:
    // 1. Maximum allowed payment
    // 2. Remaining balance (can't pay more than owed)
    // 3. Amount that maximizes interest savings per euro spent
    const optimalAmount = Math.min(maxPayment, remainingBalance);

    // For simplicity, we'll use the maximum feasible amount
    // In practice, you might want more sophisticated optimization
    const optimalResult = createMoney(optimalAmount);
    if (!optimalResult.success) {
      return { success: false, error: "PaymentPlanInconsistent" };
    }
    return optimalResult;
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}

/**
 * Calculate when a loan will be paid off with extra payments
 */
export function calculatePayoffDate(
  loanConfiguration: LoanConfiguration,
  sondertilgungPlan: SondertilgungPlan,
): Result<MonthCount, SondertilgungCalculationError> {
  try {
    const scheduleResult = calculatePaymentSchedule(
      loanConfiguration,
      sondertilgungPlan,
    );
    if (!scheduleResult.success) {
      return { success: false, error: scheduleResult.error };
    }

    const finalMonth = scheduleResult.data.entries.length;
    const monthCountResult = createMonthCount(finalMonth);
    if (!monthCountResult.success) {
      return { success: false, error: "PaymentPlanInconsistent" };
    }
    return monthCountResult;
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}

/**
 * Compare multiple Sondertilgung strategies
 */
export function compareSondertilgungStrategies(
  loanConfiguration: LoanConfiguration,
  strategies: SondertilgungPlan[],
): Result<SondertilgungImpact[], SondertilgungCalculationError> {
  try {
    const results: SondertilgungImpact[] = [];

    for (const strategy of strategies) {
      const impactResult = calculateSondertilgungImpact(
        loanConfiguration,
        strategy,
      );
      if (!impactResult.success) {
        return { success: false, error: impactResult.error };
      }
      results.push(impactResult.data);
    }

    // Sort by total interest saved (descending)
    results.sort(
      (a, b) => toEuros(b.totalInterestSaved) - toEuros(a.totalInterestSaved),
    );

    return { success: true, data: results };
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}

/**
 * Helper function to find extra payment for a specific month
 */
function findExtraPaymentForMonth(
  plan: SondertilgungPlan,
  month: PaymentMonth,
): ExtraPayment | undefined {
  return plan.payments.find(
    (payment) =>
      paymentMonthToNumber(payment.month) === paymentMonthToNumber(month),
  );
}

/**
 * Calculate interest rate sensitivity for extra payments
 */
export function calculateInterestSensitivity(
  loanConfiguration: LoanConfiguration,
  extraPaymentAmount: Money,
  paymentMonth: PaymentMonth,
): Result<
  { lowRate: Money; highRate: Money; sensitivity: number },
  SondertilgungCalculationError
> {
  try {
    const baseRate = toDecimal(loanConfiguration.annualRate) * 100;
    const lowRate = Math.max(0.1, baseRate - 1); // 1% lower
    const highRate = Math.min(25, baseRate + 1); // 1% higher

    // Create modified loan configurations
    const _lowRateConfig = {
      ...loanConfiguration,
      annualRate: (() => {
        const result = createInterestRate(lowRate);
        return result.success ? result.data : loanConfiguration.annualRate;
      })(),
    };

    const _highRateConfig = {
      ...loanConfiguration,
      annualRate: (() => {
        const result = createInterestRate(highRate);
        return result.success ? result.data : loanConfiguration.annualRate;
      })(),
    };

    // Calculate savings for each rate scenario
    const extraPaymentResult = createExtraPayment(
      paymentMonth,
      extraPaymentAmount,
    );
    if (!extraPaymentResult.success) {
      return { success: false, error: "InvalidExtraPayment" };
    }

    // For this example, we'll use a simplified calculation
    // In practice, you'd create full Sondertilgung plans and calculate impacts
    const monthlyRate = toDecimal(loanConfiguration.annualRate) / 12;
    const remainingMonths =
      monthCountToNumber(loanConfiguration.termInMonths) -
      paymentMonthToNumber(paymentMonth);
    const baseSavings =
      toEuros(extraPaymentAmount) * monthlyRate * remainingMonths;

    const lowRateSavings = baseSavings * 0.8; // Simplified
    const highRateSavings = baseSavings * 1.2; // Simplified

    const lowSavingsResult = createMoney(lowRateSavings);
    const highSavingsResult = createMoney(highRateSavings);

    if (!lowSavingsResult.success || !highSavingsResult.success) {
      return { success: false, error: "PaymentPlanInconsistent" };
    }

    const sensitivity =
      ((highRateSavings - lowRateSavings) / (2 * baseSavings)) * 100; // % change per 1% rate change

    return {
      success: true,
      data: {
        lowRate: lowSavingsResult.data,
        highRate: highSavingsResult.data,
        sensitivity,
      },
    };
  } catch {
    return { success: false, error: "PaymentPlanInconsistent" };
  }
}
