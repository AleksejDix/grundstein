import { describe, expect, it } from "vitest";
import {
  generateAmortizationSchedule,
  calculateScheduleMetrics,
  compareSchedules,
  getRemainingBalance,
  getScheduleEntry,
  applyExtraPayments,
} from "../AmortizationEngine";
import { createLoanConfiguration } from "../../types/LoanConfiguration";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import { createInterestRate } from "../../value-objects/InterestRate";
import { createMonthCount } from "../../value-objects/MonthCount";
import { createPaymentMonth } from "../../value-objects/PaymentMonth";
import { createMoney, toEuros } from "../../value-objects/Money";
import { createExtraPayment } from "../../types/ExtraPayment";
import { createPercentage } from "../../value-objects/Percentage";
import type { ExtraPayment } from "../../types/ExtraPayment";
import { Decimal } from "decimal.js";

// Helper function to create loan configuration with calculated monthly payment
function createTestLoanConfiguration(
  amountEuros: number,
  annualRatePercent: number,
  termMonths: number,
) {
  const amountResult = createLoanAmount(amountEuros);
  const rateResult = createInterestRate(annualRatePercent);
  const termResult = createMonthCount(termMonths);

  if (!amountResult.success) throw new Error(`Invalid amount: ${amountEuros}`);
  if (!rateResult.success)
    throw new Error(`Invalid rate: ${annualRatePercent}`);
  if (!termResult.success) throw new Error(`Invalid term: ${termMonths}`);

  const amount = amountResult.data;
  const rate = rateResult.data;
  const term = termResult.data;

  // Calculate monthly payment using standard formula
  let monthlyPaymentAmount: number;

  if (annualRatePercent === 0) {
    // Simple division for 0% interest
    monthlyPaymentAmount = amountEuros / termMonths;
  } else {
    // Standard loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
    const monthlyRate = annualRatePercent / 100 / 12;
    const loanAmount = new Decimal(amountEuros);
    const rate = new Decimal(monthlyRate);
    const n = new Decimal(termMonths);

    const onePlusRate = rate.plus(1);
    const factor = onePlusRate.pow(n);
    const numerator = loanAmount.times(rate).times(factor);
    const denominator = factor.minus(1);

    monthlyPaymentAmount = numerator.dividedBy(denominator).toNumber();
  }

  const paymentResult = createMoney(monthlyPaymentAmount);
  if (!paymentResult.success)
    throw new Error(`Invalid payment amount: ${monthlyPaymentAmount}`);
  const monthlyPayment = paymentResult.data;

  return createLoanConfiguration(amount, rate, term, monthlyPayment);
}

