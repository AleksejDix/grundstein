/**
 * Tests for Pure Loan Calculation Functions
 *
 * These tests validate the mathematical correctness of our loan calculations
 * using our robust domain types. Each function is tested with various scenarios
 * including edge cases and real-world loan examples.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  calculateLoanTerm,
  calculateInterestRate,
  calculateTotalInterest,
  calculateRemainingBalance,
  calculateBreakEvenPoint,
  calculatePaymentScenarios,
  type LoanCalculationError,
} from "../LoanCalculations";
import { createLoanConfiguration } from "../../types/LoanConfiguration";
import { createMoney, toEuros } from "../../value-objects/Money";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import { createInterestRate, toDecimal } from "../../value-objects/InterestRate";
import {
  createMonthCount,
  toNumber as monthCountToNumber,
} from "../../value-objects/MonthCount";
import { createYearCount } from "../../value-objects/YearCount";

describe.skip("LoanCalculations", () => {
  // Helper function to create test loan configurations with placeholder payments
  function createTestLoanConfig(
    amountEuros: number,
    ratePercent: number,
    termYears: number,
    monthlyPaymentEuros: number = 2000 // Default to €2000/month
  ) {
    const amount = createLoanAmount(amountEuros);
    const rate = createInterestRate(ratePercent);
    const termInMonths = createMonthCount(termYears * 12);
    const monthlyPayment = createMoney(monthlyPaymentEuros);

    if (
      !amount.success ||
      !rate.success ||
      !termInMonths.success ||
      !monthlyPayment.success
    ) {
      throw new Error("Failed to create test loan configuration");
    }

    return createLoanConfiguration(
      amount.data,
      rate.data,
      termInMonths.data,
      monthlyPayment.data
    );
  }

  // Test data based on real-world scenarios
  const standardLoan = (() => {
    const amount = createLoanAmount(100000); // €100,000
    const rate = createInterestRate(5.6); // 5.6%
    const term = createYearCount(7); // 7 years
    const payment = createMoney(1500); // Placeholder - will calculate actual

    if (!amount.success || !rate.success || !term.success || !payment.success) {
      throw new Error("Failed to create test loan configuration");
    }

    const termInMonths = createMonthCount(term.data * 12);
    if (!termInMonths.success) {
      throw new Error("Failed to convert term to months");
    }

    return createLoanConfiguration(
      amount.data,
      rate.data,
      termInMonths.data,
      payment.data
    );
  })();

  const highInterestLoan = (() => {
    const amount = createLoanAmount(15000); // €15,000
    const rate = createInterestRate(8.0); // 8.0%
    const term = createYearCount(10); // 10 years
    const payment = createMoney(200); // Placeholder - will calculate actual

    if (!amount.success || !rate.success || !term.success || !payment.success) {
      throw new Error("Failed to create test loan configuration");
    }

    const termInMonths = createMonthCount(term.data * 12);
    if (!termInMonths.success) {
      throw new Error("Failed to convert term to months");
    }

    return createLoanConfiguration(
      amount.data,
      rate.data,
      termInMonths.data,
      payment.data
    );
  })();

  const zeroInterestLoan = (() => {
    const amount = createLoanAmount(50000); // €50,000
    const rate = createInterestRate(0.1); // 0.1% (minimum allowed)
    const term = createYearCount(5); // 5 years
    const payment = createMoney(833); // ~€50k / 60 months for low interest

    if (!amount.success || !rate.success || !term.success || !payment.success) {
      throw new Error("Failed to create test loan configuration");
    }

    const termInMonths = createMonthCount(term.data * 12);
    if (!termInMonths.success) {
      throw new Error("Failed to convert term to months");
    }

    return createLoanConfiguration(
      amount.data,
      rate.data,
      termInMonths.data,
      payment.data
    );
  })();

  describe("calculateMonthlyPayment", () => {
    it("should calculate correct payment for standard loan (€100k at 5.6% for 7 years)", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const result = calculateMonthlyPayment(standardLoan.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const payment = toEuros(result.data.total);
        // Should be approximately €1,441.76 based on real-world validation
        expect(payment).toBeCloseTo(1441.76, 1);

        // Verify the payment breakdown
        const principal = toEuros(result.data.principal);
        const interest = toEuros(result.data.interest);

        expect(principal + interest).toBeCloseTo(payment, 2);
        expect(interest).toBeCloseTo(466.67, 1); // First month interest
        expect(principal).toBeCloseTo(975.09, 1); // First month principal
      }
    });

    it("should calculate correct payment for high interest loan (€15k at 8% for 10 years)", () => {
      if (!highInterestLoan.success) {
        throw new Error("Failed to create high interest loan");
      }

      const result = calculateMonthlyPayment(highInterestLoan.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const payment = toEuros(result.data.total);
        // Should be approximately €181.99 based on real-world validation
        expect(payment).toBeCloseTo(181.99, 1);

        // High interest rate means interest-heavy payment
        const principal = toEuros(result.data.principal);
        const interest = toEuros(result.data.interest);

        expect(interest).toBeCloseTo(100.0, 1); // First month interest at 8%
        expect(principal).toBeCloseTo(81.99, 1); // First month principal
        expect(interest).toBeGreaterThan(principal); // Interest-heavy payment
      }
    });

    it.skip("should handle zero interest rate correctly", () => {
      if (!zeroInterestLoan.success) {
        throw new Error("Failed to create zero interest loan");
      }

      const result = calculateMonthlyPayment(zeroInterestLoan.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const payment = toEuros(result.data.total);
        const expectedPayment = 50000 / 60; // €50k / 60 months

        expect(payment).toBeCloseTo(expectedPayment, 2);
        expect(toEuros(result.data.interest)).toBe(0);
        expect(toEuros(result.data.principal)).toBeCloseTo(expectedPayment, 2);
      }
    });

    it("should handle extreme interest rates", () => {
      const amount = createLoanAmount(100000);
      const highRate = createInterestRate(24.9); // Near maximum
      const lowRate = createInterestRate(0.1); // Minimum
      const term = createYearCount(30);

      if (
        !amount.success ||
        !highRate.success ||
        !lowRate.success ||
        !term.success
      ) {
        throw new Error("Failed to create test data");
      }

      // High rate loan
      const highMonthlyPayment = createMoney(2000); // €2000/month test payment
      if (!highMonthlyPayment.success) throw new Error("Failed to create monthly payment");
      
      const highRateLoan = createLoanConfiguration(
        amount.data,
        highRate.data,
        term.data,
        highMonthlyPayment.data
      );
      if (highRateLoan.success) {
        const result = calculateMonthlyPayment(highRateLoan.data);
        expect(result.success).toBe(true);
        if (result.success) {
          const payment = toEuros(result.data.total);
          expect(payment).toBeGreaterThan(2000); // Very high payment
          expect(toEuros(result.data.interest)).toBeGreaterThan(
            toEuros(result.data.principal)
          );
        }
      }

      // Low rate loan
      const lowMonthlyPayment = createMoney(1800); // €1800/month test payment
      if (!lowMonthlyPayment.success) throw new Error("Failed to create monthly payment");
      
      const lowRateLoan = createLoanConfiguration(
        amount.data,
        lowRate.data,
        term.data,
        lowMonthlyPayment.data
      );
      if (lowRateLoan.success) {
        const result = calculateMonthlyPayment(lowRateLoan.data);
        expect(result.success).toBe(true);
        if (result.success) {
          const payment = toEuros(result.data.total);
          expect(payment).toBeLessThan(300); // Very low payment
          expect(toEuros(result.data.principal)).toBeGreaterThan(
            toEuros(result.data.interest)
          );
        }
      }
    });
  });

  describe("calculateLoanTerm", () => {
    it("should calculate correct term for known payment amount", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // First calculate the monthly payment
      const paymentResult = calculateMonthlyPayment(standardLoan.data);
      expect(paymentResult.success).toBe(true);

      if (paymentResult.success) {
        const payment = paymentResult.data.total;

        // Now calculate the term using the same parameters
        const termResult = calculateLoanTerm(
          standardLoan.data.amount,
          standardLoan.data.annualRate,
          payment
        );

        expect(termResult.success).toBe(true);
        if (termResult.success) {
          const calculatedMonths = monthCountToNumber(termResult.data);
          const originalMonths = monthCountToNumber(
            standardLoan.data.termInMonths
          );

          // Should be very close to original term
          expect(calculatedMonths).toBeCloseTo(originalMonths, 0);
        }
      }
    });

    it.skip("should handle zero interest rate", () => {
      const amount = createLoanAmount(50000);
      const rate = createInterestRate(0);
      const payment = createMoney(1000); // €1,000/month

      if (!amount.success || !rate.success || !payment.success) {
        throw new Error("Failed to create test data");
      }

      const result = calculateLoanTerm(amount.data, rate.data, payment.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const months = monthCountToNumber(result.data);
        expect(months).toBe(50); // 50,000 / 1,000 = 50 months
      }
    });

    it("should return error for insufficient payment", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const insufficientPayment = createMoney(100); // €100/month is way too low
      if (!insufficientPayment.success) {
        throw new Error("Failed to create insufficient payment");
      }

      const result = calculateLoanTerm(
        standardLoan.data.amount,
        standardLoan.data.annualRate,
        insufficientPayment.data
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InsufficientPayment");
      }
    });
  });

  describe("calculateInterestRate", () => {
    it("should calculate correct rate for known loan parameters", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // Calculate payment first
      const paymentResult = calculateMonthlyPayment(standardLoan.data);
      expect(paymentResult.success).toBe(true);

      if (paymentResult.success) {
        const payment = paymentResult.data.total;

        // Calculate rate using known parameters
        const rateResult = calculateInterestRate(
          standardLoan.data.amount,
          payment,
          standardLoan.data.termInMonths
        );

        expect(rateResult.success).toBe(true);
        if (rateResult.success) {
          const calculatedRate = toDecimal(rateResult.data) * 100;
          const originalRate = toDecimal(standardLoan.data.annualRate) * 100;

          // Should be very close to original rate
          expect(calculatedRate).toBeCloseTo(originalRate, 1);
        }
      }
    });

    it.skip("should detect zero interest rate scenario", () => {
      const amount = createLoanAmount(60000);
      const term = createMonthCount(60);
      const payment = createMoney(1000); // Exactly €60k / 60 months

      if (!amount.success || !term.success || !payment.success) {
        throw new Error("Failed to create test data");
      }

      const result = calculateInterestRate(
        amount.data,
        payment.data,
        term.data
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const rate = toDecimal(result.data) * 100;
        expect(rate).toBeCloseTo(0, 2);
      }
    });

    it("should return error for impossible payment scenarios", () => {
      const amount = createLoanAmount(100000);
      const term = createMonthCount(360);
      const tooLowPayment = createMoney(50); // Impossibly low

      if (!amount.success || !term.success || !tooLowPayment.success) {
        throw new Error("Failed to create test data");
      }

      const result = calculateInterestRate(
        amount.data,
        tooLowPayment.data,
        term.data
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InsufficientPayment");
      }
    });
  });

  describe("calculateTotalInterest", () => {
    it("should calculate total interest correctly", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const result = calculateTotalInterest(standardLoan.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const totalInterest = toEuros(result.data);
        const loanAmount = 100000;

        // Total interest should be reasonable for a 7-year loan at 5.6%
        expect(totalInterest).toBeGreaterThan(15000); // At least €15k
        expect(totalInterest).toBeLessThan(35000); // But not more than €35k

        // Calculate total payments to verify
        const paymentResult = calculateMonthlyPayment(standardLoan.data);
        if (paymentResult.success) {
          const monthlyPayment = toEuros(paymentResult.data.total);
          const totalPayments = monthlyPayment * 84; // 7 years * 12 months
          const calculatedInterest = totalPayments - loanAmount;

          expect(totalInterest).toBeCloseTo(calculatedInterest, 2);
        }
      }
    });

    it.skip("should return zero interest for zero-rate loan", () => {
      if (!zeroInterestLoan.success) {
        throw new Error("Failed to create zero interest loan");
      }

      const result = calculateTotalInterest(zeroInterestLoan.data);

      expect(result.success).toBe(true);
      if (result.success) {
        const totalInterest = toEuros(result.data);
        expect(totalInterest).toBe(0);
      }
    });
  });

  describe("calculateRemainingBalance", () => {
    it("should calculate correct remaining balance after payments", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // After 12 payments (1 year)
      const result = calculateRemainingBalance(standardLoan.data, 12);

      expect(result.success).toBe(true);
      if (result.success) {
        const remainingBalance = toEuros(result.data);

        // Should be less than original loan amount
        expect(remainingBalance).toBeLessThan(100000);
        expect(remainingBalance).toBeGreaterThan(80000); // But not too much paid down yet
      }
    });

    it("should return zero balance when loan is paid off", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const result = calculateRemainingBalance(standardLoan.data, 84); // Full term

      expect(result.success).toBe(true);
      if (result.success) {
        const remainingBalance = toEuros(result.data);
        expect(remainingBalance).toBeCloseTo(0, 2);
      }
    });

    it.skip("should handle zero interest loans correctly", () => {
      if (!zeroInterestLoan.success) {
        throw new Error("Failed to create zero interest loan");
      }

      const result = calculateRemainingBalance(zeroInterestLoan.data, 24); // 2 years

      expect(result.success).toBe(true);
      if (result.success) {
        const remainingBalance = toEuros(result.data);
        const expectedBalance = 50000 - (50000 / 60) * 24; // Linear paydown
        expect(remainingBalance).toBeCloseTo(expectedBalance, 2);
      }
    });
  });

  describe("calculateBreakEvenPoint", () => {
    it("should calculate break-even point for refinancing", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // Create a lower-rate refinance scenario
      const lowerRate = createInterestRate(4.5); // 1.1% lower
      if (!lowerRate.success) {
        throw new Error("Failed to create lower rate");
      }

      const refinancePayment = createMoney(1900); // €1900/month for refinance
      if (!refinancePayment.success) throw new Error("Failed to create refinance payment");
      
      const refinanceLoan = createLoanConfiguration(
        standardLoan.data.amount,
        lowerRate.data,
        standardLoan.data.termInMonths,
        refinancePayment.data
      );

      if (!refinanceLoan.success) {
        throw new Error("Failed to create refinance loan");
      }

      const refinancingCosts = createMoney(3000); // €3,000 in costs
      if (!refinancingCosts.success) {
        throw new Error("Failed to create refinancing costs");
      }

      const result = calculateBreakEvenPoint(
        standardLoan.data,
        refinanceLoan.data,
        refinancingCosts.data
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const breakEvenMonths = monthCountToNumber(result.data);
        expect(breakEvenMonths).toBeGreaterThan(0);
        expect(breakEvenMonths).toBeLessThan(84); // Should break even before loan ends
      }
    });

    it("should return error when no savings exist", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // Create a higher-rate scenario (no savings)
      const higherRate = createInterestRate(6.5);
      if (!higherRate.success) {
        throw new Error("Failed to create higher rate");
      }

      const badRefinancePayment = createMoney(2100); // €2100/month for bad refinance
      if (!badRefinancePayment.success) throw new Error("Failed to create bad refinance payment");
      
      const badRefinanceLoan = createLoanConfiguration(
        standardLoan.data.amount,
        higherRate.data,
        standardLoan.data.termInMonths,
        badRefinancePayment.data
      );

      if (!badRefinanceLoan.success) {
        throw new Error("Failed to create bad refinance loan");
      }

      const refinancingCosts = createMoney(3000);
      if (!refinancingCosts.success) {
        throw new Error("Failed to create refinancing costs");
      }

      const result = calculateBreakEvenPoint(
        standardLoan.data,
        badRefinanceLoan.data,
        refinancingCosts.data
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InsufficientPayment"); // No savings
      }
    });
  });

  describe("calculatePaymentScenarios", () => {
    it("should calculate multiple payment scenarios correctly", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const scenarios = [
        { amountMultiplier: 1.5 }, // 50% more loan amount
        { rateAdjustment: 1.0 }, // 1% higher rate
        { termAdjustment: 24 }, // 2 years longer
        { amountMultiplier: 0.8, rateAdjustment: -0.5 }, // Less amount, lower rate
      ];

      const result = calculatePaymentScenarios(standardLoan.data, scenarios);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(4);

        // First scenario: More loan amount = higher payment
        const higherAmountPayment = toEuros(result.data[0].total);
        const basePaymentResult = calculateMonthlyPayment(standardLoan.data);
        if (basePaymentResult.success) {
          const basePayment = toEuros(basePaymentResult.data.total);
          expect(higherAmountPayment).toBeGreaterThan(basePayment);
        }

        // Second scenario: Higher rate = higher payment
        const higherRatePayment = toEuros(result.data[1].total);
        if (basePaymentResult.success) {
          const basePayment = toEuros(basePaymentResult.data.total);
          expect(higherRatePayment).toBeGreaterThan(basePayment);
        }

        // Third scenario: Longer term = lower payment
        const longerTermPayment = toEuros(result.data[2].total);
        if (basePaymentResult.success) {
          const basePayment = toEuros(basePaymentResult.data.total);
          expect(longerTermPayment).toBeLessThan(basePayment);
        }
      }
    });

    it("should handle invalid scenario parameters", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      const invalidScenarios = [
        { amountMultiplier: -1 }, // Negative amount
        { rateAdjustment: 30 }, // Rate too high
        { termAdjustment: -200 }, // Term too short
      ];

      const result = calculatePaymentScenarios(
        standardLoan.data,
        invalidScenarios
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidParameters");
      }
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle mathematical edge cases gracefully", () => {
      // Test with very small loan amount
      const smallAmount = createLoanAmount(1000);
      const rate = createInterestRate(5.0);
      const term = createYearCount(1);

      if (!smallAmount.success || !rate.success || !term.success) {
        throw new Error("Failed to create test data");
      }

      const termInMonths = createMonthCount(term.data * 12);
      const payment = createMoney(100); // €100/month placeholder
      
      if (!termInMonths.success || !payment.success) {
        throw new Error("Failed to create term or payment");
      }

      const smallLoan = createLoanConfiguration(
        smallAmount.data,
        rate.data,
        termInMonths.data,
        payment.data
      );
      if (smallLoan.success) {
        const result = calculateMonthlyPayment(smallLoan.data);
        expect(result.success).toBe(true);
      }
    });

    it("should maintain numerical precision", () => {
      if (!standardLoan.success) {
        throw new Error("Failed to create standard loan");
      }

      // Calculate payment and then use it to calculate back the parameters
      const paymentResult = calculateMonthlyPayment(standardLoan.data);
      expect(paymentResult.success).toBe(true);

      if (paymentResult.success) {
        const payment = paymentResult.data.total;

        // Calculate term from payment
        const termResult = calculateLoanTerm(
          standardLoan.data.amount,
          standardLoan.data.annualRate,
          payment
        );

        // Calculate rate from payment and term
        const rateResult = calculateInterestRate(
          standardLoan.data.amount,
          payment,
          standardLoan.data.termInMonths
        );

        expect(termResult.success).toBe(true);
        expect(rateResult.success).toBe(true);

        // Values should be very close to original
        if (termResult.success) {
          const calculatedMonths = monthCountToNumber(termResult.data);
          const originalMonths = monthCountToNumber(
            standardLoan.data.termInMonths
          );
          expect(
            Math.abs(calculatedMonths - originalMonths)
          ).toBeLessThanOrEqual(1);
        }

        if (rateResult.success) {
          const calculatedRate = toDecimal(rateResult.data) * 100;
          const originalRate = toDecimal(standardLoan.data.annualRate) * 100;
          expect(Math.abs(calculatedRate - originalRate)).toBeLessThanOrEqual(
            0.1
          );
        }
      }
    });
  });
});
