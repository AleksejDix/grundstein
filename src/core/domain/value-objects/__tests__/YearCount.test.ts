import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  type YearCount,
  createYearCount,
  toPositiveInteger,
  toNumber,
  toMonths,
  fromMonths,
  addYears,
  subtractYears,
  remainingYears,
  compareYearCount,
  isEqualYearCount,
  formatYearCount,
  getMinimumTermYears,
  getMaximumTermYears,
  isValidYearTermRange,
  SHORT_TERM_YEARS,
  MEDIUM_TERM_YEARS,
  LONG_TERM_YEARS,
  MAXIMUM_STANDARD_TERM_YEARS,
  type YearCountValidationError,
} from "../YearCount";

describe("YearCount Type", () => {
  describe("createYearCount", () => {
    it("should create valid YearCount for realistic loan terms", () => {
      const realisticTerms = [
        1, // Minimum
        5, // Short term
        10, // Medium-short
        15, // Medium
        20, // Long-medium
        25, // Long
        30, // Standard maximum
        40, // Absolute maximum
      ];

      realisticTerms.forEach((years) => {
        const result = createYearCount(years);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(years);
        }
      });
    });

    it("should reject terms below minimum", () => {
      const belowMinimumTerms = [0, -1, -5];

      belowMinimumTerms.forEach((years) => {
        const result = createYearCount(years);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PositiveIntegerValidationError");
        }
      });
    });

    it("should reject terms above maximum", () => {
      const aboveMaximumTerms = [41, 50, 100];

      aboveMaximumTerms.forEach((years) => {
        const result = createYearCount(years);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximumTerm");
        }
      });
    });

    it("should reject invalid terms (PositiveInteger validation)", () => {
      const invalidTerms = [NaN, Infinity, -Infinity, 10.5, 0.5];

      invalidTerms.forEach((years) => {
        const result = createYearCount(years);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PositiveIntegerValidationError");
        }
      });
    });
  });

  describe("Type conversion functions", () => {
    it("should convert YearCount to PositiveInteger correctly", () => {
      const years = 20;
      const yearCountResult = createYearCount(years);

      expect(yearCountResult.success).toBe(true);
      if (yearCountResult.success) {
        const positiveInteger = toPositiveInteger(yearCountResult.data);
        expect(typeof positiveInteger).toBe("number"); // Underlying type is number
      }
    });

    it("should convert YearCount to number correctly", () => {
      const years = 25;
      const yearCountResult = createYearCount(years);

      expect(yearCountResult.success).toBe(true);
      if (yearCountResult.success) {
        const numberValue = toNumber(yearCountResult.data);
        expect(numberValue).toBe(years);
      }
    });

    it("should convert YearCount to months correctly", () => {
      const years = 5;
      const yearCountResult = createYearCount(years);

      expect(yearCountResult.success).toBe(true);
      if (yearCountResult.success) {
        const months = toMonths(yearCountResult.data);
        expect(months).toBe(60); // 5 * 12
      }
    });
  });

  describe("Month conversion", () => {
    it("should create YearCount from months correctly", () => {
      const months = 120; // 10 years
      const result = fromMonths(months);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(10);
      }
    });

    it("should handle fractional years with rounding", () => {
      const months = 30; // 2.5 years, should round to 3
      const result = fromMonths(months);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(3);
      }
    });

    it("should round down for .4 years", () => {
      const months = 29; // 2.42 years, should round to 2
      const result = fromMonths(months);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(2);
      }
    });
  });

  describe("Year arithmetic", () => {
    it("should add years correctly", () => {
      const baseTerm = createYearCount(10);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = addYears(baseTerm.data, 5);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(15);
        }
      }
    });

    it("should subtract years correctly", () => {
      const baseTerm = createYearCount(20);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = subtractYears(baseTerm.data, 5);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(15);
        }
      }
    });

    it("should calculate remaining years correctly", () => {
      const totalTerm = createYearCount(30);
      const elapsedTerm = createYearCount(10);

      expect(totalTerm.success && elapsedTerm.success).toBe(true);
      if (totalTerm.success && elapsedTerm.success) {
        const result = remainingYears(totalTerm.data, elapsedTerm.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(20);
        }
      }
    });
  });

  describe("Formatting", () => {
    it("should format single year correctly", () => {
      const singleYear = createYearCount(1);

      expect(singleYear.success).toBe(true);
      if (singleYear.success) {
        const formatted = formatYearCount(singleYear.data);
        expect(formatted).toBe("1 Jahr");
      }
    });

    it("should format multiple years correctly", () => {
      const multipleYears = createYearCount(25);

      expect(multipleYears.success).toBe(true);
      if (multipleYears.success) {
        const formatted = formatYearCount(multipleYears.data);
        expect(formatted).toBe("25 Jahre");
      }
    });
  });

  describe("Constants and limits", () => {
    it("should provide valid minimum term in years", () => {
      const minTerm = getMinimumTermYears();
      const value = toNumber(minTerm);

      expect(value).toBe(1);
    });

    it("should provide valid maximum term in years", () => {
      const maxTerm = getMaximumTermYears();
      const value = toNumber(maxTerm);

      expect(value).toBe(40);
    });

    it("should validate year term range", () => {
      expect(isValidYearTermRange(0)).toBe(false); // Below minimum
      expect(isValidYearTermRange(1)).toBe(true); // At minimum
      expect(isValidYearTermRange(20)).toBe(true); // In range
      expect(isValidYearTermRange(40)).toBe(true); // At maximum
      expect(isValidYearTermRange(41)).toBe(false); // Above maximum
      expect(isValidYearTermRange(10.5)).toBe(false); // Not integer
    });
  });

  describe("Market term constants", () => {
    it("should have valid typical term constants", () => {
      expect(toNumber(SHORT_TERM_YEARS)).toBe(5); // 5 years
      expect(toNumber(MEDIUM_TERM_YEARS)).toBe(15); // 15 years
      expect(toNumber(LONG_TERM_YEARS)).toBe(25); // 25 years
      expect(toNumber(MAXIMUM_STANDARD_TERM_YEARS)).toBe(30); // 30 years
    });

    it("should ensure all constants are within valid range", () => {
      const constants = [
        SHORT_TERM_YEARS,
        MEDIUM_TERM_YEARS,
        LONG_TERM_YEARS,
        MAXIMUM_STANDARD_TERM_YEARS,
      ];

      constants.forEach((term) => {
        const value = toNumber(term);
        expect(isValidYearTermRange(value)).toBe(true);
      });
    });

    it("should have constants in logical order", () => {
      expect(toNumber(SHORT_TERM_YEARS)).toBeLessThan(
        toNumber(MEDIUM_TERM_YEARS)
      );
      expect(toNumber(MEDIUM_TERM_YEARS)).toBeLessThan(
        toNumber(LONG_TERM_YEARS)
      );
      expect(toNumber(LONG_TERM_YEARS)).toBeLessThan(
        toNumber(MAXIMUM_STANDARD_TERM_YEARS)
      );
    });

    it("should convert constants to months correctly", () => {
      expect(toMonths(SHORT_TERM_YEARS)).toBe(60); // 5 * 12
      expect(toMonths(MEDIUM_TERM_YEARS)).toBe(180); // 15 * 12
      expect(toMonths(LONG_TERM_YEARS)).toBe(300); // 25 * 12
      expect(toMonths(MAXIMUM_STANDARD_TERM_YEARS)).toBe(360); // 30 * 12
    });
  });
});

