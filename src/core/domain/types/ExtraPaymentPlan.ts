import { Result } from "../primitives/Brand";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { ExtraPayment } from "./ExtraPayment";
import type { PaymentMonth } from "../value-objects/PaymentMonth";
import type { LoanAmount } from "../value-objects/LoanAmount";
import { toNumber } from "../value-objects/LoanAmount";
import type { ExtraPaymentLimit } from "./ExtraPaymentRules";

/**
 * Extra payment plan containing yearly limits and scheduled extra payments
 */
export type ExtraPaymentPlan = {
  readonly yearlyLimit: ExtraPaymentLimit;
  readonly payments: readonly ExtraPayment[];
};

/**
 * Validation errors for extra payment plans
 */
export type ExtraPaymentPlanValidationError =
  | "ExceedsYearlyLimit"
  | "DuplicatePaymentMonth"
  | "InvalidPaymentAmount"
  | "NoPayments";

/**
 * Analysis of yearly payment totals
 */
export type YearlyPaymentSummary = {
  readonly year: number;
  readonly totalAmount: Money;
  readonly paymentCount: number;
  readonly averagePayment: Money;
};

/**
 * Create an extra payment plan
 */
export function createExtraPaymentPlan(
  yearlyLimit: ExtraPaymentLimit,
  payments: readonly ExtraPayment[] = []
): Result<ExtraPaymentPlan, ExtraPaymentPlanValidationError> {
  if (payments.length === 0) {
    return Result.error("NoPayments");
  }

  // Check for duplicate payment months
  const paymentMonths = new Set<number>();
  for (const payment of payments) {
    const monthNumber = (payment as any).month;
    if (paymentMonths.has(monthNumber)) {
      return Result.error("DuplicatePaymentMonth");
    }
    paymentMonths.add(monthNumber);
  }

  return Result.ok({
    yearlyLimit,
    payments
  });
}

/**
 * Validate extra payment plan against loan amount
 */
export function validateExtraPaymentPlan(
  plan: ExtraPaymentPlan,
  originalLoanAmount: LoanAmount
): Result<void, ExtraPaymentPlanValidationError> {
  const loanAmount = toNumber(originalLoanAmount);
  
  // Group payments by year and validate yearly limits
  const yearlyTotals = new Map<number, number>();
  
  for (const payment of plan.payments) {
    const year = Math.ceil((payment as any).month / 12);
    const amount = toEuros((payment as any).amount);
    
    const currentTotal = yearlyTotals.get(year) || 0;
    yearlyTotals.set(year, currentTotal + amount);
  }

  // Check each year against limit
  for (const [year, totalAmount] of yearlyTotals) {
    if (plan.yearlyLimit.type === "Percentage") {
      const maxAllowed = loanAmount * (plan.yearlyLimit.value / 100);
      if (totalAmount > maxAllowed) {
        return Result.error("ExceedsYearlyLimit");
      }
    }
    // Unlimited has no restrictions
  }

  return Result.ok(undefined);
}

/**
 * Calculate yearly payment summaries
 */
export function calculateYearlyPaymentSummaries(
  plan: ExtraPaymentPlan
): YearlyPaymentSummary[] {
  const yearlyData = new Map<number, { total: number; count: number }>();
  
  for (const payment of plan.payments) {
    const year = Math.ceil((payment as any).month / 12);
    const amount = toEuros((payment as any).amount);
    
    const current = yearlyData.get(year) || { total: 0, count: 0 };
    yearlyData.set(year, {
      total: current.total + amount,
      count: current.count + 1
    });
  }

  return Array.from(yearlyData.entries())
    .map(([year, data]) => {
      const totalAmountResult = createMoney(data.total);
      const averagePaymentResult = createMoney(data.total / data.count);
      
      // Skip entries where money creation fails
      if (!totalAmountResult.success || !averagePaymentResult.success) {
        return null;
      }
      
      return {
        year,
        totalAmount: totalAmountResult.data,
        paymentCount: data.count,
        averagePayment: averagePaymentResult.data
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.year - b.year);
}

/**
 * Format extra payment plan for display
 */
export function formatExtraPaymentPlan(plan: ExtraPaymentPlan): string {
  const limitText = plan.yearlyLimit.type === "Unlimited" 
    ? "Unlimited" 
    : `${plan.yearlyLimit.value}% yearly limit`;
    
  return `${plan.payments.length} payments, ${limitText}`;
}