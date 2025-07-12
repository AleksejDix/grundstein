/**
 * Simple Amortization Engine
 *
 * Generates basic payment schedules without over-engineering.
 * Focuses on essential amortization calculations for MVP.
 */

import { Result } from "../primitives/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { ExtraPayment } from "../types/ExtraPayment";
import type { MonthlyPayment } from "../types/MonthlyPayment";
import { createMonthlyPayment } from "../types/MonthlyPayment";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { MonthCount } from "../value-objects/MonthCount";
import { toNumber as monthCountToNumber } from "../value-objects/MonthCount";
import { calculateMonthlyPayment } from "./LoanCalculations";

/**
 * Amortization errors
 */
export type AmortizationError =
  | "InvalidLoanConfiguration"
  | "CalculationError";

/**
 * Single payment in the schedule
 */
export type PaymentScheduleEntry = {
  readonly month: number;
  readonly payment: MonthlyPayment;
  readonly extraPayment?: Money;
  readonly remainingBalance: Money;
  readonly cumulativeInterest: Money;
  readonly cumulativePrincipal: Money;
};

/**
 * Complete payment schedule
 */
export type PaymentSchedule = {
  readonly entries: readonly PaymentScheduleEntry[];
  readonly totalInterest: Money;
  readonly totalPayments: Money;
  readonly finalBalance: Money;
};

/**
 * Generate basic amortization schedule
 */
export function generateAmortizationSchedule(
  loanConfig: LoanConfiguration,
  extraPayments: readonly ExtraPayment[] = []
): Result<PaymentSchedule, AmortizationError> {
  try {
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfig);
    if (!monthlyPaymentResult.success) {
      return Result.error("InvalidLoanConfiguration");
    }

    const monthlyPayment = monthlyPaymentResult.data;
    const monthlyPaymentAmount = toEuros(monthlyPayment.total);
    const monthlyRate = toEuros(loanConfig.annualRate) / 100 / 12;
    
    let remainingBalance = toEuros(loanConfig.amount);
    let cumulativeInterest = 0;
    let cumulativePrincipal = 0;
    
    const entries: PaymentScheduleEntry[] = [];
    const maxMonths = monthCountToNumber(loanConfig.termInMonths);
    
    // Create extra payment lookup
    const extraPaymentMap = new Map<number, number>();
    for (const extra of extraPayments) {
      const month = (extra as any).month;
      const amount = toEuros((extra as any).amount);
      extraPaymentMap.set(month, amount);
    }

    for (let month = 1; month <= maxMonths && remainingBalance > 0.01; month++) {
      // Calculate interest for this month
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = Math.min(monthlyPaymentAmount - interestPayment, remainingBalance);
      
      // Apply extra payment if any
      const extraPaymentAmount = extraPaymentMap.get(month) || 0;
      const totalPrincipalPayment = Math.min(principalPayment + extraPaymentAmount, remainingBalance);
      
      // Update balances
      remainingBalance -= totalPrincipalPayment;
      cumulativeInterest += interestPayment;
      cumulativePrincipal += totalPrincipalPayment;

      // Create payment entry
      const payment = createMonthlyPayment(principalPayment, interestPayment);

      if (!payment.success) {
        return Result.error("CalculationError");
      }

      // Create money values with proper error handling
      const extraPaymentResult = extraPaymentAmount > 0 ? createMoney(extraPaymentAmount) : null;
      const remainingBalanceResult = createMoney(remainingBalance);
      const cumulativeInterestResult = createMoney(cumulativeInterest);
      const cumulativePrincipalResult = createMoney(cumulativePrincipal);

      if ((extraPaymentResult && !extraPaymentResult.success) || 
          !remainingBalanceResult.success || 
          !cumulativeInterestResult.success || 
          !cumulativePrincipalResult.success) {
        return Result.error("CalculationError");
      }

      entries.push({
        month,
        payment: payment.data,
        extraPayment: extraPaymentResult?.data,
        remainingBalance: remainingBalanceResult.data,
        cumulativeInterest: cumulativeInterestResult.data,
        cumulativePrincipal: cumulativePrincipalResult.data,
      });
    }

    // Create final summary values with proper error handling
    const totalInterestResult = createMoney(cumulativeInterest);
    const totalPaymentsResult = createMoney(cumulativePrincipal + cumulativeInterest);
    const finalBalanceResult = createMoney(remainingBalance);

    if (!totalInterestResult.success || !totalPaymentsResult.success || !finalBalanceResult.success) {
      return Result.error("CalculationError");
    }

    return Result.ok({
      entries,
      totalInterest: totalInterestResult.data,
      totalPayments: totalPaymentsResult.data,
      finalBalance: finalBalanceResult.data,
    });
  } catch (error) {
    return Result.error("CalculationError");
  }
}

/**
 * Calculate simple loan summary without full schedule
 */
export function calculateLoanSummary(
  loanConfig: LoanConfiguration
): Result<{
  monthlyPayment: MonthlyPayment;
  totalInterest: Money;
  totalPayments: Money;
  totalOfPayments: Money;
}, AmortizationError> {
  try {
    const monthlyPaymentResult = calculateMonthlyPayment(loanConfig);
    if (!monthlyPaymentResult.success) {
      return Result.error("InvalidLoanConfiguration");
    }

    const monthlyPayment = monthlyPaymentResult.data;
    const termMonths = monthCountToNumber(loanConfig.termInMonths);
    const totalPayments = toEuros(monthlyPayment.total) * termMonths;
    const totalInterest = totalPayments - toEuros(loanConfig.amount);

    // Create money values with proper error handling
    const totalInterestResult = createMoney(totalInterest);
    const totalPaymentsResult = createMoney(totalPayments);
    const totalOfPaymentsResult = createMoney(totalPayments);

    if (!totalInterestResult.success || !totalPaymentsResult.success || !totalOfPaymentsResult.success) {
      return Result.error("CalculationError");
    }

    return Result.ok({
      monthlyPayment,
      totalInterest: totalInterestResult.data,
      totalPayments: totalPaymentsResult.data,
      totalOfPayments: totalOfPaymentsResult.data,
    });
  } catch (error) {
    return Result.error("CalculationError");
  }
}