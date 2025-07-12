/**
 * Tests for MortgageService - Application Layer Integration
 *
 * These tests validate that our service layer properly coordinates
 * domain calculations and provides clean interfaces for the UI.
 */

import { describe, it, expect } from "vitest";
import { MortgageService } from "../../services/application/services/MortgageService";

describe("MortgageService - Application Integration", () => {
  const service = MortgageService;

  describe("analyzeLoan", () => {
    it("should analyze a standard loan scenario", async () => {
      const loanInput = {
        loanAmount: 100000, // €100,000
        interestRate: 5.6, // 5.6%
        termYears: 7, // 7 years
      };

      const result = await service.analyzeLoan(loanInput);


      expect(result.success).toBe(true);

      if (result.success) {
        const analysis = result.data;


        // Validate against our known calculation: €100K @ 5.6% for 7 years ≈ €1,441.76
        expect(analysis.monthlyPayment.total).toBeCloseTo(1441.76, 0);

        // Should have reasonable principal/interest breakdown
        expect(analysis.monthlyPayment.principalPercentage).toBeGreaterThan(40);
        expect(analysis.monthlyPayment.principalPercentage).toBeLessThan(70);

        // Total payment should be loan + interest
        expect(analysis.totals.totalPaid).toBeCloseTo(
          analysis.totals.interestPaid + loanInput.loanAmount,
          0
        );

        // Term should match
        expect(analysis.totals.termInYears).toBe(7);
        expect(analysis.totals.termInMonths).toBe(84);

      }
    });

    it("should handle month-based term specification", async () => {
      const loanInput = {
        loanAmount: 50000,
        interestRate: 4.0,
        termMonths: 60, // 5 years in months
      };

      const result = await service.analyzeLoan(loanInput);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.totals.termInMonths).toBe(60);
        expect(result.data.totals.termInYears).toBe(5);

      }
    });

    it("should reject invalid loan parameters", async () => {
      const invalidInput = {
        loanAmount: -1000, // Negative amount
        interestRate: 5.0,
        termYears: 10,
      };

      const result = await service.analyzeLoan(invalidInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidLoanParameters");
      }

    });
  });

  describe("getQuickEstimate", () => {
    it("should provide quick loan estimates", () => {
      const estimate = service.getQuickEstimate(100000, 5.6, 7);


      // Should be close to our domain calculation
      expect(estimate.monthlyPayment).toBeCloseTo(1441.76, 0);
      expect(estimate.totalInterest).toBeGreaterThan(0);
      expect(estimate.totalPaid).toBeCloseTo(estimate.monthlyPayment * 84, 0);

    });

    it("should handle zero interest rate", () => {
      const estimate = service.getQuickEstimate(60000, 0, 5);

      // With 0% interest, payment should be loan amount / months
      const expectedPayment = 60000 / (5 * 12);
      expect(estimate.monthlyPayment).toBeCloseTo(expectedPayment, 2);
      expect(estimate.totalInterest).toBe(0);

    });
  });

  describe("analyzeSondertilgung", () => {
    it("should analyze extra payment scenarios", async () => {
      const baseLoan = {
        loanAmount: 80000,
        interestRate: 6.0,
        termYears: 10,
      };

      const extraPayments = [
        { month: 12, amount: 5000 }, // €5,000 at end of first year
        { month: 24, amount: 3000 }, // €3,000 at end of second year
      ];

      const result = await service.analyzeSondertilgung(
        baseLoan,
        extraPayments
      );


      expect(result.success).toBe(true);

      if (result.success) {
        const analysis = result.data;


        // Should have calculated extra payments correctly
        expect(analysis.impact.totalExtraPayments).toBe(8000);

        // Should have some interest savings
        expect(analysis.impact.totalInterestSaved).toBeGreaterThan(0);

        // Should calculate a return rate
        expect(analysis.impact.effectiveReturnRate).toBeGreaterThan(0);

      }
    });
  });

  describe("compareScenarios", () => {
    it("should compare multiple loan scenarios", async () => {
      const scenarios = [
        { loanAmount: 100000, interestRate: 5.0, termYears: 10 },
        { loanAmount: 100000, interestRate: 6.0, termYears: 10 },
        { loanAmount: 100000, interestRate: 5.0, termYears: 15 },
      ];

      const result = await service.compareScenarios(scenarios);


      expect(result.success).toBe(true);

      if (result.success) {
        const comparison = result.data;


        expect(comparison.scenarios.length).toBe(3);

        // Lower interest rate should result in lower total interest
        const scenario1 = comparison.scenarios[0]; // 5.0%
        const scenario2 = comparison.scenarios[1]; // 6.0%
        expect(scenario1.totals.interestPaid).toBeLessThan(
          scenario2.totals.interestPaid
        );

        // Longer term should result in lower monthly payment but higher total interest
        const scenario3 = comparison.scenarios[2]; // 15 years
        expect(scenario3.monthlyPayment.total).toBeLessThan(
          scenario1.monthlyPayment.total
        );
        expect(scenario3.totals.interestPaid).toBeGreaterThan(
          scenario1.totals.interestPaid
        );

      }
    });
  });

  describe("calculateAffordability", () => {
    it("should calculate affordability analysis", async () => {
      const result = await service.calculateAffordability(
        5000, // Monthly income
        3000, // Monthly expenses
        200000, // Desired loan amount
        5.5 // Interest rate
      );

      expect(result.success).toBe(true);

      if (result.success) {
        const analysis = result.data;


        // Available income: €2,000, so max payment should be 35% of that
        expect(analysis.maxAffordablePayment).toBeCloseTo(700, 0);

        // Should have a risk assessment
        expect(["low", "medium", "high"]).toContain(analysis.riskLevel);

      }
    });
  });
});
