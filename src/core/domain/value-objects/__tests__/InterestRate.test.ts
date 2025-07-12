import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createInterestRate,
  toPercentage,
  toNumber,
  toDecimal,
  fromDecimal,
  toMonthlyRate,
  fromMonthlyRate,
  addBasisPoints,
  compareInterestRate,
  isEqualInterestRate,
  formatInterestRate,
  getMinimumInterestRate,
  getMaximumInterestRate,
  isValidInterestRateRange,
  TYPICAL_LOW_RATE,
  TYPICAL_CURRENT_RATE,
  TYPICAL_HIGH_RATE,
  STRESS_TEST_RATE,
} from "../InterestRate";

describe("InterestRate Type", () => {
  describe("createInterestRate", () => {
    it("should create valid InterestRate for realistic mortgage rates", () => {
      const realisticRates = [
        0.1, // Minimum
        1.5, // Historical low
        3.5, // Current typical
        6.0, // High but reasonable
        10.0, // Stress test
        25.0, // Maximum
      ];

      realisticRates.forEach((rate) => {
        const result = createInterestRate(rate);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(rate);
        }
      });
    });

    it("should reject rates below minimum", () => {
      const belowMinimumRates = [-0.1, -1, -5]; // Only negative rates should be rejected

      belowMinimumRates.forEach((rate) => {
        const result = createInterestRate(rate);

        expect(result.success).toBe(false);
        if (!result.success) {
          // Negative values are caught by Percentage validation first
          expect(result.error).toBe("PercentageValidationError");
        }
      });
    });

    it("should accept zero interest rate", () => {
      const result = createInterestRate(0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(0);
      }
    });

    it("should reject rates above maximum", () => {
      const aboveMaximumRates = [25.1, 30, 50, 100];

      aboveMaximumRates.forEach((rate) => {
        const result = createInterestRate(rate);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximumRate");
        }
      });
    });

    it("should reject invalid rates (Percentage validation)", () => {
      const invalidRates = [NaN, Infinity, -Infinity, -5];

      invalidRates.forEach((rate) => {
        const result = createInterestRate(rate);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PercentageValidationError");
        }
      });
    });
  });

  describe("Type conversion functions", () => {
    it("should convert InterestRate to Percentage correctly", () => {
      const rate = 3.5;
      const interestRateResult = createInterestRate(rate);

      expect(interestRateResult.success).toBe(true);
      if (interestRateResult.success) {
        const percentage = toPercentage(interestRateResult.data);
        expect(typeof percentage).toBe("number"); // Underlying type is number
      }
    });

    it("should convert InterestRate to number correctly", () => {
      const rate = 4.25;
      const interestRateResult = createInterestRate(rate);

      expect(interestRateResult.success).toBe(true);
      if (interestRateResult.success) {
        const numberValue = toNumber(interestRateResult.data);
        expect(numberValue).toBe(rate);
      }
    });

    it("should convert InterestRate to decimal correctly", () => {
      const rate = 5.0;
      const interestRateResult = createInterestRate(rate);

      expect(interestRateResult.success).toBe(true);
      if (interestRateResult.success) {
        const decimal = toDecimal(interestRateResult.data);
        expect(decimal).toBeCloseTo(0.05);
      }
    });
  });

  describe("Decimal conversion", () => {
    it("should create InterestRate from decimal correctly", () => {
      const decimal = 0.035; // 3.5%
      const result = fromDecimal(decimal);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBeCloseTo(3.5);
      }
    });

    it("should round-trip between rate and decimal", () => {
      const originalRate = 4.75;
      const rateResult = createInterestRate(originalRate);

      expect(rateResult.success).toBe(true);
      if (rateResult.success) {
        const decimal = toDecimal(rateResult.data);
        const backToRateResult = fromDecimal(decimal);

        expect(backToRateResult.success).toBe(true);
        if (backToRateResult.success) {
          expect(toNumber(backToRateResult.data)).toBeCloseTo(originalRate);
        }
      }
    });
  });

  describe("Monthly rate conversion", () => {
    it("should calculate monthly rate correctly", () => {
      const annualRate = createInterestRate(6.0); // 6% annually

      expect(annualRate.success).toBe(true);
      if (annualRate.success) {
        const monthlyRate = toMonthlyRate(annualRate.data);
        expect(monthlyRate).toBeCloseTo(0.005); // 0.5% monthly
      }
    });

    it("should create annual rate from monthly rate", () => {
      const monthlyDecimal = 0.004; // 0.4% monthly
      const result = fromMonthlyRate(monthlyDecimal);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBeCloseTo(4.8); // 4.8% annually
      }
    });

    it("should round-trip between annual and monthly rates", () => {
      const originalAnnualRate = createInterestRate(3.6);

      expect(originalAnnualRate.success).toBe(true);
      if (originalAnnualRate.success) {
        const monthlyRate = toMonthlyRate(originalAnnualRate.data);
        const backToAnnualResult = fromMonthlyRate(monthlyRate);

        expect(backToAnnualResult.success).toBe(true);
        if (backToAnnualResult.success) {
          expect(toNumber(backToAnnualResult.data)).toBeCloseTo(3.6);
        }
      }
    });
  });

  describe("Basis points operations", () => {
    it("should add basis points correctly", () => {
      const baseRate = createInterestRate(3.0);

      expect(baseRate.success).toBe(true);
      if (baseRate.success) {
        const result = addBasisPoints(baseRate.data, 50); // Add 50 basis points (0.5%)

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBeCloseTo(3.5);
        }
      }
    });

    it("should handle negative basis points", () => {
      const baseRate = createInterestRate(4.0);

      expect(baseRate.success).toBe(true);
      if (baseRate.success) {
        const result = addBasisPoints(baseRate.data, -25); // Subtract 25 basis points (0.25%)

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBeCloseTo(3.75);
        }
      }
    });

    it("should reject basis points that would exceed limits", () => {
      const highRate = createInterestRate(24.5);

      expect(highRate.success).toBe(true);
      if (highRate.success) {
        const result = addBasisPoints(highRate.data, 100); // Would exceed 25% limit

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximumRate");
        }
      }
    });
  });

  describe("Comparison functions", () => {
    it("should compare interest rates correctly", () => {
      const lowRate = createInterestRate(2.0);
      const highRate = createInterestRate(5.0);
      const sameRate = createInterestRate(2.0);

      expect(lowRate.success && highRate.success && sameRate.success).toBe(
        true,
      );
      if (lowRate.success && highRate.success && sameRate.success) {
        expect(compareInterestRate(lowRate.data, highRate.data)).toBeLessThan(
          0,
        );
        expect(
          compareInterestRate(highRate.data, lowRate.data),
        ).toBeGreaterThan(0);
        expect(compareInterestRate(lowRate.data, sameRate.data)).toBe(0);

        expect(isEqualInterestRate(lowRate.data, sameRate.data)).toBe(true);
        expect(isEqualInterestRate(lowRate.data, highRate.data)).toBe(false);
      }
    });
  });

  describe("Formatting", () => {
    it("should format InterestRate using German percentage format", () => {
      const interestRate = createInterestRate(3.5);

      expect(interestRate.success).toBe(true);
      if (interestRate.success) {
        const formatted = formatInterestRate(interestRate.data);
        expect(formatted).toMatch(/3[.,]50[\s%]/); // Allow for different separators and spaces
        expect(formatted).toContain("%");
      }
    });

    it("should format with custom decimal places", () => {
      const interestRate = createInterestRate(4.12345);

      expect(interestRate.success).toBe(true);
      if (interestRate.success) {
        const formatted = formatInterestRate(interestRate.data, 3);
        expect(formatted).toMatch(/4[.,]123/); // Should show 3 decimal places
      }
    });
  });

  describe("Constants and limits", () => {
    it("should provide valid minimum interest rate", () => {
      const minRate = getMinimumInterestRate();
      const value = toNumber(minRate);

      expect(value).toBe(0.0); // Changed to support zero-interest loans
    });

    it("should provide valid maximum interest rate", () => {
      const maxRate = getMaximumInterestRate();
      const value = toNumber(maxRate);

      expect(value).toBe(25.0);
    });

    it("should validate interest rate range", () => {
      expect(isValidInterestRateRange(-0.1)).toBe(false); // Below minimum (negative)
      expect(isValidInterestRateRange(0.0)).toBe(true); // At minimum (zero interest)
      expect(isValidInterestRateRange(0.05)).toBe(true); // Small positive rate
      expect(isValidInterestRateRange(3.5)).toBe(true); // In range
      expect(isValidInterestRateRange(25.0)).toBe(true); // At maximum
      expect(isValidInterestRateRange(25.1)).toBe(false); // Above maximum
    });
  });

  describe("Market rate constants", () => {
    it("should have valid typical rate constants", () => {
      expect(toNumber(TYPICAL_LOW_RATE)).toBe(1.5);
      expect(toNumber(TYPICAL_CURRENT_RATE)).toBe(3.5);
      expect(toNumber(TYPICAL_HIGH_RATE)).toBe(6.0);
      expect(toNumber(STRESS_TEST_RATE)).toBe(10.0);
    });

    it("should ensure all constants are within valid range", () => {
      const constants = [
        TYPICAL_LOW_RATE,
        TYPICAL_CURRENT_RATE,
        TYPICAL_HIGH_RATE,
        STRESS_TEST_RATE,
      ];

      constants.forEach((rate) => {
        const value = toNumber(rate);
        expect(isValidInterestRateRange(value)).toBe(true);
      });
    });

    it("should have constants in logical order", () => {
      expect(toNumber(TYPICAL_LOW_RATE)).toBeLessThan(
        toNumber(TYPICAL_CURRENT_RATE),
      );
      expect(toNumber(TYPICAL_CURRENT_RATE)).toBeLessThan(
        toNumber(TYPICAL_HIGH_RATE),
      );
      expect(toNumber(TYPICAL_HIGH_RATE)).toBeLessThan(
        toNumber(STRESS_TEST_RATE),
      );
    });
  });
});

