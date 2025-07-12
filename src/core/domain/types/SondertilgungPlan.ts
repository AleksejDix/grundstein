import { Result } from "../primitives/Brand";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { Percentage } from "../value-objects/Percentage";
import type { ExtraPayment } from "./ExtraPayment";
import type { PaymentMonth } from "../value-objects/PaymentMonth";
import type { LoanAmount } from "../value-objects/LoanAmount";
import { toNumber } from "../value-objects/LoanAmount";

/**
 * Sondertilgung yearly limit types
 * - Percentage: Maximum percentage of original loan amount per year
 * - Unlimited: No yearly limit on extra payments
 */
export type SondertilgungLimit =
  | { readonly type: "Percentage"; readonly value: Percentage }
  | { readonly type: "Unlimited" };

/**
 * Sondertilgung plan containing yearly limits and scheduled extra payments
 */
export type SondertilgungPlan = {
  readonly yearlyLimit: SondertilgungLimit;
  readonly payments: readonly ExtraPayment[];
};

/**
 * Validation errors for Sondertilgung plans
 */
export type SondertilgungValidationError =
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
 * Create a percentage-based yearly limit
 */
export function createPercentageLimit(
  percentage: Percentage
): SondertilgungLimit {
  return { type: "Percentage", value: percentage };
}

/**
 * Create an unlimited yearly limit
 */
export function createUnlimitedLimit(): SondertilgungLimit {
  return { type: "Unlimited" };
}

/**
 * Create a Sondertilgung plan with validation
 */
export function createSondertilgungPlan(
  yearlyLimit: SondertilgungLimit,
  payments: ExtraPayment[],
  originalLoanAmount: LoanAmount
): Result<SondertilgungPlan, SondertilgungValidationError> {
  // Allow empty payments for unlimited plans (no extra payments configured)
  if (payments.length === 0 && yearlyLimit.type === "Percentage") {
    return { success: false, error: "NoPayments" };
  }

  // Check for duplicate payment months
  const months = payments.map((p) => p.month);
  const uniqueMonths = new Set(months);
  if (months.length !== uniqueMonths.size) {
    return { success: false, error: "DuplicatePaymentMonth" };
  }

  // Validate yearly limits if percentage-based
  if (yearlyLimit.type === "Percentage") {
    const yearlyTotals = calculateYearlyTotals(payments);
    const maxYearlyAmount = calculateMaxYearlyAmount(
      originalLoanAmount,
      yearlyLimit.value
    );

    for (const yearTotal of yearlyTotals.values()) {
      if (yearTotal > maxYearlyAmount) {
        return { success: false, error: "ExceedsYearlyLimit" };
      }
    }
  }

  return {
    success: true,
    data: { yearlyLimit, payments },
  };
}

/**
 * Calculate total extra payments by year
 */
function calculateYearlyTotals(
  payments: readonly ExtraPayment[]
): Map<number, number> {
  const yearlyTotals = new Map<number, number>();

  for (const payment of payments) {
    const year = Math.ceil(payment.month / 12);
    const currentTotal = yearlyTotals.get(year) || 0;
    yearlyTotals.set(year, currentTotal + toEuros(payment.amount));
  }

  return yearlyTotals;
}

/**
 * Calculate maximum yearly payment amount based on percentage limit
 */
function calculateMaxYearlyAmount(
  loanAmount: LoanAmount,
  percentage: Percentage
): number {
  return toNumber(loanAmount) * (percentage / 100);
}

/**
 * Get yearly payment summaries for analysis
 */
export function getYearlyPaymentSummaries(
  plan: SondertilgungPlan
): YearlyPaymentSummary[] {
  const yearlyData = new Map<
    number,
    { total: number; count: number; payments: ExtraPayment[] }
  >();

  // Group payments by year
  for (const payment of plan.payments) {
    const year = Math.ceil(payment.month / 12);
    const current = yearlyData.get(year) || {
      total: 0,
      count: 0,
      payments: [],
    };

    yearlyData.set(year, {
      total: current.total + payment.amount,
      count: current.count + 1,
      payments: [...current.payments, payment],
    });
  }

  // Convert to summaries
  return Array.from(yearlyData.entries())
    .map(([year, data]) => {
      const totalMoneyResult = createMoney(data.total);
      const avgMoneyResult = createMoney(data.total / data.count);

      if (!totalMoneyResult.success || !avgMoneyResult.success) {
        throw new Error("Failed to create Money for payment summary");
      }

      return {
        year,
        totalAmount: totalMoneyResult.data,
        paymentCount: data.count,
        averagePayment: avgMoneyResult.data,
      };
    })
    .sort((a, b) => a.year - b.year);
}

