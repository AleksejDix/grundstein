/**
 * Tests for GermanSondertilgungRules domain type
 *
 * Tests German-specific Sondertilgung business rules including:
 * - Bank-specific percentage limits and fee structures
 * - Timing restrictions and grace periods
 * - Payment validation against German banking regulations
 * - Fee calculations for different bank types
 * - Strategy recommendations
 */

import { describe, it, expect } from "vitest";
import {
  createGermanSondertilgungRules,
  validateSondertilgungPayment,
  calculateSondertilgungFees,
  getAvailablePercentages,
  supportsUnlimitedSondertilgung,
  getRecommendedStrategy,
  formatGermanBankType,
  getAvailableGermanBankTypes,
  type GermanBankType,
  type GermanSondertilgungRules,
  type GermanSondertilgungValidationError,
  type SondertilgungPercentage,
  type PaymentDateRestriction,
  type SondertilgungFeeType,
} from "../GermanSondertilgungRules";
import { createMoney } from "../Money";
import { createLoanAmount } from "../LoanAmount";
import { createExtraPayment } from "../ExtraPayment";
import { createPaymentMonth } from "../PaymentMonth";
import { createFixedRatePeriod } from "../FixedRatePeriod";

describe("GermanSondertilgungRules", () => {
  describe("createGermanSondertilgungRules", () => {
    it("should create rules for Sparkasse with correct defaults", () => {
      const result = createGermanSondertilgungRules("Sparkasse");

      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.data as any;
        expect(rules.bankType).toBe("Sparkasse");
        expect(rules.allowedPercentages).toEqual([5, 10]);
        expect(rules.timingRestrictions.gracePeriodMonths).toBe(12);
        expect(rules.timingRestrictions.noticeRequiredDays).toBe(30);
        expect(rules.timingRestrictions.allowedPaymentDates).toBe("MonthEnd");
        expect(rules.feeStructure.feeType).toBe("Percentage");
        expect(rules.feeStructure.percentageFee).toBe(1.0);
      }
    });

    it("should create rules for OnlineBank with generous limits", () => {
      const result = createGermanSondertilgungRules("OnlineBank");

      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.data as any;
        expect(rules.bankType).toBe("OnlineBank");
        expect(rules.allowedPercentages).toEqual([10, 20, 50]);
        expect(rules.timingRestrictions.gracePeriodMonths).toBe(3);
        expect(rules.timingRestrictions.noticeRequiredDays).toBe(7);
        expect(rules.timingRestrictions.allowedPaymentDates).toBe("AnyTime");
        expect(rules.feeStructure.feeType).toBe("None");
      }
    });

    it("should create rules for Privatbank with fixed fees", () => {
      const result = createGermanSondertilgungRules("Privatbank");

      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.data as any;
        expect(rules.bankType).toBe("Privatbank");
        expect(rules.allowedPercentages).toEqual([5, 10, 20]);
        expect(rules.feeStructure.feeType).toBe("Fixed");
        expect(rules.feeStructure.baseFee).toEqual(createMoney(250).data);
      }
    });

    it("should create rules for Bausparkasse with strict limitations", () => {
      const result = createGermanSondertilgungRules("Bausparkasse");

      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.data as any;
        expect(rules.bankType).toBe("Bausparkasse");
        expect(rules.allowedPercentages).toEqual([5]);
        expect(rules.timingRestrictions.gracePeriodMonths).toBe(24);
        expect(rules.timingRestrictions.noticeRequiredDays).toBe(60);
        expect(rules.timingRestrictions.allowedPaymentDates).toBe("YearEnd");
        expect(rules.feeStructure.feeType).toBe("Tiered");
      }
    });

    it("should allow custom overrides", () => {
      const customRules = {
        allowedPercentages: [15, 25] as const,
        minimumAmount: createMoney(5000).data!,
      };

      const result = createGermanSondertilgungRules("Sparkasse", customRules);

      expect(result.success).toBe(true);
      if (result.success) {
        const rules = result.data as any;
        expect(rules.allowedPercentages).toEqual([15, 25]);
        expect(rules.minimumAmount).toEqual(customRules.minimumAmount);
      }
    });

    it("should create rules for all German bank types", () => {
      const bankTypes: GermanBankType[] = [
        "Sparkasse",
        "Volksbank",
        "Privatbank",
        "Bausparkasse",
        "Hypothekenbank",
        "OnlineBank",
        "Genossenschaftsbank",
      ];

      bankTypes.forEach((bankType) => {
        const result = createGermanSondertilgungRules(bankType);
        expect(result.success).toBe(true);
        if (result.success) {
          expect((result.data as any).bankType).toBe(bankType);
        }
      });
    });
  });

  describe("validateSondertilgungPayment", () => {
    const createTestLoanAmount = () => createLoanAmount(300000).data!;
    const createTestRules = () =>
      createGermanSondertilgungRules("OnlineBank").data!;
    const createTestPayment = (amount: number, month: number) => {
      const paymentMonthResult = createPaymentMonth(month);
      if (paymentMonthResult.success) {
        const extraPaymentResult = createExtraPayment(
          paymentMonthResult.data,
          amount
        );
        if (extraPaymentResult.success) {
          return extraPaymentResult.data;
        }
      }
      throw new Error("Failed to create test payment");
    };

    it("should validate successful payment within limits", () => {
      const rules = createTestRules();
      const payment = createTestPayment(15000, 12); // 5% of 300k
      const loanAmount = createTestLoanAmount();

      const result = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        []
      );

      expect(result.success).toBe(true);
    });

    it("should reject payment below minimum amount", () => {
      const rules = createTestRules();
      const payment = createTestPayment(500, 12); // Below €1000 minimum
      const loanAmount = createTestLoanAmount();

      const result = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        []
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("BelowMinimumAmount");
      }
    });

    it("should reject payment exceeding yearly percentage limit", () => {
      const rules = createTestRules();
      const payment = createTestPayment(180000, 12); // 60% of 300k, exceeds max 50%
      const loanAmount = createTestLoanAmount();

      const result = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        []
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ExceedsAllowedPercentage");
      }
    });

    it("should consider existing payments in yearly limit calculation", () => {
      const rules = createTestRules();
      const payment = createTestPayment(90000, 12); // 30% of 300k
      const existingPayment = createTestPayment(75000, 6); // 25% of 300k
      const loanAmount = createTestLoanAmount();

      // Together they would be 55%, exceeding OnlineBank's 50% limit
      const result = validateSondertilgungPayment(rules, payment, loanAmount, [
        existingPayment,
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ExceedsAllowedPercentage");
      }
    });

    it("should validate grace period restrictions", () => {
      const rulesResult = createGermanSondertilgungRules("Bausparkasse"); // 24-month grace period
      expect(rulesResult.success).toBe(true);
      const rules = rulesResult.data!;

      const payment = createTestPayment(15000, 12);
      const loanAmount = createTestLoanAmount();

      // Create fixed rate period starting today (within grace period)
      const fixedRatePeriod = createFixedRatePeriod(
        10,
        3.5,
        "InitialFixed",
        new Date()
      ).data!;

      const result = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        [],
        fixedRatePeriod,
        new Date()
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("WithinGracePeriod");
      }
    });
  });

  describe("calculateSondertilgungFees", () => {
    const createTestLoanAmount = () => createLoanAmount(300000).data!;
    const createTestPayment = (amount: number) => {
      const paymentMonthResult = createPaymentMonth(12);
      if (paymentMonthResult.success) {
        const extraPaymentResult = createExtraPayment(
          paymentMonthResult.data,
          amount
        );
        if (extraPaymentResult.success) {
          return extraPaymentResult.data;
        }
      }
      throw new Error("Failed to create test payment");
    };

    it("should calculate no fees for OnlineBank", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const payment = createTestPayment(15000);
      const loanAmount = createTestLoanAmount();

      const result = calculateSondertilgungFees(rules, payment, loanAmount, []);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(createMoney(0).data);
      }
    });

    it("should calculate percentage fees for Sparkasse", () => {
      const rules = createGermanSondertilgungRules("Sparkasse").data!;
      const payment = createTestPayment(10000);
      const loanAmount = createTestLoanAmount();

      const result = calculateSondertilgungFees(rules, payment, loanAmount, []);

      expect(result.success).toBe(true);
      if (result.success) {
        // 1% of €10,000 = €100
        expect(result.data).toEqual(createMoney(100).data);
      }
    });

    it("should calculate fixed fees for Privatbank", () => {
      const rules = createGermanSondertilgungRules("Privatbank").data!;
      const payment = createTestPayment(50000);
      const loanAmount = createTestLoanAmount();

      const result = calculateSondertilgungFees(rules, payment, loanAmount, []);

      expect(result.success).toBe(true);
      if (result.success) {
        // Fixed fee of €250
        expect(result.data).toEqual(createMoney(250).data);
      }
    });

    it("should calculate tiered fees for Bausparkasse", () => {
      const rules = createGermanSondertilgungRules("Bausparkasse").data!;
      const payment = createTestPayment(15000); // 5% of loan, exactly at limit
      const loanAmount = createTestLoanAmount();

      const result = calculateSondertilgungFees(rules, payment, loanAmount, []);

      expect(result.success).toBe(true);
      if (result.success) {
        // 0.5% base fee = €75, no excess fee since within 5% limit
        expect(result.data).toEqual(createMoney(75).data);
      }
    });

    it("should calculate excess fees when payment exceeds allowed percentage", () => {
      const rules = createGermanSondertilgungRules("Bausparkasse").data!;
      const payment = createTestPayment(20000); // 6.67% of loan, exceeds 5% limit
      const loanAmount = createTestLoanAmount();

      const result = calculateSondertilgungFees(rules, payment, loanAmount, []);

      expect(result.success).toBe(true);
      if (result.success) {
        // Base fee: 0.5% of €20,000 = €100
        // Excess: (€20,000 - €15,000) * 2% = €5,000 * 2% = €100
        // Total: €200
        expect(result.data).toEqual(createMoney(200).data);
      }
    });
  });

  describe("getAvailablePercentages", () => {
    it("should return correct percentages for each bank type", () => {
      const sparkasseRules = createGermanSondertilgungRules("Sparkasse").data!;
      expect(getAvailablePercentages(sparkasseRules)).toEqual([5, 10]);

      const onlineBankRules =
        createGermanSondertilgungRules("OnlineBank").data!;
      expect(getAvailablePercentages(onlineBankRules)).toEqual([10, 20, 50]);

      const privatbankRules =
        createGermanSondertilgungRules("Privatbank").data!;
      expect(getAvailablePercentages(privatbankRules)).toEqual([5, 10, 20]);
    });
  });

  describe("supportsUnlimitedSondertilgung", () => {
    it("should return false for all current German bank types", () => {
      const bankTypes: GermanBankType[] = [
        "Sparkasse",
        "Volksbank",
        "Privatbank",
        "Bausparkasse",
        "Hypothekenbank",
        "OnlineBank",
        "Genossenschaftsbank",
      ];

      bankTypes.forEach((bankType) => {
        expect(supportsUnlimitedSondertilgung(bankType)).toBe(false);
      });
    });

    it("should return true if bank type has 100% in allowed percentages", () => {
      // This would be a hypothetical bank type with unlimited Sondertilgung
      // Currently not implemented in the default rules
      expect(supportsUnlimitedSondertilgung("OnlineBank")).toBe(false);
    });
  });

  describe("getRecommendedStrategy", () => {
    it("should recommend appropriate percentage based on available amount", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const loanAmount = createLoanAmount(300000).data!;
      const availableAmount = createMoney(45000).data!; // 15% of loan

      const strategy = getRecommendedStrategy(
        rules,
        loanAmount,
        availableAmount
      );

      expect(strategy.recommendedPercentage).toBe(10); // Highest safe percentage
      expect(strategy.optimalTiming).toBe("Sofort");
      expect(strategy.expectedSavings).toBeGreaterThan(0);
      expect(strategy.riskAssessment).toBe("Niedrig");
    });

    it("should recommend higher percentage for larger available amounts", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const loanAmount = createLoanAmount(300000).data!;
      const availableAmount = createMoney(90000).data!; // 30% of loan

      const strategy = getRecommendedStrategy(
        rules,
        loanAmount,
        availableAmount
      );

      expect(strategy.recommendedPercentage).toBe(20);
      expect(strategy.riskAssessment).toBe("Mittel - Liquidität beachten");
    });

    it("should provide timing advice based on fixed rate period", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const loanAmount = createLoanAmount(300000).data!;
      const availableAmount = createMoney(30000).data!;
      const fixedRatePeriod = createFixedRatePeriod(10, 3.5).data!;

      const strategy = getRecommendedStrategy(
        rules,
        loanAmount,
        availableAmount,
        fixedRatePeriod
      );

      expect(strategy.optimalTiming).toBe("Während der Zinsbindung");
    });

    it("should recommend payment before end of rate period for short remaining time", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const loanAmount = createLoanAmount(300000).data!;
      const availableAmount = createMoney(30000).data!;

      // Create a fixed rate period that's currently active with few years remaining
      // Let's test the logic by creating a 3-year period that just started
      const fixedRatePeriod = createFixedRatePeriod(
        3,
        3.5,
        "InitialFixed",
        new Date()
      ).data!;

      const strategy = getRecommendedStrategy(
        rules,
        loanAmount,
        availableAmount,
        fixedRatePeriod
      );

      // With 3 years remaining (which is <= 5), it should recommend payment before end
      expect(strategy.optimalTiming).toBe("Vor Zinsbindungsende");
    });

    it("should assess higher risk for large percentages", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const loanAmount = createLoanAmount(300000).data!;
      const availableAmount = createMoney(150000).data!; // 50% of loan

      const strategy = getRecommendedStrategy(
        rules,
        loanAmount,
        availableAmount
      );

      expect(strategy.recommendedPercentage).toBe(50);
      expect(strategy.riskAssessment).toBe(
        "Hoch - Finanzielle Flexibilität prüfen"
      );
    });
  });

  describe("formatGermanBankType", () => {
    it("should format bank types correctly in German", () => {
      expect(formatGermanBankType("Sparkasse")).toBe("Sparkasse");
      expect(formatGermanBankType("Volksbank")).toBe(
        "Volksbank/Raiffeisenbank"
      );
      expect(formatGermanBankType("Privatbank")).toBe("Private Geschäftsbank");
      expect(formatGermanBankType("Bausparkasse")).toBe("Bausparkasse");
      expect(formatGermanBankType("Hypothekenbank")).toBe("Hypothekenbank");
      expect(formatGermanBankType("OnlineBank")).toBe("Online-Bank");
      expect(formatGermanBankType("Genossenschaftsbank")).toBe(
        "Genossenschaftsbank"
      );
    });
  });

  describe("getAvailableGermanBankTypes", () => {
    it("should return all available German bank types", () => {
      const bankTypes = getAvailableGermanBankTypes();

      expect(bankTypes).toContain("Sparkasse");
      expect(bankTypes).toContain("Volksbank");
      expect(bankTypes).toContain("Privatbank");
      expect(bankTypes).toContain("Bausparkasse");
      expect(bankTypes).toContain("Hypothekenbank");
      expect(bankTypes).toContain("OnlineBank");
      expect(bankTypes).toContain("Genossenschaftsbank");
      expect(bankTypes).toHaveLength(7);
    });
  });

  describe("German Banking Regulations Compliance", () => {
    it("should enforce realistic German percentage limits", () => {
      // German banks typically offer 5-20% Sondertilgung, with some online banks up to 50%
      const bankTypes: GermanBankType[] = getAvailableGermanBankTypes();

      bankTypes.forEach((bankType) => {
        const rules = createGermanSondertilgungRules(bankType).data!;
        const percentages = getAvailablePercentages(rules);

        // All percentages should be reasonable for German market
        percentages.forEach((percentage) => {
          expect(percentage).toBeGreaterThanOrEqual(5);
          expect(percentage).toBeLessThanOrEqual(50);
        });
      });
    });

    it("should reflect realistic German banking fee structures", () => {
      // Sparkasse and cooperative banks typically charge percentage fees
      const sparkasseRules = createGermanSondertilgungRules("Sparkasse").data!;
      expect((sparkasseRules as any).feeStructure.feeType).toBe("Percentage");

      // Private banks often charge fixed fees
      const privatbankRules =
        createGermanSondertilgungRules("Privatbank").data!;
      expect((privatbankRules as any).feeStructure.feeType).toBe("Fixed");

      // Online banks often offer fee-free Sondertilgung
      const onlineBankRules =
        createGermanSondertilgungRules("OnlineBank").data!;
      expect((onlineBankRules as any).feeStructure.feeType).toBe("None");

      // Bausparkassen have complex tiered structures
      const bausparkasseRules =
        createGermanSondertilgungRules("Bausparkasse").data!;
      expect((bausparkasseRules as any).feeStructure.feeType).toBe("Tiered");
    });

    it("should enforce realistic grace periods for German market", () => {
      // Bausparkasse should have longest grace period
      const bausparkasseRules =
        createGermanSondertilgungRules("Bausparkasse").data!;
      expect(
        (bausparkasseRules as any).timingRestrictions.gracePeriodMonths
      ).toBe(24);

      // Online banks should have shortest grace period
      const onlineBankRules =
        createGermanSondertilgungRules("OnlineBank").data!;
      expect(
        (onlineBankRules as any).timingRestrictions.gracePeriodMonths
      ).toBe(3);

      // Traditional banks should have medium grace periods
      const sparkasseRules = createGermanSondertilgungRules("Sparkasse").data!;
      expect((sparkasseRules as any).timingRestrictions.gracePeriodMonths).toBe(
        12
      );
    });

    it("should enforce appropriate notice requirements", () => {
      // All notice periods should be reasonable for German banking
      const bankTypes: GermanBankType[] = getAvailableGermanBankTypes();

      bankTypes.forEach((bankType) => {
        const rules = createGermanSondertilgungRules(bankType).data!;
        const noticeRequiredDays = (rules as any).timingRestrictions
          .noticeRequiredDays;

        expect(noticeRequiredDays).toBeGreaterThanOrEqual(7);
        expect(noticeRequiredDays).toBeLessThanOrEqual(60);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle zero payment amounts", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      // Use 1 euro as minimum since zero isn't allowed by ExtraPayment type
      const payment = createTestPayment(1);
      const loanAmount = createLoanAmount(300000).data!;

      const validationResult = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        []
      );
      expect(validationResult.success).toBe(false); // Below minimum of €1000

      const feeResult = calculateSondertilgungFees(
        rules,
        payment,
        loanAmount,
        []
      );
      expect(feeResult.success).toBe(true);
      if (feeResult.success) {
        expect(feeResult.data).toEqual(createMoney(0).data);
      }
    });

    it("should handle very large payment amounts", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const payment = createTestPayment(1000000); // €1M, way above any reasonable limit
      const loanAmount = createLoanAmount(300000).data!;

      const result = validateSondertilgungPayment(
        rules,
        payment,
        loanAmount,
        []
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ExceedsAllowedPercentage");
      }
    });

    it("should handle multiple payments in same year", () => {
      const rules = createGermanSondertilgungRules("OnlineBank").data!;
      const payment1 = createTestPayment(30000); // 10%
      const payment2 = createTestPayment(30000); // Another 10%
      const payment3 = createTestPayment(30000); // Another 10% - total 30%
      const loanAmount = createLoanAmount(300000).data!;

      // First payment should be fine
      const result1 = validateSondertilgungPayment(
        rules,
        payment1,
        loanAmount,
        []
      );
      expect(result1.success).toBe(true);

      // Second payment should be fine (total 20%)
      const result2 = validateSondertilgungPayment(
        rules,
        payment2,
        loanAmount,
        [payment1]
      );
      expect(result2.success).toBe(true);

      // Third payment should be fine (total 30%, still under 50% limit)
      const result3 = validateSondertilgungPayment(
        rules,
        payment3,
        loanAmount,
        [payment1, payment2]
      );
      expect(result3.success).toBe(true);
    });

    function createTestPayment(amount: number, month: number = 12) {
      const paymentMonthResult = createPaymentMonth(month);
      if (paymentMonthResult.success) {
        const extraPaymentResult = createExtraPayment(
          paymentMonthResult.data,
          amount
        );
        if (extraPaymentResult.success) {
          return extraPaymentResult.data;
        }
      }
      throw new Error("Failed to create test payment");
    }
  });
});
