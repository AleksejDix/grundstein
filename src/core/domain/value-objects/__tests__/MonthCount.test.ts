import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createMonthCount,
  toPositiveInteger,
  toNumber,
  toYears,
  fromYears,
  addMonths,
  subtractMonths,
  remainingMonths,
  compareMonthCount,
  isEqualMonthCount,
  formatMonthCount,
  getMinimumTerm,
  getMaximumTerm,
  isValidTermRange,
  SHORT_TERM,
  MEDIUM_TERM,
  LONG_TERM,
  MAXIMUM_STANDARD_TERM,
} from "../MonthCount";

describe("MonthCount Type", () => {
  describe("createMonthCount", () => {
    it("should create valid MonthCount for realistic loan terms", () => {
      const realisticTerms = [
        1, // Minimum
        12, // 1 year
        60, // 5 years
        180, // 15 years
        240, // 20 years
        300, // 25 years
        360, // 30 years (common maximum)
        480, // 40 years (absolute maximum)
      ];

      realisticTerms.forEach((months) => {
        const result = createMonthCount(months);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(months);
        }
      });
    });

    it("should reject terms below minimum", () => {
      const belowMinimumTerms = [0, -1, -12];

      belowMinimumTerms.forEach((months) => {
        const result = createMonthCount(months);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PositiveIntegerValidationError");
        }
      });
    });

    it("should reject terms above maximum", () => {
      const aboveMaximumTerms = [481, 500, 600, 1200];

      aboveMaximumTerms.forEach((months) => {
        const result = createMonthCount(months);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximumTerm");
        }
      });
    });

    it("should reject invalid terms (PositiveInteger validation)", () => {
      const invalidTerms = [NaN, Infinity, -Infinity, 12.5, 0.5];

      invalidTerms.forEach((months) => {
        const result = createMonthCount(months);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PositiveIntegerValidationError");
        }
      });
    });
  });

  describe("Type conversion functions", () => {
    it("should convert MonthCount to PositiveInteger correctly", () => {
      const months = 120;
      const monthCountResult = createMonthCount(months);

      expect(monthCountResult.success).toBe(true);
      if (monthCountResult.success) {
        const positiveInteger = toPositiveInteger(monthCountResult.data);
        expect(typeof positiveInteger).toBe("number"); // Underlying type is number
      }
    });

    it("should convert MonthCount to number correctly", () => {
      const months = 240;
      const monthCountResult = createMonthCount(months);

      expect(monthCountResult.success).toBe(true);
      if (monthCountResult.success) {
        const numberValue = toNumber(monthCountResult.data);
        expect(numberValue).toBe(months);
      }
    });

    it("should convert MonthCount to years correctly", () => {
      const months = 60; // 5 years
      const monthCountResult = createMonthCount(months);

      expect(monthCountResult.success).toBe(true);
      if (monthCountResult.success) {
        const years = toYears(monthCountResult.data);
        expect(years).toBe(5);
      }
    });

    it("should handle fractional years conversion", () => {
      const months = 18; // 1.5 years
      const monthCountResult = createMonthCount(months);

      expect(monthCountResult.success).toBe(true);
      if (monthCountResult.success) {
        const years = toYears(monthCountResult.data);
        expect(years).toBe(1.5);
      }
    });
  });

  describe("Years conversion", () => {
    it("should create MonthCount from years correctly", () => {
      const years = 10;
      const result = fromYears(years);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(120); // 10 * 12
      }
    });

    it("should handle fractional years with rounding", () => {
      const years = 2.5;
      const result = fromYears(years);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(30); // 2.5 * 12 = 30
      }
    });

    it("should round fractional months appropriately", () => {
      const years = 2.42; // 29.04 months, should round to 29
      const result = fromYears(years);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(29);
      }
    });

    it("should round-trip between months and years", () => {
      const originalMonths = createMonthCount(240);

      expect(originalMonths.success).toBe(true);
      if (originalMonths.success) {
        const years = toYears(originalMonths.data);
        const backToMonthsResult = fromYears(years);

        expect(backToMonthsResult.success).toBe(true);
        if (backToMonthsResult.success) {
          expect(toNumber(backToMonthsResult.data)).toBe(240);
        }
      }
    });
  });

  describe("Month arithmetic", () => {
    it("should add months correctly", () => {
      const baseTerm = createMonthCount(120);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = addMonths(baseTerm.data, 60);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(180);
        }
      }
    });

    it("should subtract months correctly", () => {
      const baseTerm = createMonthCount(180);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = subtractMonths(baseTerm.data, 60);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(120);
        }
      }
    });

    it("should calculate remaining months correctly", () => {
      const totalTerm = createMonthCount(360);
      const elapsedTerm = createMonthCount(120);

      expect(totalTerm.success && elapsedTerm.success).toBe(true);
      if (totalTerm.success && elapsedTerm.success) {
        const result = remainingMonths(totalTerm.data, elapsedTerm.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(240);
        }
      }
    });

    it("should reject operations that result in invalid terms", () => {
      const baseTerm = createMonthCount(10);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = subtractMonths(baseTerm.data, 15); // Would result in negative

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("PositiveIntegerValidationError");
        }
      }
    });

    it("should reject operations that exceed maximum", () => {
      const baseTerm = createMonthCount(450);

      expect(baseTerm.success).toBe(true);
      if (baseTerm.success) {
        const result = addMonths(baseTerm.data, 50); // Would exceed 480

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximumTerm");
        }
      }
    });
  });

  describe("Comparison functions", () => {
    it("should compare month counts correctly", () => {
      const shortTerm = createMonthCount(120);
      const longTerm = createMonthCount(360);
      const sameTerm = createMonthCount(120);

      expect(shortTerm.success && longTerm.success && sameTerm.success).toBe(
        true,
      );
      if (shortTerm.success && longTerm.success && sameTerm.success) {
        expect(compareMonthCount(shortTerm.data, longTerm.data)).toBeLessThan(
          0,
        );
        expect(
          compareMonthCount(longTerm.data, shortTerm.data),
        ).toBeGreaterThan(0);
        expect(compareMonthCount(shortTerm.data, sameTerm.data)).toBe(0);

        expect(isEqualMonthCount(shortTerm.data, sameTerm.data)).toBe(true);
        expect(isEqualMonthCount(shortTerm.data, longTerm.data)).toBe(false);
      }
    });
  });

  describe("Formatting", () => {
    it("should format short terms in months", () => {
      const shortTerm = createMonthCount(6);

      expect(shortTerm.success).toBe(true);
      if (shortTerm.success) {
        const formatted = formatMonthCount(shortTerm.data);
        expect(formatted).toBe("6 Monate");
      }
    });

    it("should format single month correctly", () => {
      const singleMonth = createMonthCount(1);

      expect(singleMonth.success).toBe(true);
      if (singleMonth.success) {
        const formatted = formatMonthCount(singleMonth.data);
        expect(formatted).toBe("1 Monat");
      }
    });

    it("should format exact years", () => {
      const exactYears = createMonthCount(24); // 2 years

      expect(exactYears.success).toBe(true);
      if (exactYears.success) {
        const formatted = formatMonthCount(exactYears.data);
        expect(formatted).toBe("2 Jahre");
      }
    });

    it("should format single year correctly", () => {
      const singleYear = createMonthCount(12);

      expect(singleYear.success).toBe(true);
      if (singleYear.success) {
        const formatted = formatMonthCount(singleYear.data);
        expect(formatted).toBe("1 Jahr");
      }
    });

    it("should format mixed years and months", () => {
      const mixedTerm = createMonthCount(30); // 2 years 6 months

      expect(mixedTerm.success).toBe(true);
      if (mixedTerm.success) {
        const formatted = formatMonthCount(mixedTerm.data);
        expect(formatted).toBe("2 Jahre 6 Monate");
      }
    });

    it("should format one year and one month correctly", () => {
      const mixedTerm = createMonthCount(13); // 1 year 1 month

      expect(mixedTerm.success).toBe(true);
      if (mixedTerm.success) {
        const formatted = formatMonthCount(mixedTerm.data);
        expect(formatted).toBe("1 Jahr 1 Monat");
      }
    });
  });

  describe("Constants and limits", () => {
    it("should provide valid minimum term", () => {
      const minTerm = getMinimumTerm();
      const value = toNumber(minTerm);

      expect(value).toBe(1);
    });

    it("should provide valid maximum term", () => {
      const maxTerm = getMaximumTerm();
      const value = toNumber(maxTerm);

      expect(value).toBe(480);
    });

    it("should validate term range", () => {
      expect(isValidTermRange(0)).toBe(false); // Below minimum
      expect(isValidTermRange(1)).toBe(true); // At minimum
      expect(isValidTermRange(12)).toBe(true); // In range
      expect(isValidTermRange(480)).toBe(true); // At maximum
      expect(isValidTermRange(481)).toBe(false); // Above maximum
      expect(isValidTermRange(12.5)).toBe(false); // Not integer
    });
  });

  describe("Market term constants", () => {
    it("should have valid typical term constants", () => {
      expect(toNumber(SHORT_TERM)).toBe(60); // 5 years
      expect(toNumber(MEDIUM_TERM)).toBe(180); // 15 years
      expect(toNumber(LONG_TERM)).toBe(300); // 25 years
      expect(toNumber(MAXIMUM_STANDARD_TERM)).toBe(360); // 30 years
    });

    it("should ensure all constants are within valid range", () => {
      const constants = [
        SHORT_TERM,
        MEDIUM_TERM,
        LONG_TERM,
        MAXIMUM_STANDARD_TERM,
      ];

      constants.forEach((term) => {
        const value = toNumber(term);
        expect(isValidTermRange(value)).toBe(true);
      });
    });

    it("should have constants in logical order", () => {
      expect(toNumber(SHORT_TERM)).toBeLessThan(toNumber(MEDIUM_TERM));
      expect(toNumber(MEDIUM_TERM)).toBeLessThan(toNumber(LONG_TERM));
      expect(toNumber(LONG_TERM)).toBeLessThan(toNumber(MAXIMUM_STANDARD_TERM));
    });

    it("should convert constants to years correctly", () => {
      expect(toYears(SHORT_TERM)).toBe(5);
      expect(toYears(MEDIUM_TERM)).toBe(15);
      expect(toYears(LONG_TERM)).toBe(25);
      expect(toYears(MAXIMUM_STANDARD_TERM)).toBe(30);
    });
  });
});

