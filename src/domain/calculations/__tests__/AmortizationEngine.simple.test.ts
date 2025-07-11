/**
 * Simple Tests for Amortization Engine
 * Testing the core complete payment schedule generation
 */

import { describe, it, expect } from "vitest";
import { generateAmortizationSchedule } from "../AmortizationEngine";
import { createLoanAmount } from "../../types/LoanAmount";
import { createInterestRate } from "../../types/InterestRate";
import { createMonthCount } from "../../types/MonthCount";
import { createMoney, toEuros } from "../../types/Money";

describe("AmortizationEngine - Core Functions", () => {
  it("should generate a complete payment schedule", () => {
    // Create a simple loan: €50,000 at 5% for 5 years (60 months)
    const amount = createLoanAmount(50000);
    const rate = createInterestRate(5.0);
    const term = createMonthCount(60);
    const payment = createMoney(1000); // Placeholder

    expect(amount.success).toBe(true);
    expect(rate.success).toBe(true);
    expect(term.success).toBe(true);
    expect(payment.success).toBe(true);

    if (amount.success && rate.success && term.success && payment.success) {
      // Create loan configuration
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = generateAmortizationSchedule(loanConfig);

      console.log(
        "Amortization schedule result:",
        result.success ? "SUCCESS" : "FAILED"
      );

      if (result.success) {
        const schedule = result.data;

        console.log("Schedule entries:", schedule.entries.length);
        console.log(
          "First entry payment:",
          toEuros(schedule.entries[0].totalPaymentAmount)
        );
        console.log(
          "Last entry balance:",
          toEuros(schedule.entries[schedule.entries.length - 1].endingBalance)
        );

        // Basic validation
        expect(schedule.entries.length).toBeGreaterThan(0);
        expect(schedule.entries.length).toBeLessThanOrEqual(60);

        // First entry should have starting balance equal to loan amount
        const firstEntry = schedule.entries[0];
        expect(toEuros(firstEntry.startingBalance)).toBeCloseTo(50000, 2);

        // Last entry should have near-zero balance
        const lastEntry = schedule.entries[schedule.entries.length - 1];
        expect(toEuros(lastEntry.endingBalance)).toBeLessThan(1);

        // Each entry should have positive payment amounts
        schedule.entries.forEach((entry) => {
          expect(toEuros(entry.totalPaymentAmount)).toBeGreaterThan(0);
          expect(toEuros(entry.regularPayment.total)).toBeGreaterThan(0);
        });

        console.log("✅ All basic validations passed");
      } else {
        console.log("❌ Schedule generation failed with error:", result.error);
        expect(result.success).toBe(true); // Force test failure with error info
      }
    }
  });

  it("should handle loan payoff correctly", () => {
    // Very short loan to test payoff logic
    const amount = createLoanAmount(12000);
    const rate = createInterestRate(6.0);
    const term = createMonthCount(12); // 1 year
    const payment = createMoney(1100); // High payment to ensure payoff

    if (amount.success && rate.success && term.success && payment.success) {
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = generateAmortizationSchedule(loanConfig);

      if (result.success) {
        const schedule = result.data;

        console.log("Short loan schedule entries:", schedule.entries.length);

        // Should complete in 12 months or less
        expect(schedule.entries.length).toBeLessThanOrEqual(12);

        // Final balance should be zero or very close
        const lastEntry = schedule.entries[schedule.entries.length - 1];
        expect(toEuros(lastEntry.endingBalance)).toBeLessThan(0.01);

        console.log("✅ Loan payoff validation passed");
      } else {
        console.log("❌ Short loan generation failed:", result.error);
        expect(result.success).toBe(true);
      }
    }
  });

  it("should calculate decreasing balance over time", () => {
    // Test that balance decreases month over month
    const amount = createLoanAmount(30000);
    const rate = createInterestRate(4.0);
    const term = createMonthCount(36); // 3 years
    const payment = createMoney(900);

    if (amount.success && rate.success && term.success && payment.success) {
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = generateAmortizationSchedule(loanConfig);

      if (result.success) {
        const schedule = result.data;

        // Verify decreasing balance
        for (let i = 1; i < schedule.entries.length; i++) {
          const previousBalance = toEuros(
            schedule.entries[i - 1].endingBalance
          );
          const currentBalance = toEuros(schedule.entries[i].endingBalance);

          expect(currentBalance).toBeLessThanOrEqual(previousBalance);
        }

        console.log("✅ Decreasing balance validation passed");
      } else {
        console.log("❌ Balance test failed:", result.error);
        expect(result.success).toBe(true);
      }
    }
  });
});
