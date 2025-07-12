/**
 * Comprehensive tests for LoanToValueRatio domain type
 *
 * Tests cover:
 * - LTV calculation and validation
 * - German market specific business rules
 * - Risk categorization
 * - Mortgage approval criteria
 * - Interest rate implications
 * - Refinancing scenarios
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createLoanToValueRatio,
  updateWithNewLoanAmount,
  updateWithNewPropertyValuation,
  getCurrentLTV,
  getOriginalLTV,
  getRiskCategory,
  calculateLTVImprovement,
  hasLTVImproved,
  isLTVAcceptableForMortgage,
  qualifiesForBestRates,
  calculateEquity,
  calculateEquityPercentage,
  getInterestRatePremium,
  requiresMortgageInsurance,
  calculateAmountToReachTargetLTV,
  formatLoanToValueRatio,
  getRiskCategoryDescription,
  compareByCurrentLTV,
  isSafeForRefinancing,
  calculateMaxAdditionalBorrowing,
  getStandardLTVLimits,
  isCalculationCurrent,
  getMinimumPropertyValueForMortgage,
  type LTVRiskCategory,
} from "../../value-objects/LoanToValueRatio";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import {
  createPropertyValuation,
  type PropertyLocation,
  type LocationQuality,
} from "../PropertyValuation";

describe("LoanToValueRatio", () => {
  let testDate: Date;
  let validLocation: PropertyLocation;
  let premiumLocation: PropertyLocation;
  let testProperty: any;
  let testLoanAmount: any;

  beforeEach(() => {
    testDate = new Date("2024-01-15T10:00:00.000Z");

    validLocation = {
      city: "Berlin",
      state: "Berlin",
      postalCode: "10115",
      locationQuality: "Good" as LocationQuality,
    };

    premiumLocation = {
      city: "München",
      state: "Bayern",
      postalCode: "80331",
      locationQuality: "Premium" as LocationQuality,
    };

    // Create test property valuation
    const propertyResult = createPropertyValuation(
      500000, // €500k property value
      450000, // Purchase price
      testDate,
      "BankAppraisal",
      "Eigenheim",
      validLocation
    );
    expect(propertyResult.success).toBe(true);
    testProperty = propertyResult.success ? propertyResult.data : null;

    // Create test loan amount
    const loanResult = createLoanAmount(400000); // €400k loan
    expect(loanResult.success).toBe(true);
    testLoanAmount = loanResult.success ? loanResult.data : null;
  });

  describe("createLoanToValueRatio", () => {
    it("should create a valid LTV with standard inputs", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getCurrentLTV(result.data)).toBeCloseTo(80, 1); // 400k/500k = 80%
        expect(getOriginalLTV(result.data)).toBeCloseTo(80, 1); // Same as current when original not provided
        expect(getRiskCategory(result.data)).toBe("Medium");
      }
    });

    it("should create LTV with different original loan amount", () => {
      const originalLoanResult = createLoanAmount(450000); // €450k original
      expect(originalLoanResult.success).toBe(true);

      if (originalLoanResult.success) {
        const result = createLoanToValueRatio(
          testLoanAmount, // €400k current
          testProperty, // €500k property
          originalLoanResult.data, // €450k original
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(getCurrentLTV(result.data)).toBeCloseTo(80, 1); // 400k/500k
          expect(getOriginalLTV(result.data)).toBeCloseTo(90, 1); // 450k/500k
          expect(hasLTVImproved(result.data)).toBe(true);
        }
      }
    });

    it("should reject unacceptable property valuation", () => {
      const unacceptablePropertyResult = createPropertyValuation(
        500000,
        450000,
        testDate,
        "SelfAssessment", // Not acceptable for mortgage
        "Eigenheim",
        validLocation
      );
      expect(unacceptablePropertyResult.success).toBe(true);

      if (unacceptablePropertyResult.success) {
        const result = createLoanToValueRatio(
          testLoanAmount,
          unacceptablePropertyResult.data,
          undefined,
          testDate
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PropertyValuationNotAcceptable");
        }
      }
    });

    it("should reject property value too low", () => {
      const lowValuePropertyResult = createPropertyValuation(
        30000, // Below minimum
        25000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );
      expect(lowValuePropertyResult.success).toBe(true);

      if (lowValuePropertyResult.success) {
        const result = createLoanToValueRatio(
          testLoanAmount,
          lowValuePropertyResult.data,
          undefined,
          testDate
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PropertyValueTooLow");
        }
      }
    });

    it("should reject extremely high LTV", () => {
      const highLoanResult = createLoanAmount(600000); // €600k loan for €500k property
      expect(highLoanResult.success).toBe(true);

      if (highLoanResult.success) {
        const result = createLoanToValueRatio(
          highLoanResult.data,
          testProperty,
          undefined,
          testDate
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("LTVTooHigh");
        }
      }
    });
  });

  describe("risk categorization", () => {
    const testCases = [
      { loanAmount: 250000, expectedCategory: "VeryLow" as LTVRiskCategory }, // 50%
      { loanAmount: 300000, expectedCategory: "VeryLow" as LTVRiskCategory }, // 60%
      { loanAmount: 350000, expectedCategory: "Low" as LTVRiskCategory }, // 70%
      { loanAmount: 400000, expectedCategory: "Medium" as LTVRiskCategory }, // 80%
      { loanAmount: 450000, expectedCategory: "High" as LTVRiskCategory }, // 90%
    ];

    testCases.forEach(({ loanAmount, expectedCategory }) => {
      it(`should categorize ${
        loanAmount / 5000
      }% LTV as ${expectedCategory}`, () => {
        const loanResult = createLoanAmount(loanAmount);
        expect(loanResult.success).toBe(true);

        if (loanResult.success) {
          const result = createLoanToValueRatio(
            loanResult.data,
            testProperty,
            undefined,
            testDate
          );

          expect(result.success).toBe(true);
          if (result.success) {
            expect(getRiskCategory(result.data)).toBe(expectedCategory);
          }
        }
      });
    });
  });

  describe("mortgage approval criteria", () => {
    it("should accept standard residential property at 80% LTV", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(isLTVAcceptableForMortgage(result.data)).toBe(true);
      }
    });

    it("should accept premium location at 90% LTV", () => {
      const premiumPropertyResult = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        premiumLocation
      );
      expect(premiumPropertyResult.success).toBe(true);

      const highLoanResult = createLoanAmount(450000); // 90% LTV
      expect(highLoanResult.success).toBe(true);

      if (premiumPropertyResult.success && highLoanResult.success) {
        const result = createLoanToValueRatio(
          highLoanResult.data,
          premiumPropertyResult.data,
          undefined,
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(isLTVAcceptableForMortgage(result.data)).toBe(true);
        }
      }
    });

    it("should limit investment property to 70% LTV", () => {
      const investmentPropertyResult = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Gewerbeimmobilie", // Commercial property
        validLocation
      );
      expect(investmentPropertyResult.success).toBe(true);

      const highLoanResult = createLoanAmount(400000); // 80% LTV
      expect(highLoanResult.success).toBe(true);

      if (investmentPropertyResult.success && highLoanResult.success) {
        const result = createLoanToValueRatio(
          highLoanResult.data,
          investmentPropertyResult.data,
          undefined,
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(isLTVAcceptableForMortgage(result.data)).toBe(false); // Should not be acceptable
        }
      }
    });

    it("should qualify very low LTV for best rates", () => {
      const lowLoanResult = createLoanAmount(300000); // 60% LTV
      expect(lowLoanResult.success).toBe(true);

      if (lowLoanResult.success) {
        const result = createLoanToValueRatio(
          lowLoanResult.data,
          testProperty,
          undefined,
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(qualifiesForBestRates(result.data)).toBe(true);
          expect(getInterestRatePremium(result.data)).toBe(0);
        }
      }
    });
  });

  describe("financial calculations", () => {
    it("should calculate equity correctly", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const equity = calculateEquity(result.data);
        expect(equity).toBe(100000); // €500k - €400k

        const equityPercentage = calculateEquityPercentage(result.data);
        expect(equityPercentage).toBeCloseTo(20, 1); // 100% - 80%
      }
    });

    it("should calculate interest rate premiums correctly", () => {
      const testCases = [
        { loanAmount: 300000, expectedPremium: 0 }, // VeryLow
        { loanAmount: 350000, expectedPremium: 0.1 }, // Low
        { loanAmount: 400000, expectedPremium: 0.25 }, // Medium
        { loanAmount: 450000, expectedPremium: 0.5 }, // High
      ];

      testCases.forEach(({ loanAmount, expectedPremium }) => {
        const loanResult = createLoanAmount(loanAmount);
        expect(loanResult.success).toBe(true);

        if (loanResult.success) {
          const result = createLoanToValueRatio(
            loanResult.data,
            testProperty,
            undefined,
            testDate
          );

          expect(result.success).toBe(true);
          if (result.success) {
            expect(getInterestRatePremium(result.data)).toBe(expectedPremium);
          }
        }
      });
    });

    it("should determine mortgage insurance requirement", () => {
      // 80% LTV - no insurance required
      const mediumLoanResult = createLoanAmount(400000);
      expect(mediumLoanResult.success).toBe(true);

      if (mediumLoanResult.success) {
        const mediumResult = createLoanToValueRatio(
          mediumLoanResult.data,
          testProperty,
          undefined,
          testDate
        );
        expect(mediumResult.success).toBe(true);
        if (mediumResult.success) {
          expect(requiresMortgageInsurance(mediumResult.data)).toBe(false);
        }
      }

      // 90% LTV - insurance required
      const highLoanResult = createLoanAmount(450000);
      expect(highLoanResult.success).toBe(true);

      if (highLoanResult.success) {
        const premiumPropertyResult = createPropertyValuation(
          500000,
          450000,
          testDate,
          "BankAppraisal",
          "Eigenheim",
          premiumLocation // Premium location allows 90%
        );
        expect(premiumPropertyResult.success).toBe(true);

        if (premiumPropertyResult.success) {
          const highResult = createLoanToValueRatio(
            highLoanResult.data,
            premiumPropertyResult.data,
            undefined,
            testDate
          );
          expect(highResult.success).toBe(true);
          if (highResult.success) {
            expect(requiresMortgageInsurance(highResult.data)).toBe(true);
          }
        }
      }
    });

    it("should calculate amount to reach target LTV", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // From 80% to 70% LTV
        const amountToPayDown = calculateAmountToReachTargetLTV(
          result.data,
          70
        );
        expect(amountToPayDown).toBe(50000); // Need to pay down €50k to reach 70%

        // From 80% to 60% LTV
        const amountToReach60 = calculateAmountToReachTargetLTV(
          result.data,
          60
        );
        expect(amountToReach60).toBe(100000); // Need to pay down €100k to reach 60%
      }
    });

    it("should calculate maximum additional borrowing", () => {
      const lowLoanResult = createLoanAmount(300000); // 60% LTV
      expect(lowLoanResult.success).toBe(true);

      if (lowLoanResult.success) {
        const result = createLoanToValueRatio(
          lowLoanResult.data,
          testProperty,
          undefined,
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          const additionalCapacity = calculateMaxAdditionalBorrowing(
            result.data,
            80
          );
          expect(additionalCapacity).toBe(100000); // Can borrow €100k more to reach 80%
        }
      }
    });
  });

  describe("refinancing scenarios", () => {
    it("should identify safe LTV for refinancing", () => {
      const safeLoanResult = createLoanAmount(350000); // 70% LTV
      expect(safeLoanResult.success).toBe(true);

      if (safeLoanResult.success) {
        const result = createLoanToValueRatio(
          safeLoanResult.data,
          testProperty,
          undefined,
          testDate
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(isSafeForRefinancing(result.data)).toBe(true);
        }
      }
    });

    it("should identify unsafe LTV for refinancing", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      ); // 80% LTV

      expect(result.success).toBe(true);
      if (result.success) {
        expect(isSafeForRefinancing(result.data)).toBe(false);
      }
    });

    it("should update LTV with new loan amount", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );
      expect(result.success).toBe(true);

      if (result.success) {
        const newLoanResult = createLoanAmount(350000); // Reduced loan amount
        expect(newLoanResult.success).toBe(true);

        if (newLoanResult.success) {
          const updatedResult = updateWithNewLoanAmount(
            result.data,
            newLoanResult.data
          );

          expect(updatedResult.success).toBe(true);
          if (updatedResult.success) {
            expect(getCurrentLTV(updatedResult.data)).toBeCloseTo(70, 1); // 350k/500k
            expect(getOriginalLTV(updatedResult.data)).toBeCloseTo(80, 1); // Original was 400k/500k
            expect(hasLTVImproved(updatedResult.data)).toBe(true);
          }
        }
      }
    });

    it("should update LTV with new property valuation", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );
      expect(result.success).toBe(true);

      if (result.success) {
        const newPropertyResult = createPropertyValuation(
          600000, // Increased property value
          450000,
          testDate,
          "BankAppraisal",
          "Eigenheim",
          validLocation
        );
        expect(newPropertyResult.success).toBe(true);

        if (newPropertyResult.success) {
          const updatedResult = updateWithNewPropertyValuation(
            result.data,
            newPropertyResult.data
          );

          expect(updatedResult.success).toBe(true);
          if (updatedResult.success) {
            expect(getCurrentLTV(updatedResult.data)).toBeCloseTo(66.67, 1); // 400k/600k
            expect(hasLTVImproved(updatedResult.data)).toBe(false); // Original stays same
          }
        }
      }
    });
  });

  describe("formatting and display", () => {
    it("should format LTV correctly", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const formatted = formatLoanToValueRatio(result.data);
        expect(formatted).toContain("80,00");
        expect(formatted).toContain("Mittel");
      }
    });

    it("should provide risk category descriptions", () => {
      const descriptions: Record<LTVRiskCategory, string> = {
        VeryLow: getRiskCategoryDescription("VeryLow"),
        Low: getRiskCategoryDescription("Low"),
        Medium: getRiskCategoryDescription("Medium"),
        High: getRiskCategoryDescription("High"),
        VeryHigh: getRiskCategoryDescription("VeryHigh"),
      };

      expect(descriptions.VeryLow).toContain("≤60%");
      expect(descriptions.Low).toContain("60-70%");
      expect(descriptions.Medium).toContain("70-80%");
      expect(descriptions.High).toContain("80-90%");
      expect(descriptions.VeryHigh).toContain(">90%");
    });
  });

  describe("comparison and utility functions", () => {
    it("should compare LTV ratios correctly", () => {
      const lowLoanResult = createLoanAmount(300000); // 60% LTV
      const highLoanResult = createLoanAmount(400000); // 80% LTV

      expect(lowLoanResult.success).toBe(true);
      expect(highLoanResult.success).toBe(true);

      if (lowLoanResult.success && highLoanResult.success) {
        const lowLTVResult = createLoanToValueRatio(
          lowLoanResult.data,
          testProperty,
          undefined,
          testDate
        );
        const highLTVResult = createLoanToValueRatio(
          highLoanResult.data,
          testProperty,
          undefined,
          testDate
        );

        expect(lowLTVResult.success).toBe(true);
        expect(highLTVResult.success).toBe(true);

        if (lowLTVResult.success && highLTVResult.success) {
          const comparison = compareByCurrentLTV(
            lowLTVResult.data,
            highLTVResult.data
          );
          expect(comparison).toBeLessThan(0); // Low LTV should be less than high LTV
        }
      }
    });

    it("should validate calculation currency", () => {
      const recentDate = new Date(); // Use current date
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        recentDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(isCalculationCurrent(result.data, 6)).toBe(true); // Within 6 months

        // Test with old calculation
        const oldDate = new Date();
        oldDate.setFullYear(oldDate.getFullYear() - 1); // 1 year ago

        const oldResult = createLoanToValueRatio(
          testLoanAmount,
          testProperty,
          undefined,
          oldDate
        );
        expect(oldResult.success).toBe(true);
        if (oldResult.success) {
          expect(isCalculationCurrent(oldResult.data, 6)).toBe(false); // Too old
        }
      }
    });

    it("should return correct standard LTV limits", () => {
      const limits = getStandardLTVLimits();

      expect(limits.standard).toBe(80);
      expect(limits.premium).toBe(90);
      expect(limits.investment).toBe(70);
    });

    it("should return correct minimum property value", () => {
      expect(getMinimumPropertyValueForMortgage()).toBe(50000);
    });
  });

  describe("edge cases", () => {
    it("should handle zero equity scenario", () => {
      const fullLoanResult = createLoanAmount(500000); // 100% LTV
      expect(fullLoanResult.success).toBe(true);

      if (fullLoanResult.success) {
        const premiumPropertyResult = createPropertyValuation(
          500000,
          450000,
          testDate,
          "BankAppraisal",
          "Eigenheim",
          premiumLocation // Premium location might allow high LTV
        );
        expect(premiumPropertyResult.success).toBe(true);

        if (premiumPropertyResult.success) {
          const result = createLoanToValueRatio(
            fullLoanResult.data,
            premiumPropertyResult.data,
            undefined,
            testDate
          );

          expect(result.success).toBe(true);
          if (result.success) {
            const equity = calculateEquity(result.data);
            expect(equity).toBe(0);

            const equityPercentage = calculateEquityPercentage(result.data);
            expect(equityPercentage).toBeCloseTo(0, 1);
          }
        }
      }
    });

    it("should handle LTV improvement calculation edge cases", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        testLoanAmount,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(calculateLTVImprovement(result.data)).toBe(0); // No improvement when same
        expect(hasLTVImproved(result.data)).toBe(false);
      }
    });

    it("should handle target LTV calculation edge cases", () => {
      const result = createLoanToValueRatio(
        testLoanAmount,
        testProperty,
        undefined,
        testDate
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // Target LTV higher than current
        const amountForHigherLTV = calculateAmountToReachTargetLTV(
          result.data,
          90
        );
        expect(amountForHigherLTV).toBe(0); // Can't increase LTV by paying down

        // Additional borrowing with current LTV as target
        const additionalAtCurrent = calculateMaxAdditionalBorrowing(
          result.data,
          80
        );
        expect(additionalAtCurrent).toBe(0); // Already at 80%
      }
    });
  });
});