// Property-based tests
describe("InterestRate Property-Based Tests", () => {
  describe("Valid interest rate range", () => {
    it("should accept all rates in valid range", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.0),
            max: Math.fround(25.0),
            noNaN: true,
          }),
          (rate) => {
            const result = createInterestRate(rate);
            expect(result.success).toBe(true);
            if (result.success) {
              expect(toNumber(result.data)).toBeCloseTo(rate, 10);
            }
          },
        ),
      );
    });

    it("should reject all rates below minimum", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(-10.0),
            max: Math.fround(-0.001), // Only negative rates should be rejected
            noNaN: true,
          }),
          (belowMinRate) => {
            const result = createInterestRate(belowMinRate);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("PercentageValidationError");
            }
          },
        ),
      );
    });

    it("should reject all rates above maximum", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(25.01),
            max: Math.fround(100.0),
            noNaN: true,
          }),
          (aboveMaxRate) => {
            const result = createInterestRate(aboveMaxRate);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("AboveMaximumRate");
            }
          },
        ),
      );
    });
  });

  describe("Decimal conversion properties", () => {
    it("should maintain precision in decimal conversion: rate -> decimal -> rate", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.0),
            max: Math.fround(25.0),
            noNaN: true,
          }),
          (originalRate) => {
            const rateResult = createInterestRate(originalRate);

            if (rateResult.success) {
              const decimal = toDecimal(rateResult.data);
              const backToRateResult = fromDecimal(decimal);

              if (backToRateResult.success) {
                expect(toNumber(backToRateResult.data)).toBeCloseTo(
                  originalRate,
                  8,
                );
              }
            }
          },
        ),
      );
    });
  });

  describe("Monthly rate conversion properties", () => {
    it("should maintain relationship: annual / 12 = monthly", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.0),
            max: Math.fround(25.0),
            noNaN: true,
          }),
          (annualRate) => {
            const rateResult = createInterestRate(annualRate);

            if (rateResult.success) {
              const monthlyRate = toMonthlyRate(rateResult.data);
              const expectedMonthly = toDecimal(rateResult.data) / 12;

              expect(monthlyRate).toBeCloseTo(expectedMonthly, 10);
            }
          },
        ),
      );
    });
  });

  describe("Basis points properties", () => {
    it("should be additive: rate + bp1 + bp2 = rate + (bp1 + bp2)", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(1.0),
            max: Math.fround(20.0),
            noNaN: true,
          }),
          fc.integer({ min: -50, max: 50 }),
          fc.integer({ min: -50, max: 50 }),
          (baseRate, bp1, bp2) => {
            const rateResult = createInterestRate(baseRate);

            if (rateResult.success) {
              const step1Result = addBasisPoints(rateResult.data, bp1);
              if (step1Result.success) {
                const step2Result = addBasisPoints(step1Result.data, bp2);
                const directResult = addBasisPoints(rateResult.data, bp1 + bp2);

                if (step2Result.success && directResult.success) {
                  expect(toNumber(step2Result.data)).toBeCloseTo(
                    toNumber(directResult.data),
                    8,
                  );
                }
              }
            }
          },
        ),
      );
    });
  });

  describe("Comparison properties", () => {
    it("should be transitive: if a < b and b < c, then a < c", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.0),
            max: Math.fround(8.0),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(8.0),
            max: Math.fround(16.0),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(16.0),
            max: Math.fround(25.0),
            noNaN: true,
          }),
          (a, b, c) => {
            const rateA = createInterestRate(a);
            const rateB = createInterestRate(b);
            const rateC = createInterestRate(c);

            if (rateA.success && rateB.success && rateC.success) {
              expect(compareInterestRate(rateA.data, rateB.data)).toBeLessThan(
                0,
              );
              expect(compareInterestRate(rateB.data, rateC.data)).toBeLessThan(
                0,
              );
              expect(compareInterestRate(rateA.data, rateC.data)).toBeLessThan(
                0,
              );
            }
          },
        ),
      );
    });
  });
});
