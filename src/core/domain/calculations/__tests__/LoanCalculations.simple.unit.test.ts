/**
 * Simple Tests for Core Loan Calculation Functions
 * Testing mathematical correctness without complex setup
 */

import { describe, it, expect } from "vitest";
import { calculateMonthlyPayment } from "../LoanCalculations";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import { createInterestRate } from "../../value-objects/InterestRate";
import { createMonthCount } from "../../value-objects/MonthCount";
import { createMoney, toEuros } from "../../value-objects/Money";

describe("LoanCalculations - Core Functions", () => {
  it("should calculate monthly payment correctly", () => {
    // Create a simple loan: €100,000 at 5% for 5 years (60 months)
    const amount = createLoanAmount(100000);
    const rate = createInterestRate(5.0);
    const term = createMonthCount(60);
    const payment = createMoney(1000); // Placeholder

    expect(amount.success).toBe(true);
    expect(rate.success).toBe(true);
    expect(term.success).toBe(true);
    expect(payment.success).toBe(true);

    if (amount.success && rate.success && term.success && payment.success) {
      // Create a basic loan configuration object
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = calculateMonthlyPayment(loanConfig);

      // console.log("Payment calculation result:", result);

      if (result.success) {
        const monthlyPayment = toEuros(result.data.total);
        // console.log("Calculated monthly payment:", monthlyPayment);

        // €100k at 5% for 60 months should be around €1,887
        expect(monthlyPayment).toBeGreaterThan(1800);
        expect(monthlyPayment).toBeLessThan(2000);
      } else {
        // console.log("Payment calculation failed with error:", result.error);
        expect(result.success).toBe(true); // Force test failure with error info
      }
    }
  });

  it("should handle zero interest rate", () => {
    const amount = createLoanAmount(60000);
    const rate = createInterestRate(0.0);
    const term = createMonthCount(60);
    const payment = createMoney(1000);

    if (amount.success && rate.success && term.success && payment.success) {
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = calculateMonthlyPayment(loanConfig);

      if (result.success) {
        const monthlyPayment = toEuros(result.data.total);
        const expectedPayment = 60000 / 60; // €1,000

        expect(monthlyPayment).toBeCloseTo(expectedPayment, 2);
        expect(toEuros(result.data.interest)).toBe(0);
      } else {
        // console.log("Zero interest calculation failed:", result.error);
        expect(result.success).toBe(true);
      }
    }
  });

  it("should validate our real-world example", () => {
    // Test our known good example: €100k at 5.6% for 7 years
    const amount = createLoanAmount(100000);
    const rate = createInterestRate(5.6);
    const term = createMonthCount(84); // 7 years
    const payment = createMoney(1000);

    if (amount.success && rate.success && term.success && payment.success) {
      const loanConfig = {
        amount: amount.data,
        annualRate: rate.data,
        termInMonths: term.data,
        monthlyPayment: payment.data,
      };

      const result = calculateMonthlyPayment(loanConfig);

      if (result.success) {
        const monthlyPayment = toEuros(result.data.total);

        // Should be approximately €1,441.76 based on real-world validation
        expect(monthlyPayment).toBeCloseTo(1441.76, 0);

        /*
        console.log(
          "Real-world validation - Expected: €1,441.76, Got:",
          monthlyPayment
        );
        */
      } else {
        // console.log("Real-world calculation failed:", result.error);
        expect(result.success).toBe(true);
      }
    }
  });
});
