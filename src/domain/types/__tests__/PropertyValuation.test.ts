/**
 * Comprehensive tests for PropertyValuation domain type
 *
 * Tests cover:
 * - Value object creation and validation
 * - German property market specifics
 * - Business rule enforcement
 * - Valuation reliability and acceptance
 * - Date validations and aging
 * - Property appreciation/depreciation calculations
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createPropertyValuation,
  createConservativeValuation,
  getCurrentValue,
  getOriginalPurchasePrice,
  getValuationDate,
  getValuationMethod,
  getPropertyType,
  getPropertyLocation,
  calculateValueChange,
  calculateValueChangePercentage,
  hasAppreciated,
  hasDepreciated,
  calculateAnnualAppreciationRate,
  isCurrentEnoughForMortgage,
  getReliabilityScore,
  isAcceptableForMortgage,
  formatPropertyValuation,
  compareByValue,
  compareByDate,
  getLocationQualityDescription,
  isValidGermanPostalCode,
  getMinimumPropertyValue,
  getMaximumPropertyValue,
  getMaxValuationAgeMonths,
  isSameProperty,
  type ValuationMethod,
  type PropertyType,
  type LocationQuality,
  type PropertyLocation,
} from "../PropertyValuation";
import { toEuros } from "../Money";

describe("PropertyValuation", () => {
  let testDate: Date;
  let validLocation: PropertyLocation;

  beforeEach(() => {
    testDate = new Date("2024-01-15T10:00:00.000Z");
    validLocation = {
      city: "München",
      state: "Bayern",
      postalCode: "80331",
      locationQuality: "Premium" as LocationQuality,
    };
  });

  describe("createPropertyValuation", () => {
    it("should create a valid property valuation with valid inputs", () => {
      const result = createPropertyValuation(
        500000, // current value
        450000, // purchase price
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation,
        "Certified Appraiser License #12345",
        "Recent professional appraisal"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toEuros(getCurrentValue(result.data))).toBe(500000);
        expect(toEuros(getOriginalPurchasePrice(result.data))).toBe(450000);
        expect(getValuationDate(result.data)).toEqual(testDate);
        expect(getValuationMethod(result.data)).toBe("BankAppraisal");
        expect(getPropertyType(result.data)).toBe("Eigenheim");
        expect(getPropertyLocation(result.data)).toEqual(validLocation);
      }
    });

    it("should create valuation without optional parameters", () => {
      const result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(true);
    });

    it("should reject current value below minimum", () => {
      const result = createPropertyValuation(
        5000, // Below minimum
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidCurrentValue");
      }
    });

    it("should reject current value above maximum", () => {
      const result = createPropertyValuation(
        60000000, // Above maximum
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidCurrentValue");
      }
    });

    it("should reject purchase price below minimum", () => {
      const result = createPropertyValuation(
        500000,
        5000, // Below minimum
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidPurchasePrice");
      }
    });

    it("should reject future valuation date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = createPropertyValuation(
        500000,
        450000,
        futureDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("FutureValuationDate");
      }
    });

    it("should reject too old valuation date", () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 3); // 3 years ago

      const result = createPropertyValuation(
        500000,
        450000,
        oldDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ValuationTooOld");
      }
    });

    it("should reject severe value decrease", () => {
      const result = createPropertyValuation(
        200000, // 60% decrease from purchase price
        500000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ValueDecreaseTooSevere");
      }
    });

    it("should accept reasonable value decrease", () => {
      const result = createPropertyValuation(
        400000, // 20% decrease from purchase price
        500000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(true);
    });

    it("should reject invalid location with empty city", () => {
      const invalidLocation = {
        ...validLocation,
        city: "",
      };

      const result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        invalidLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidLocation");
      }
    });

    it("should reject invalid German postal code", () => {
      const invalidLocation = {
        ...validLocation,
        postalCode: "12345a", // Invalid format
      };

      const result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        invalidLocation
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidLocation");
      }
    });

    it("should accept all valid property types", () => {
      const propertyTypes: PropertyType[] = [
        "Eigenheim",
        "Eigentumswohnung",
        "Reihenhaus",
        "Doppelhaushälfte",
        "Mehrfamilienhaus",
        "Baugrundstück",
        "Gewerbeimmobilie",
      ];

      propertyTypes.forEach((propertyType) => {
        const result = createPropertyValuation(
          500000,
          450000,
          testDate,
          "BankAppraisal",
          propertyType,
          validLocation
        );
        expect(result.success).toBe(true);
      });
    });

    it("should accept all valid valuation methods", () => {
      const methods: ValuationMethod[] = [
        "BankAppraisal",
        "IndependentAppraisal",
        "OnlineEstimate",
        "ComparativeMarketAnalysis",
        "SelfAssessment",
        "InsuranceValuation",
      ];

      methods.forEach((method) => {
        const result = createPropertyValuation(
          500000,
          450000,
          testDate,
          method,
          "Eigenheim",
          validLocation
        );
        expect(result.success).toBe(true);
      });
    });
  });

  describe("value calculations", () => {
    let appreciatedProperty: any;
    let depreciatedProperty: any;

    beforeEach(() => {
      // Property that appreciated
      const appreciatedResult = createPropertyValuation(
        550000, // Current value
        500000, // Purchase price
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );
      expect(appreciatedResult.success).toBe(true);
      appreciatedProperty = appreciatedResult.success
        ? appreciatedResult.data
        : null;

      // Property that depreciated
      const depreciatedResult = createPropertyValuation(
        450000, // Current value
        500000, // Purchase price
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );
      expect(depreciatedResult.success).toBe(true);
      depreciatedProperty = depreciatedResult.success
        ? depreciatedResult.data
        : null;
    });

    it("should calculate value change correctly for appreciation", () => {
      const change = calculateValueChange(appreciatedProperty);
      expect(change).toBe(50000); // 550k - 500k
    });

    it("should calculate value change correctly for depreciation", () => {
      const change = calculateValueChange(depreciatedProperty);
      expect(change).toBe(-50000); // 450k - 500k
    });

    it("should calculate value change percentage correctly", () => {
      const appreciationPercent =
        calculateValueChangePercentage(appreciatedProperty);
      const depreciationPercent =
        calculateValueChangePercentage(depreciatedProperty);

      expect(appreciationPercent).toBeCloseTo(10); // 10% appreciation
      expect(depreciationPercent).toBeCloseTo(-10); // 10% depreciation
    });

    it("should correctly identify appreciated properties", () => {
      expect(hasAppreciated(appreciatedProperty)).toBe(true);
      expect(hasAppreciated(depreciatedProperty)).toBe(false);
    });

    it("should correctly identify depreciated properties", () => {
      expect(hasDepreciated(appreciatedProperty)).toBe(false);
      expect(hasDepreciated(depreciatedProperty)).toBe(true);
    });

    it("should calculate annual appreciation rate", () => {
      // For a property valued 6 months ago (within 2 year limit)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const propertyResult = createPropertyValuation(
        550000, // Current value
        500000, // Purchase price
        sixMonthsAgo, // Valuation date 6 months ago
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(propertyResult.success).toBe(true);
      if (propertyResult.success) {
        const annualRate = calculateAnnualAppreciationRate(propertyResult.data);
        // 10% over 0.5 years should be approximately 21% annually (compound rate)
        expect(annualRate).toBeGreaterThan(15);
        expect(annualRate).toBeLessThan(25);
      }
    });
  });

  describe("mortgage suitability", () => {
    it("should identify current enough valuations for mortgage", () => {
      // Valuation from 1 year ago
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const result = createPropertyValuation(
        500000,
        450000,
        oneYearAgo,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(isCurrentEnoughForMortgage(result.data)).toBe(true);
      }
    });

    it("should identify too old valuations for mortgage", () => {
      // Valuation from 3 years ago
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      const result = createPropertyValuation(
        500000,
        450000,
        threeYearsAgo,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      // This should fail validation during creation
      expect(result.success).toBe(false);
    });

    it("should provide correct reliability scores", () => {
      const testCases = [
        { method: "BankAppraisal" as ValuationMethod, expectedScore: 95 },
        {
          method: "IndependentAppraisal" as ValuationMethod,
          expectedScore: 90,
        },
        { method: "InsuranceValuation" as ValuationMethod, expectedScore: 80 },
        {
          method: "ComparativeMarketAnalysis" as ValuationMethod,
          expectedScore: 70,
        },
        { method: "OnlineEstimate" as ValuationMethod, expectedScore: 60 },
        { method: "SelfAssessment" as ValuationMethod, expectedScore: 40 },
      ];

      testCases.forEach(({ method, expectedScore }) => {
        const result = createPropertyValuation(
          500000,
          450000,
          testDate,
          method,
          "Eigenheim",
          validLocation
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(getReliabilityScore(result.data)).toBe(expectedScore);
        }
      });
    });

    it("should identify acceptable methods for mortgage", () => {
      const acceptableMethods: ValuationMethod[] = [
        "BankAppraisal",
        "IndependentAppraisal",
        "InsuranceValuation",
      ];

      const unacceptableMethods: ValuationMethod[] = [
        "OnlineEstimate",
        "ComparativeMarketAnalysis",
        "SelfAssessment",
      ];

      acceptableMethods.forEach((method) => {
        const result = createPropertyValuation(
          500000,
          450000,
          testDate,
          method,
          "Eigenheim",
          validLocation
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(isAcceptableForMortgage(result.data)).toBe(true);
        }
      });

      unacceptableMethods.forEach((method) => {
        const result = createPropertyValuation(
          500000,
          450000,
          testDate,
          method,
          "Eigenheim",
          validLocation
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(isAcceptableForMortgage(result.data)).toBe(false);
        }
      });
    });
  });

  describe("conservative valuation", () => {
    it("should create conservative valuation with default conservatism", () => {
      const originalResult = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(originalResult.success).toBe(true);
      if (originalResult.success) {
        const conservativeResult = createConservativeValuation(
          originalResult.data
        );

        expect(conservativeResult.success).toBe(true);
        if (conservativeResult.success) {
          // Should be 10% less than original
          expect(toEuros(getCurrentValue(conservativeResult.data))).toBe(
            450000
          );
          expect((conservativeResult.data as any).notes).toContain(
            "Conservative estimate"
          );
        }
      }
    });

    it("should create conservative valuation with custom conservatism", () => {
      const originalResult = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(originalResult.success).toBe(true);
      if (originalResult.success) {
        const conservativeResult = createConservativeValuation(
          originalResult.data,
          20
        );

        expect(conservativeResult.success).toBe(true);
        if (conservativeResult.success) {
          // Should be 20% less than original
          expect(toEuros(getCurrentValue(conservativeResult.data))).toBe(
            400000
          );
        }
      }
    });
  });

  describe("formatting and display", () => {
    it("should format property valuation correctly", () => {
      const result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const formatted = formatPropertyValuation(result.data);
        expect(formatted).toContain("Eigenheim");
        expect(formatted).toContain("München");
        expect(formatted).toContain("500.000,00");
        expect(formatted).toContain("BankAppraisal");
      }
    });

    it("should provide correct location quality descriptions", () => {
      const testCases = [
        {
          quality: "Premium" as LocationQuality,
          expected: "Erstklassige Lage",
        },
        { quality: "Good" as LocationQuality, expected: "Gute Wohnlage" },
        { quality: "Average" as LocationQuality, expected: "Normale Wohnlage" },
        {
          quality: "Below Average" as LocationQuality,
          expected: "Einfache Lage",
        },
        { quality: "Rural" as LocationQuality, expected: "Ländliche Lage" },
      ];

      testCases.forEach(({ quality, expected }) => {
        const description = getLocationQualityDescription(quality);
        expect(description).toContain(expected);
      });
    });
  });

  describe("comparison and sorting", () => {
    it("should compare properties by value correctly", () => {
      const property1Result = createPropertyValuation(
        400000,
        350000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      const property2Result = createPropertyValuation(
        600000,
        550000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(property1Result.success).toBe(true);
      expect(property2Result.success).toBe(true);

      if (property1Result.success && property2Result.success) {
        const comparison = compareByValue(
          property1Result.data,
          property2Result.data
        );
        expect(comparison).toBeLessThan(0); // property1 < property2
      }
    });

    it("should compare properties by date correctly", () => {
      const earlierDate = new Date();
      earlierDate.setMonth(earlierDate.getMonth() - 12); // 12 months ago

      const laterDate = new Date();
      laterDate.setMonth(laterDate.getMonth() - 6); // 6 months ago

      const property1Result = createPropertyValuation(
        500000,
        450000,
        earlierDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      const property2Result = createPropertyValuation(
        500000,
        450000,
        laterDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(property1Result.success).toBe(true);
      expect(property2Result.success).toBe(true);

      if (property1Result.success && property2Result.success) {
        const comparison = compareByDate(
          property1Result.data,
          property2Result.data
        );
        expect(comparison).toBeLessThan(0); // earlier date < later date
      }
    });
  });

  describe("utility functions", () => {
    it("should validate German postal codes correctly", () => {
      expect(isValidGermanPostalCode("80331")).toBe(true);
      expect(isValidGermanPostalCode("12345")).toBe(true);
      expect(isValidGermanPostalCode("1234")).toBe(false); // Too short
      expect(isValidGermanPostalCode("123456")).toBe(false); // Too long
      expect(isValidGermanPostalCode("1234a")).toBe(false); // Contains letter
      expect(isValidGermanPostalCode("")).toBe(false); // Empty
    });

    it("should return correct minimum and maximum values", () => {
      expect(getMinimumPropertyValue()).toBe(10000);
      expect(getMaximumPropertyValue()).toBe(50000000);
      expect(getMaxValuationAgeMonths()).toBe(24);
    });

    it("should identify same property correctly", () => {
      const property1Result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      const property2Result = createPropertyValuation(
        520000, // Different value
        450000,
        testDate,
        "IndependentAppraisal", // Different method
        "Eigenheim", // Same type
        validLocation // Same location
      );

      const property3Result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigentumswohnung", // Different type
        validLocation
      );

      expect(property1Result.success).toBe(true);
      expect(property2Result.success).toBe(true);
      expect(property3Result.success).toBe(true);

      if (
        property1Result.success &&
        property2Result.success &&
        property3Result.success
      ) {
        // Same location and type = same property
        expect(isSameProperty(property1Result.data, property2Result.data)).toBe(
          true
        );

        // Different type = different property
        expect(isSameProperty(property1Result.data, property3Result.data)).toBe(
          false
        );
      }
    });
  });

  describe("edge cases", () => {
    it("should handle zero appreciation rate calculation", () => {
      const result = createPropertyValuation(
        500000, // Same as purchase price
        500000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(calculateValueChangePercentage(result.data)).toBe(0);
        expect(hasAppreciated(result.data)).toBe(false);
        expect(hasDepreciated(result.data)).toBe(false);
      }
    });

    it("should handle boundary values", () => {
      const minValueResult = createPropertyValuation(
        getMinimumPropertyValue(),
        getMinimumPropertyValue(),
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(minValueResult.success).toBe(true);

      const maxValueResult = createPropertyValuation(
        getMaximumPropertyValue(),
        getMaximumPropertyValue(),
        testDate,
        "BankAppraisal",
        "Eigenheim",
        validLocation
      );

      expect(maxValueResult.success).toBe(true);
    });

    it("should ensure immutability of location object", () => {
      const originalLocation = { ...validLocation };
      const result = createPropertyValuation(
        500000,
        450000,
        testDate,
        "BankAppraisal",
        "Eigenheim",
        originalLocation
      );

      expect(result.success).toBe(true);
      if (result.success) {
        const retrievedLocation = getPropertyLocation(result.data);

        // Modify the original location
        originalLocation.city = "Berlin";

        // Retrieved location should not be affected
        expect(retrievedLocation.city).toBe("München");

        // Modify the retrieved location
        retrievedLocation.city = "Hamburg";

        // Getting the location again should return the original
        const secondRetrievedLocation = getPropertyLocation(result.data);
        expect(secondRetrievedLocation.city).toBe("München");
      }
    });
  });
});