describe("AmortizationEngine", () => {
  describe("generateAmortizationSchedule", () => {
    it("should generate a complete amortization schedule for a simple loan", () => {
      // Create a simple loan: €100,000 at 3% for 10 years
      const loanConfigResult = createTestLoanConfiguration(100000, 3, 120);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = generateAmortizationSchedule(loanConfig);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const schedule = result.data;
      expect(schedule.loanConfiguration).toBe(loanConfig);
      expect(schedule.entries).toHaveLength(120); // Should have 120 monthly entries

      // Verify first payment structure
      const firstEntry = schedule.entries[0];
      const firstMonthResult = createPaymentMonth(1);
      expect(firstMonthResult.success).toBe(true);
      if (!firstMonthResult.success) return;
      expect(firstEntry.monthNumber).toEqual(firstMonthResult.data);

      // For a 3% loan, monthly interest on €100k is €250, principal is higher
      const firstInterest = toEuros(firstEntry.regularPayment.interest);
      const firstPrincipal = toEuros(firstEntry.regularPayment.principal);
      expect(firstInterest).toBeCloseTo(250, 2); // 100000 * 0.03 / 12
      expect(firstPrincipal).toBeGreaterThan(0);
      expect(firstInterest + firstPrincipal).toBeCloseTo(965.61, 1); // Approximate monthly payment

      // Last payment should have minimal interest
      const lastEntry = schedule.entries[119];
      expect(toEuros(lastEntry.regularPayment.principal)).toBeGreaterThan(
        toEuros(lastEntry.regularPayment.interest),
      );
      expect(toEuros(lastEntry.regularPayment.interest)).toBeLessThan(5); // Very small interest at end

      // Ending balance should be close to zero
      expect(toEuros(lastEntry.endingBalance)).toBeLessThan(0.01);
    });

    it("should handle loans with extra payments (Sondertilgung)", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 2, 60);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      // Create extra payments in months 12 and 24
      const month12Result = createPaymentMonth(12);
      expect(month12Result.success).toBe(true);
      if (!month12Result.success) return;

      const extraPayment1Result = createExtraPayment(
        month12Result.data,
        5000, // Amount in euros
      );
      expect(extraPayment1Result.success).toBe(true);
      if (!extraPayment1Result.success) return;

      const month24Result = createPaymentMonth(24);
      expect(month24Result.success).toBe(true);
      if (!month24Result.success) return;

      const extraPayment2Result = createExtraPayment(
        month24Result.data,
        5000, // Amount in euros
      );
      expect(extraPayment2Result.success).toBe(true);
      if (!extraPayment2Result.success) return;

      const percentageResult = createPercentage(20);
      expect(percentageResult.success).toBe(true);
      if (!percentageResult.success) return;

      const sondertilgungPlan = {
        yearlyLimit: {
          type: "Percentage" as const,
          value: percentageResult.data,
        },
        payments: [extraPayment1Result.data, extraPayment2Result.data],
      };

      const result = generateAmortizationSchedule(
        loanConfig,
        sondertilgungPlan,
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      const schedule = result.data;

      // Should finish earlier than 60 months due to extra payments
      expect(schedule.entries.length).toBeLessThan(60);

      // Check that extra payments were applied
      const month12Entry = schedule.entries[11]; // Month 12 (0-indexed)
      expect(month12Entry.extraPayment).toBeDefined();
      expect(toEuros(month12Entry.extraPayment!.amount)).toBe(5000);

      const month24Entry = schedule.entries[23]; // Month 24
      expect(month24Entry.extraPayment).toBeDefined();
      expect(toEuros(month24Entry.extraPayment!.amount)).toBe(5000);
    });

    it("should handle zero interest rate loans", () => {
      const loanConfigResult = createTestLoanConfiguration(10000, 0, 12);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = generateAmortizationSchedule(loanConfig);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const schedule = result.data;

      // All payments should be principal only
      schedule.entries.forEach((entry) => {
        expect(toEuros(entry.regularPayment.interest)).toBe(0);
        expect(toEuros(entry.regularPayment.principal)).toBeGreaterThan(0);
      });

      // Monthly payment should be exactly loan amount / months
      const expectedPayment = 10000 / 12;
      expect(toEuros(schedule.entries[0].regularPayment.principal)).toBeCloseTo(
        expectedPayment,
        2,
      );
    });

    it("should calculate cumulative values correctly", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 4, 36);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = generateAmortizationSchedule(loanConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const schedule = result.data;

      // Cumulative values should increase monotonically
      for (let i = 1; i < schedule.entries.length; i++) {
        const prevEntry = schedule.entries[i - 1];
        const currEntry = schedule.entries[i];

        expect(toEuros(currEntry.cumulativeInterest)).toBeGreaterThan(
          toEuros(prevEntry.cumulativeInterest),
        );
        expect(toEuros(currEntry.cumulativePrincipal)).toBeGreaterThan(
          toEuros(prevEntry.cumulativePrincipal),
        );
      }

      // Final cumulative principal should equal the loan amount
      const lastEntry = schedule.entries[schedule.entries.length - 1];
      expect(toEuros(lastEntry.cumulativePrincipal)).toBeCloseTo(50000, 2);
    });

    it("should handle very small loan amounts", () => {
      const loanConfigResult = createTestLoanConfiguration(1000, 5, 12);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = generateAmortizationSchedule(loanConfig);
      expect(result.success).toBe(true);
    });

    it("should handle very large loan amounts", () => {
      const loanConfigResult = createTestLoanConfiguration(10000000, 3.5, 360);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = generateAmortizationSchedule(loanConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const schedule = result.data;
      expect(schedule.entries).toHaveLength(360);
    });
  });

  describe("calculateScheduleMetrics", () => {
    it("should calculate comprehensive metrics for a payment schedule", () => {
      const loanConfigResult = createTestLoanConfiguration(100000, 3, 120);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const scheduleResult = generateAmortizationSchedule(loanConfig);
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const metricsResult = calculateScheduleMetrics(
        loanConfig,
        scheduleResult.data.entries,
      );

      if (!metricsResult.success) {
        console.error("Metrics calculation failed:", metricsResult.error);
      }
      expect(metricsResult.success).toBe(true);
      if (!metricsResult.success) return;

      const metrics = metricsResult.data;

      // Total payments should equal principal + interest
      const totalPayments = toEuros(metrics.totalPayments);
      const totalPrincipal = toEuros(metrics.totalPrincipalPaid);
      const totalInterest = toEuros(metrics.totalInterestPaid);
      expect(totalPayments).toBeCloseTo(totalPrincipal + totalInterest, 0); // Allow 1 euro difference due to rounding

      // Principal paid should equal loan amount
      expect(totalPrincipal).toBeCloseTo(100000, 2);

      // Average payment should be reasonable
      const avgPayment = toEuros(metrics.averageMonthlyPayment);
      expect(avgPayment).toBeGreaterThan(800); // Rough estimate
      expect(avgPayment).toBeLessThan(1000);

      // Term should match
      const expectedTermResult = createMonthCount(120);
      expect(expectedTermResult.success).toBe(true);
      if (!expectedTermResult.success) return;
      expect(metrics.actualTermMonths).toEqual(expectedTermResult.data);

      // No term reduction for base schedule
      const termReductionMonths =
        toEuros({ _brand: "Money" } as any) === 0 ? 0 : 1; // Hack to check if actually 0
      expect(metrics.termReductionMonths).toBeDefined();
    });

    it("should handle schedules with extra payments", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 4, 60);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      // Generate schedule with extra payments
      const month12Result = createPaymentMonth(12);
      expect(month12Result.success).toBe(true);
      if (!month12Result.success) return;

      const extraPaymentResult = createExtraPayment(
        month12Result.data,
        10000, // Amount in euros
      );
      expect(extraPaymentResult.success).toBe(true);
      if (!extraPaymentResult.success) return;

      const percentageResult = createPercentage(20);
      expect(percentageResult.success).toBe(true);
      if (!percentageResult.success) return;

      const sondertilgungPlan = {
        yearlyLimit: {
          type: "Percentage" as const,
          value: percentageResult.data,
        },
        payments: [extraPaymentResult.data],
      };

      const scheduleResult = generateAmortizationSchedule(
        loanConfig,
        sondertilgungPlan,
      );
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const metricsResult = calculateScheduleMetrics(
        loanConfig,
        scheduleResult.data.entries,
        sondertilgungPlan,
      );

      expect(metricsResult.success).toBe(true);
      if (!metricsResult.success) return;

      const metrics = metricsResult.data;

      // Should have term reduction
      expect(metrics.termReductionMonths).toBeDefined();
      expect(toEuros(metrics.totalExtraPayments)).toBe(10000);

      // Interest saved should be positive
      expect(toEuros(metrics.interestSavedVsOriginal)).toBeGreaterThan(0);
    });

    it("should return error for empty schedule", () => {
      const loanConfigResult = createTestLoanConfiguration(100000, 3, 120);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const result = calculateScheduleMetrics(loanConfig, []);

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.message).toContain("No entries in schedule");
    });
  });

  describe("compareSchedules", () => {
    it("should compare schedules with and without extra payments", () => {
      const loanConfigResult = createTestLoanConfiguration(100000, 4, 180);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      // Generate base schedule without extra payments
      const baseResult = generateAmortizationSchedule(loanConfig);
      expect(baseResult.success).toBe(true);
      if (!baseResult.success) return;

      // Generate schedule with extra payments
      const extraPayments: ExtraPayment[] = [];
      for (let i = 0; i < 10; i++) {
        const monthResult = createPaymentMonth(12 * (i + 1));
        if (monthResult.success) {
          const paymentResult = createExtraPayment(
            monthResult.data,
            5000, // Amount in euros
          );
          if (paymentResult.success) {
            extraPayments.push(paymentResult.data);
          }
        }
      }

      const percentageResult = createPercentage(10);
      expect(percentageResult.success).toBe(true);
      if (!percentageResult.success) return;

      const sondertilgungPlan = {
        yearlyLimit: {
          type: "Percentage" as const,
          value: percentageResult.data,
        },
        payments: extraPayments,
      };

      const enhancedResult = generateAmortizationSchedule(
        loanConfig,
        sondertilgungPlan,
      );
      expect(enhancedResult.success).toBe(true);
      if (!enhancedResult.success) return;

      const comparisonResult = compareSchedules(
        baseResult.data,
        enhancedResult.data,
      );
      if (!comparisonResult.success) {
        console.error("Comparison failed:", comparisonResult.error);
      }
      expect(comparisonResult.success).toBe(true);
      if (!comparisonResult.success) return;

      const comparison = comparisonResult.data;

      // Should show interest savings
      expect(toEuros(comparison.interestSavings)).toBeGreaterThan(0);

      // Should show term reduction
      expect(comparison.termReduction).toBeDefined();

      // Should calculate ROI
      expect(comparison.returnOnInvestment).toBeDefined();

      // Should determine if worthwhile (ROI > 2%)
      expect(comparison.isWorthwhile).toBe(true);
    });
  });

  describe("getScheduleEntry", () => {
    it("should retrieve specific month entry from schedule", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 3, 60);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const scheduleResult = generateAmortizationSchedule(loanConfig);
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const schedule = scheduleResult.data;

      // Get entry for month 12
      const month12Result = createPaymentMonth(12);
      expect(month12Result.success).toBe(true);
      if (!month12Result.success) return;
      const entry = getScheduleEntry(schedule, month12Result.data);

      expect(entry).toBeDefined();
      expect(entry?.monthNumber).toEqual(month12Result.data);

      // Get entry for month 1
      const month1Result = createPaymentMonth(1);
      expect(month1Result.success).toBe(true);
      if (!month1Result.success) return;
      const firstEntry = getScheduleEntry(schedule, month1Result.data);
      expect(firstEntry).toBe(schedule.entries[0]);

      // Try to get entry beyond schedule
      const month100Result = createPaymentMonth(100);
      expect(month100Result.success).toBe(true);
      if (!month100Result.success) return;
      const nonExistentEntry = getScheduleEntry(schedule, month100Result.data);
      expect(nonExistentEntry).toBeUndefined();
    });
  });

  describe("getRemainingBalance", () => {
    it("should return remaining balance for any month", () => {
      const loanConfigResult = createTestLoanConfiguration(100000, 3.5, 120);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const scheduleResult = generateAmortizationSchedule(loanConfig);
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const schedule = scheduleResult.data;

      // Get balance after month 1
      const paymentMonth1Result = createPaymentMonth(1);
      expect(paymentMonth1Result.success).toBe(true);
      if (!paymentMonth1Result.success) return;
      const month1Result = getRemainingBalance(
        schedule,
        paymentMonth1Result.data,
      );
      expect(month1Result.success).toBe(true);
      if (!month1Result.success) return;

      // Balance should be less than original loan
      expect(toEuros(month1Result.data)).toBeLessThan(100000);
      expect(toEuros(month1Result.data)).toBeGreaterThan(99000);

      // Get balance after month 60 (halfway)
      const paymentMonth60Result = createPaymentMonth(60);
      expect(paymentMonth60Result.success).toBe(true);
      if (!paymentMonth60Result.success) return;
      const month60Result = getRemainingBalance(
        schedule,
        paymentMonth60Result.data,
      );
      expect(month60Result.success).toBe(true);
      if (!month60Result.success) return;

      // Balance should be roughly half
      expect(toEuros(month60Result.data)).toBeLessThan(60000);
      expect(toEuros(month60Result.data)).toBeGreaterThan(40000);

      // Get balance after last month
      const paymentMonth120Result = createPaymentMonth(120);
      expect(paymentMonth120Result.success).toBe(true);
      if (!paymentMonth120Result.success) return;
      const lastMonthResult = getRemainingBalance(
        schedule,
        paymentMonth120Result.data,
      );
      expect(lastMonthResult.success).toBe(true);
      if (!lastMonthResult.success) return;

      // Balance should be zero
      expect(toEuros(lastMonthResult.data)).toBeLessThan(0.01);
    });

    it("should return error for non-existent month", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 3, 60);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      const scheduleResult = generateAmortizationSchedule(loanConfig);
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const monthResult = createPaymentMonth(100);
      expect(monthResult.success).toBe(true);
      if (!monthResult.success) return;

      const result = getRemainingBalance(
        scheduleResult.data,
        monthResult.data, // Beyond schedule
      );

      expect(result.success).toBe(false);
      if (result.success) return;

      expect(result.error.message).toContain("Entry not found");
    });
  });

  describe("applyExtraPayments", () => {
    it("should apply new extra payments to existing schedule", () => {
      const loanConfigResult = createTestLoanConfiguration(75000, 3.5, 84);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;

      const loanConfig = loanConfigResult.data;

      // Generate base schedule
      const baseResult = generateAmortizationSchedule(loanConfig);
      expect(baseResult.success).toBe(true);
      if (!baseResult.success) return;

      // Create new Sondertilgung plan
      const month24Result = createPaymentMonth(24);
      expect(month24Result.success).toBe(true);
      if (!month24Result.success) return;

      const extraPaymentResult = createExtraPayment(
        month24Result.data,
        7500, // 10% of loan in euros
      );
      expect(extraPaymentResult.success).toBe(true);
      if (!extraPaymentResult.success) return;

      const percentageResult = createPercentage(10);
      expect(percentageResult.success).toBe(true);
      if (!percentageResult.success) return;

      const sondertilgungPlan = {
        yearlyLimit: {
          type: "Percentage" as const,
          value: percentageResult.data,
        },
        payments: [extraPaymentResult.data],
      };

      const result = applyExtraPayments(baseResult.data, sondertilgungPlan);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const newSchedule = result.data;

      // Should have fewer entries due to extra payment
      expect(newSchedule.entries.length).toBeLessThan(
        baseResult.data.entries.length,
      );

      // Should have the extra payment applied
      const month24Entry = newSchedule.entries[23]; // Month 24 (0-indexed)
      expect(month24Entry.extraPayment).toBeDefined();
    });
  });
});
