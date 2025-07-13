import { describe, it, expect } from "vitest";
import {
  createLoanConfiguration,
  createLoanConfigurationFromInput,
  getLoanParameters,
  formatLoanConfiguration,
  compareLoanConfigurations,
  createLoanScenario,
  LOAN_PRESETS,
  type LoanConfigurationInput,
} from "../LoanConfiguration";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import { createInterestRate } from "../../value-objects/InterestRate";
import { createMonthCount } from "../../value-objects/MonthCount";
import { createMoney } from "../../value-objects/Money";

describe("LoanConfiguration Type", () => {
  describe("createLoanConfiguration", () => {
    it("should create valid loan configuration from domain types", () => {
      const amountResult = createLoanAmount(300000);
      const rateResult = createInterestRate(3.5);
      const termResult = createMonthCount(300); // 25 years
      const paymentResult = createMoney(1502); // Correct calculated payment

      expect(amountResult.success).toBe(true);
      expect(rateResult.success).toBe(true);
      expect(termResult.success).toBe(true);
      expect(paymentResult.success).toBe(true);

      if (
        amountResult.success &&
        rateResult.success &&
        termResult.success &&
        paymentResult.success
      ) {
        const configResult = createLoanConfiguration(
          amountResult.data,
          rateResult.data,
          termResult.data,
          paymentResult.data,
        );

        expect(configResult.success).toBe(true);
        if (configResult.success) {
          expect(configResult.data.amount).toBe(amountResult.data);
          expect(configResult.data.annualRate).toBe(rateResult.data);
          expect(configResult.data.termInMonths).toBe(termResult.data);
          expect(configResult.data.monthlyPayment).toBe(paymentResult.data);
        }
      }
    });

    it("should validate parameter consistency for typical mortgage", () => {
      // Calculate expected payment for €300k, 3.5% over 25 years
      const principal = 300000;
      const annualRate = 0.035;
      const monthlyRate = annualRate / 12;
      const termMonths = 25 * 12;

      const factor = Math.pow(1 + monthlyRate, termMonths);
      const expectedPayment = (principal * monthlyRate * factor) / (factor - 1);

      const amountResult = createLoanAmount(principal);
      const rateResult = createInterestRate(annualRate * 100); // InterestRate expects percentage
      const termResult = createMonthCount(termMonths);
      const paymentResult = createMoney(Math.round(expectedPayment));

      expect(
        amountResult.success &&
          rateResult.success &&
          termResult.success &&
          paymentResult.success,
      ).toBe(true);

      if (
        amountResult.success &&
        rateResult.success &&
        termResult.success &&
        paymentResult.success
      ) {
        const configResult = createLoanConfiguration(
          amountResult.data,
          rateResult.data,
          termResult.data,
          paymentResult.data,
        );

        expect(configResult.success).toBe(true);
      }
    });

    it("should handle very low interest rate loans correctly", () => {
      const principal = 100000;
      const termMonths = 120; // 10 years
      const annualRate = 0.1; // 0.1% minimum rate
      const monthlyRate = annualRate / 100 / 12;
      const factor = Math.pow(1 + monthlyRate, termMonths);
      const expectedPayment = (principal * monthlyRate * factor) / (factor - 1);

      const amountResult = createLoanAmount(principal);
      const rateResult = createInterestRate(annualRate);
      const termResult = createMonthCount(termMonths);
      const paymentResult = createMoney(Math.round(expectedPayment));

      expect(
        amountResult.success &&
          rateResult.success &&
          termResult.success &&
          paymentResult.success,
      ).toBe(true);

      if (
        amountResult.success &&
        rateResult.success &&
        termResult.success &&
        paymentResult.success
      ) {
        const configResult = createLoanConfiguration(
          amountResult.data,
          rateResult.data,
          termResult.data,
          paymentResult.data,
        );

        expect(configResult.success).toBe(true);
      }
    });
  });

  describe("createLoanConfigurationFromInput", () => {
    it("should create loan configuration from valid input with months", () => {
      const input: LoanConfigurationInput = {
        amount: 300000,
        annualRate: 3.5,
        termInMonths: 300,
        monthlyPayment: 1502, // Correct calculated payment
      };

      const result = createLoanConfigurationFromInput(input);
      expect(result.success).toBe(true);
    });

    it("should create loan configuration from valid input with years", () => {
      const input: LoanConfigurationInput = {
        amount: 300000,
        annualRate: 3.5,
        termInYears: 25,
        monthlyPayment: 1502, // Correct calculated payment for 300 months
      };

      const result = createLoanConfigurationFromInput(input);
      expect(result.success).toBe(true);
    });

    it("should prefer months over years when both provided", () => {
      const input: LoanConfigurationInput = {
        amount: 300000,
        annualRate: 3.5,
        termInMonths: 240, // 20 years
        termInYears: 25, // This should be ignored
        monthlyPayment: 1740, // Correct calculated payment for 240 months
      };

      const result = createLoanConfigurationFromInput(input);
      expect(result.success).toBe(true);

      if (result.success) {
        const params = getLoanParameters(result.data);
        expect(params.termInMonths).toBe(240); // Should use months, not years
      }
    });

    it("should reject input missing required parameters", () => {
      const incompleteInputs = [
        { amount: 300000, annualRate: 3.5 }, // Missing term and payment
        { amount: 300000, termInMonths: 300 }, // Missing rate and payment
        { annualRate: 3.5, termInMonths: 300, monthlyPayment: 1500 }, // Missing amount
        { amount: 300000, annualRate: 3.5, monthlyPayment: 1500 }, // Missing term
      ];

      incompleteInputs.forEach((input) => {
        const result = createLoanConfigurationFromInput(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InconsistentParameters");
        }
      });
    });

    it("should validate individual parameters", () => {
      const invalidInputs = [
        {
          amount: -100000,
          annualRate: 3.5,
          termInMonths: 300,
          monthlyPayment: 1500,
        }, // Negative amount
        {
          amount: 300000,
          annualRate: -1,
          termInMonths: 300,
          monthlyPayment: 1500,
        }, // Negative rate
        {
          amount: 300000,
          annualRate: 3.5,
          termInMonths: 0,
          monthlyPayment: 1500,
        }, // Zero term
        {
          amount: 300000,
          annualRate: 3.5,
          termInMonths: 300,
          monthlyPayment: -500,
        }, // Negative payment
      ];

      const expectedErrors = [
        "InvalidLoanAmount",
        "InvalidInterestRate",
        "InvalidTerm",
        "InvalidMonthlyPayment",
      ];

      invalidInputs.forEach((input, index) => {
        const result = createLoanConfigurationFromInput(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe(expectedErrors[index]);
        }
      });
    });
  });

  describe("getLoanParameters", () => {
    it("should extract parameters as numbers", () => {
      const input: LoanConfigurationInput = {
        amount: 400000,
        annualRate: 4.0,
        termInMonths: 360,
        monthlyPayment: 1910,
      };

      const configResult = createLoanConfigurationFromInput(input);
      expect(configResult.success).toBe(true);

      if (configResult.success) {
        const params = getLoanParameters(configResult.data);

        expect(params.amount).toBe(400000);
        expect(params.annualRate).toBe(4.0);
        expect(params.monthlyRate).toBeCloseTo(4.0 / 12 / 100, 6); // Monthly rate as decimal
        expect(params.termInMonths).toBe(360);
        expect(params.monthlyPayment).toBe(1910);
      }
    });
  });

  describe("formatLoanConfiguration", () => {
    it("should format loan configuration in German", () => {
      const input: LoanConfigurationInput = {
        amount: 250000,
        annualRate: 3.2,
        termInMonths: 240,
        monthlyPayment: 1412, // Correct calculated payment
      };

      const configResult = createLoanConfigurationFromInput(input);
      expect(configResult.success).toBe(true);

      if (configResult.success) {
        const formatted = formatLoanConfiguration(configResult.data);

        expect(formatted).toContain("Darlehen");
        expect(formatted).toContain("Zinssatz");
        expect(formatted).toContain("Laufzeit");
        expect(formatted).toContain("Monatliche Rate");
      }
    });
  });

  describe("compareLoanConfigurations", () => {
    it("should compare two loan configurations", () => {
      const configA = createLoanConfigurationFromInput({
        amount: 300000,
        annualRate: 3.5,
        termInMonths: 300,
        monthlyPayment: 1502, // Correct calculated payment
      });

      const configB = createLoanConfigurationFromInput({
        amount: 350000,
        annualRate: 4.0,
        termInMonths: 360,
        monthlyPayment: 1671, // Correct calculated payment
      });

      expect(configA.success && configB.success).toBe(true);

      if (configA.success && configB.success) {
        const comparison = compareLoanConfigurations(
          configA.data,
          configB.data,
        );

        expect(comparison.amountDifference).toBe(50000); // 350k - 300k
        expect(comparison.rateDifference).toBe(0.5); // 4.0% - 3.5%
        expect(comparison.termDifference).toBe(60); // 360 - 300 months
        expect(comparison.paymentDifference).toBe(169); // 1671 - 1502
      }
    });
  });

  describe("createLoanScenario", () => {
    it("should create loan scenario with name and description", () => {
      const configResult = createLoanConfigurationFromInput({
        amount: 300000,
        annualRate: 3.5,
        termInMonths: 300,
        monthlyPayment: 1502, // Correct calculated payment
      });

      expect(configResult.success).toBe(true);

      if (configResult.success) {
        const scenario = createLoanScenario(
          "Standard Mortgage",
          configResult.data,
          "Typical first-time home buyer scenario",
        );

        expect(scenario.name).toBe("Standard Mortgage");
        expect(scenario.configuration).toBe(configResult.data);
        expect(scenario.description).toBe(
          "Typical first-time home buyer scenario",
        );
      }
    });
  });

  describe("LOAN_PRESETS", () => {
    it("should have valid preset configurations", () => {
      const presetNames = [
        "TYPICAL_FIRST_HOME",
        "LUXURY_HOME",
        "INVESTMENT_PROPERTY",
      ] as const;

      presetNames.forEach((presetName) => {
        const preset = LOAN_PRESETS[presetName];

        expect(preset.amount).toBeGreaterThan(0);
        expect(preset.annualRate).toBeGreaterThan(0);
        expect(preset.termInYears).toBeGreaterThan(0);

        // All presets should be within reasonable German market ranges
        expect(preset.amount).toBeLessThanOrEqual(10000000); // Max loan amount
        expect(preset.annualRate).toBeLessThanOrEqual(25); // Max interest rate
        expect(preset.termInYears).toBeLessThanOrEqual(40); // Max term
      });
    });

    it("should have presets in logical order by amount", () => {
      expect(LOAN_PRESETS.TYPICAL_FIRST_HOME.amount).toBeLessThan(
        LOAN_PRESETS.LUXURY_HOME.amount,
      );
      expect(LOAN_PRESETS.TYPICAL_FIRST_HOME.amount).toBeLessThan(
        LOAN_PRESETS.INVESTMENT_PROPERTY.amount,
      );
    });
  });
});