// Property-based tests
describe("YearCount Property-Based Tests", () => {
  describe("Valid term range", () => {
    it("should accept all terms in valid range", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 40 }), (years) => {
          const result = createYearCount(years);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(toNumber(result.data)).toBe(years);
          }
        })
      );
    });

    it("should reject all terms above maximum", () => {
      fc.assert(
        fc.property(fc.integer({ min: 41, max: 100 }), (aboveMaxYears) => {
          const result = createYearCount(aboveMaxYears);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("AboveMaximumTerm");
          }
        })
      );
    });
  });

  describe("Month conversion properties", () => {
    it("should maintain relationship: months = years * 12", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 40 }), (years) => {
          const yearResult = createYearCount(years);

          if (yearResult.success) {
            const months = toMonths(yearResult.data);
            expect(months).toBe(years * 12);
          }
        })
      );
    });
  });

  describe("Formatting properties", () => {
    it("should always produce valid German text", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 40 }), (years) => {
          const termResult = createYearCount(years);

          if (termResult.success) {
            const formatted = formatYearCount(termResult.data);

            // Should contain German words and be a string
            expect(typeof formatted).toBe("string");
            expect(formatted.length).toBeGreaterThan(0);

            // Should contain either "Jahr" or "Jahre"
            const hasGermanTerms = /\b(Jahr|Jahre)\b/.test(formatted);
            expect(hasGermanTerms).toBe(true);

            // Should start with a number
            expect(formatted).toMatch(/^\d+\s/);
          }
        })
      );
    });

    it("should use singular for 1 year, plural for others", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 40 }), (years) => {
          const termResult = createYearCount(years);

          if (termResult.success) {
            const formatted = formatYearCount(termResult.data);

            if (years === 1) {
              expect(formatted).toBe("1 Jahr");
            } else {
              expect(formatted).toBe(`${years} Jahre`);
            }
          }
        })
      );
    });
  });
});