// Property-based tests
describe("MonthCount Property-Based Tests", () => {
  describe("Valid term range", () => {
    it("should accept all terms in valid range", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 480 }), (months) => {
          const result = createMonthCount(months);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(toNumber(result.data)).toBe(months);
          }
        }),
      );
    });

    it("should reject all terms above maximum", () => {
      fc.assert(
        fc.property(fc.integer({ min: 481, max: 1000 }), (aboveMaxMonths) => {
          const result = createMonthCount(aboveMaxMonths);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("AboveMaximumTerm");
          }
        }),
      );
    });
  });

  describe("Years conversion properties", () => {
    it("should maintain relationship: months = years * 12 (for whole years)", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 40 }), (years) => {
          const monthsResult = fromYears(years);

          if (monthsResult.success) {
            expect(toNumber(monthsResult.data)).toBe(years * 12);
            expect(toYears(monthsResult.data)).toBe(years);
          }
        }),
      );
    });

    it("should round-trip consistently for whole months", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 480 }), (originalMonths) => {
          const monthsResult = createMonthCount(originalMonths);

          if (monthsResult.success) {
            const years = toYears(monthsResult.data);
            const backToMonthsResult = fromYears(years);

            if (backToMonthsResult.success) {
              expect(toNumber(backToMonthsResult.data)).toBe(originalMonths);
            }
          }
        }),
      );
    });
  });

  describe("Arithmetic properties", () => {
    it("should be commutative for addition: a + b = b + a", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          fc.integer({ min: 1, max: 200 }),
          (a, b) => {
            const termA = createMonthCount(a);
            const termB = createMonthCount(b);

            if (termA.success && termB.success) {
              const resultAB = addMonths(termA.data, toNumber(termB.data));
              const resultBA = addMonths(termB.data, toNumber(termA.data));

              if (resultAB.success && resultBA.success) {
                expect(toNumber(resultAB.data)).toBe(toNumber(resultBA.data));
              }
            }
          },
        ),
      );
    });

    it("should be inverse operations: (a + b) - b = a", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 200 }),
          fc.integer({ min: 1, max: 200 }),
          (a, b) => {
            const termA = createMonthCount(a);

            if (termA.success) {
              const addResult = addMonths(termA.data, b);

              if (addResult.success) {
                const subtractResult = subtractMonths(addResult.data, b);

                if (subtractResult.success) {
                  expect(toNumber(subtractResult.data)).toBe(a);
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
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 101, max: 200 }),
          fc.integer({ min: 201, max: 300 }),
          (a, b, c) => {
            const termA = createMonthCount(a);
            const termB = createMonthCount(b);
            const termC = createMonthCount(c);

            if (termA.success && termB.success && termC.success) {
              expect(compareMonthCount(termA.data, termB.data)).toBeLessThan(0);
              expect(compareMonthCount(termB.data, termC.data)).toBeLessThan(0);
              expect(compareMonthCount(termA.data, termC.data)).toBeLessThan(0);
            }
          },
        ),
      );
    });

    it("should be reflexive: a = a", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 480 }), (months) => {
          const term = createMonthCount(months);

          if (term.success) {
            expect(compareMonthCount(term.data, term.data)).toBe(0);
            expect(isEqualMonthCount(term.data, term.data)).toBe(true);
          }
        }),
      );
    });
  });

  describe("Formatting properties", () => {
    it("should always produce valid German text", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 480 }), (months) => {
          const termResult = createMonthCount(months);

          if (termResult.success) {
            const formatted = formatMonthCount(termResult.data);

            // Should contain German words and be a string
            expect(typeof formatted).toBe("string");
            expect(formatted.length).toBeGreaterThan(0);

            // Should contain either "Monat", "Monate", "Jahr", or "Jahre"
            const hasGermanTerms = /\b(Monat|Monate|Jahr|Jahre)\b/.test(
              formatted,
            );
            expect(hasGermanTerms).toBe(true);
          }
        }),
      );
    });
  });
});