/**
 * Check if adding a payment would exceed yearly limit
 */
export function canAddPayment(
  plan: SondertilgungPlan,
  newPayment: ExtraPayment,
  originalLoanAmount: LoanAmount
): boolean {
  if (plan.yearlyLimit.type === "Unlimited") {
    return true;
  }

  const year = Math.ceil(newPayment.month / 12);
  const yearlyTotals = calculateYearlyTotals([
    ...Array.from(plan.payments),
    newPayment,
  ]);
  const maxYearlyAmount = calculateMaxYearlyAmount(
    originalLoanAmount,
    plan.yearlyLimit.value
  );

  return (yearlyTotals.get(year) || 0) <= maxYearlyAmount;
}

/**
 * Get remaining yearly limit for a specific year
 */
export function getRemainingYearlyLimit(
  plan: SondertilgungPlan,
  year: number,
  originalLoanAmount: LoanAmount
): Money | null {
  if (plan.yearlyLimit.type === "Unlimited") {
    return null; // No limit
  }

  const yearlyTotals = calculateYearlyTotals(plan.payments);
  const usedAmount = yearlyTotals.get(year) || 0;
  const maxAmount = calculateMaxYearlyAmount(
    originalLoanAmount,
    plan.yearlyLimit.value
  );

  const remainingAmount = Math.max(0, maxAmount - usedAmount);
  const result = createMoney(remainingAmount);
  if (!result.success) {
    throw new Error("Failed to create Money for remaining limit");
  }
  return result.data;
}

/**
 * Add payment to plan with validation
 */
export function addPaymentToPlan(
  plan: SondertilgungPlan,
  newPayment: ExtraPayment,
  originalLoanAmount: LoanAmount
): Result<SondertilgungPlan, SondertilgungValidationError> {
  // Check for duplicate month
  const existingMonths = plan.payments.map((p) => p.month);
  if (existingMonths.includes(newPayment.month)) {
    return { success: false, error: "DuplicatePaymentMonth" };
  }

  // Check yearly limit
  if (!canAddPayment(plan, newPayment, originalLoanAmount)) {
    return { success: false, error: "ExceedsYearlyLimit" };
  }

  const updatedPayments = [...plan.payments, newPayment].sort(
    (a, b) => a.month - b.month
  );

  return {
    success: true,
    data: {
      yearlyLimit: plan.yearlyLimit,
      payments: updatedPayments,
    },
  };
}

/**
 * Remove payment from plan
 */
export function removePaymentFromPlan(
  plan: SondertilgungPlan,
  month: PaymentMonth
): SondertilgungPlan {
  const updatedPayments = plan.payments.filter((p) => p.month !== month);

  return {
    yearlyLimit: plan.yearlyLimit,
    payments: updatedPayments,
  };
}

/**
 * Get total amount of all extra payments
 */
export function getTotalExtraPayments(plan: SondertilgungPlan): Money {
  const totalAmount = plan.payments.reduce(
    (total, payment) => total + toEuros(payment.amount),
    0
  );
  const result = createMoney(totalAmount);
  if (!result.success) {
    throw new Error("Failed to create Money for total extra payments");
  }
  return result.data;
}

/**
 * Format Sondertilgung limit for display
 */
export function formatSondertilgungLimit(limit: SondertilgungLimit): string {
  switch (limit.type) {
    case "Percentage":
      return `Maximal ${limit.value}% der Darlehenssumme pro Jahr`;
    case "Unlimited":
      return "Unbegrenzte Sondertilgungen";
  }
}

/**
 * Format Sondertilgung plan summary
 */
export function formatSondertilgungPlan(plan: SondertilgungPlan): string {
  const totalPayments = plan.payments.length;
  const totalAmount = getTotalExtraPayments(plan);
  const limitText = formatSondertilgungLimit(plan.yearlyLimit);

  return `Sondertilgungsplan: ${totalPayments} Zahlungen, Gesamt: €${totalAmount.toFixed(
    2
  )} (${limitText})`;
}
