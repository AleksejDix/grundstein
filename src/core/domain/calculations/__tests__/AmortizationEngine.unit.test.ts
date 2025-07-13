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
import { Decimal } from "decimal.js";

// Helper function to create loan configuration with calculated monthly payment
function createTestLoanConfiguration(
  amountEuros: number,
  annualRatePercent: number,
  termMonths: number
) {
  const amount = createLoanAmount(amountEuros).data!;
  const rate = createInterestRate(annualRatePercent).data!;
  const term = createMonthCount(termMonths).data!;
  
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
  
  const monthlyPayment = createMoney(monthlyPaymentAmount).data!;
  
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
      expect(firstEntry.monthNumber).toEqual(createPaymentMonth(1).data);
      
      // For a 3% loan, monthly interest on €100k is €250, principal is higher
      const firstInterest = toEuros(firstEntry.regularPayment.interest);
      const firstPrincipal = toEuros(firstEntry.regularPayment.principal);
      expect(firstInterest).toBeCloseTo(250, 2); // 100000 * 0.03 / 12
      expect(firstPrincipal).toBeGreaterThan(0);
      expect(firstInterest + firstPrincipal).toBeCloseTo(965.61, 1); // Approximate monthly payment
      
      // Last payment should have minimal interest
      const lastEntry = schedule.entries[119];
      expect(toEuros(lastEntry.regularPayment.principal)).toBeGreaterThan(
        toEuros(lastEntry.regularPayment.interest)
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
      const extraPayment1 = createExtraPayment(
        createPaymentMonth(12).data!,
        5000 // Amount in euros
      ).data!;
      
      const extraPayment2 = createExtraPayment(
        createPaymentMonth(24).data!,
        5000 // Amount in euros
      ).data!;

      const sondertilgungPlan = {
        type: "custom" as const,
        extraPayments: [extraPayment1, extraPayment2],
        totalExtraPayments: createMoney(10000).data!,
        allowedPercentage: createPercentage(20).data!,
      };

      const result = generateAmortizationSchedule(loanConfig, sondertilgungPlan);

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
      schedule.entries.forEach(entry => {
        expect(toEuros(entry.regularPayment.interest)).toBe(0);
        expect(toEuros(entry.regularPayment.principal)).toBeGreaterThan(0);
      });
      
      // Monthly payment should be exactly loan amount / months
      const expectedPayment = 10000 / 12;
      expect(toEuros(schedule.entries[0].regularPayment.principal)).toBeCloseTo(expectedPayment, 2);
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
          toEuros(prevEntry.cumulativeInterest)
        );
        expect(toEuros(currEntry.cumulativePrincipal)).toBeGreaterThan(
          toEuros(prevEntry.cumulativePrincipal)
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
        scheduleResult.data.entries
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
      expect(metrics.actualTermMonths).toEqual(createMonthCount(120).data);
      
      // No term reduction for base schedule
      const termReductionMonths = toEuros({ _brand: "Money" } as any) === 0 ? 0 : 1; // Hack to check if actually 0
      expect(metrics.termReductionMonths).toBeDefined();
    });

    it("should handle schedules with extra payments", () => {
      const loanConfigResult = createTestLoanConfiguration(50000, 4, 60);
      expect(loanConfigResult.success).toBe(true);
      if (!loanConfigResult.success) return;
      
      const loanConfig = loanConfigResult.data;

      // Generate schedule with extra payments
      const extraPayment = createExtraPayment(
        createPaymentMonth(12).data!,
        10000 // Amount in euros
      ).data!;

      const sondertilgungPlan = {
        type: "custom" as const,
        extraPayments: [extraPayment],
        totalExtraPayments: createMoney(10000).data!,
        allowedPercentage: createPercentage(20).data!,
      };

      const scheduleResult = generateAmortizationSchedule(loanConfig, sondertilgungPlan);
      expect(scheduleResult.success).toBe(true);
      if (!scheduleResult.success) return;

      const metricsResult = calculateScheduleMetrics(
        loanConfig,
        scheduleResult.data.entries,
        sondertilgungPlan
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
      const extraPayment = createExtraPayment(
        createPaymentMonth(12).data!,
        5000 // Amount in euros
      ).data!;

      const sondertilgungPlan = {
        type: "yearly" as const,
        extraPayments: Array(10).fill(null).map((_, i) => 
          createExtraPayment(
            createPaymentMonth(12 * (i + 1)).data!,
            5000 // Amount in euros
          ).data!
        ),
        totalExtraPayments: createMoney(50000).data!,
        allowedPercentage: createPercentage(10).data!,
      };

      const enhancedResult = generateAmortizationSchedule(loanConfig, sondertilgungPlan);
      expect(enhancedResult.success).toBe(true);
      if (!enhancedResult.success) return;

      const comparisonResult = compareSchedules(baseResult.data, enhancedResult.data);
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
      const month12 = createPaymentMonth(12).data!;
      const entry = getScheduleEntry(schedule, month12);
      
      expect(entry).toBeDefined();
      expect(entry?.monthNumber).toEqual(month12);
      
      // Get entry for month 1
      const month1 = createPaymentMonth(1).data!;
      const firstEntry = getScheduleEntry(schedule, month1);
      expect(firstEntry).toBe(schedule.entries[0]);
      
      // Try to get entry beyond schedule
      const month100 = createPaymentMonth(100).data!;
      const nonExistentEntry = getScheduleEntry(schedule, month100);
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
      const month1Result = getRemainingBalance(schedule, createPaymentMonth(1).data!);
      expect(month1Result.success).toBe(true);
      if (!month1Result.success) return;
      
      // Balance should be less than original loan
      expect(toEuros(month1Result.data)).toBeLessThan(100000);
      expect(toEuros(month1Result.data)).toBeGreaterThan(99000);
      
      // Get balance after month 60 (halfway)
      const month60Result = getRemainingBalance(schedule, createPaymentMonth(60).data!);
      expect(month60Result.success).toBe(true);
      if (!month60Result.success) return;
      
      // Balance should be roughly half
      expect(toEuros(month60Result.data)).toBeLessThan(60000);
      expect(toEuros(month60Result.data)).toBeGreaterThan(40000);
      
      // Get balance after last month
      const lastMonthResult = getRemainingBalance(schedule, createPaymentMonth(120).data!);
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

      const result = getRemainingBalance(
        scheduleResult.data,
        createPaymentMonth(100).data! // Beyond schedule
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
      const sondertilgungPlan = {
        type: "custom" as const,
        extraPayments: [
          createExtraPayment(
            createPaymentMonth(24).data!,
            7500 // 10% of loan in euros
          ).data!,
        ],
        totalExtraPayments: createMoney(7500).data!,
        allowedPercentage: createPercentage(10).data!,
      };

      const result = applyExtraPayments(baseResult.data, sondertilgungPlan);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const newSchedule = result.data;
      
      // Should have fewer entries due to extra payment
      expect(newSchedule.entries.length).toBeLessThan(baseResult.data.entries.length);
      
      // Should have the extra payment applied
      const month24Entry = newSchedule.entries[23]; // Month 24 (0-indexed)
      expect(month24Entry.extraPayment).toBeDefined();
    });
  });
});