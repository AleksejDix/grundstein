import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createLoanAmount,
  toMoney,
  toNumber,
  formatLoanAmount,
  getMinimumLoanAmount,
  getMaximumLoanAmount,
} from "../LoanAmount";

describe("LoanAmount Type", () => {
  describe("createLoanAmount", () => {
    it("should create valid LoanAmount for amounts within business range", () => {
      const testCases = [
        1000, // Minimum
        50000, // Typical small loan
        200000, // Typical starter home
        500000, // Typical family home
        1000000, // Luxury threshold
        10000000, // Maximum
      ];

      testCases.forEach((amount) => {
        const result = createLoanAmount(amount);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(amount);
        }
      });
    });

    it("should reject amounts below minimum loan amount", () => {
      const belowMinimumCases = [999, 500, 1, 0.01];

      belowMinimumCases.forEach((amount) => {
        const result = createLoanAmount(amount);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("BelowMinimum");
        }
      });
    });

    it("should reject amounts above maximum loan amount", () => {
      const aboveMaximumCases = [10000001, 50000000, 100000000];

      aboveMaximumCases.forEach((amount) => {
        const result = createLoanAmount(amount);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximum");
        }
      });
    });

    it("should reject negative amounts (Money validation)", () => {
      const result = createLoanAmount(-10000);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("MoneyValidationError");
      }
    });

    it("should reject invalid amounts (Money validation)", () => {
      const invalidAmounts = [NaN, Infinity, -Infinity];

      invalidAmounts.forEach((amount) => {
        const result = createLoanAmount(amount);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("MoneyValidationError");
        }
      });
    });
  });

  describe("Type conversion functions", () => {
    it("should convert LoanAmount to Money correctly", () => {
      const amount = 250000;
      const loanAmountResult = createLoanAmount(amount);

      expect(loanAmountResult.success).toBe(true);
      if (loanAmountResult.success) {
        const money = toMoney(loanAmountResult.data);
        expect(typeof money).toBe("number"); // Underlying type is number
      }
    });

    it("should convert LoanAmount to number correctly", () => {
      const amount = 300000;
      const loanAmountResult = createLoanAmount(amount);

      expect(loanAmountResult.success).toBe(true);
      if (loanAmountResult.success) {
        const numberValue = toNumber(loanAmountResult.data);
        expect(numberValue).toBe(amount);
      }
    });
  });

  describe("Formatting", () => {
    it("should format LoanAmount using German currency format", () => {
      const loanAmount = createLoanAmount(250000);

      expect(loanAmount.success).toBe(true);
      if (loanAmount.success) {
        const formatted = formatLoanAmount(loanAmount.data);
        expect(formatted).toMatch(/250\.000,00\s*€/);
        expect(formatted).toContain("250.000,00");
        expect(formatted).toContain("€");
      }
    });

    it("should format large amounts correctly", () => {
      const loanAmount = createLoanAmount(1500000);

      expect(loanAmount.success).toBe(true);
      if (loanAmount.success) {
        const formatted = formatLoanAmount(loanAmount.data);
        expect(formatted).toMatch(/1\.500\.000,00\s*€/);
        expect(formatted).toContain("1.500.000,00");
        expect(formatted).toContain("€");
      }
    });
  });

  describe("Constants and limits", () => {
    it("should provide valid minimum loan amount", () => {
      const minLoan = getMinimumLoanAmount();
      const value = toNumber(minLoan);

      expect(value).toBe(1000);
    });

    it("should provide valid maximum loan amount", () => {
      const maxLoan = getMaximumLoanAmount();
      const value = toNumber(maxLoan);

      expect(value).toBe(10000000);
    });

    it("should ensure constants are within valid range", () => {
      const minLoan = getMinimumLoanAmount();
      const maxLoan = getMaximumLoanAmount();

      expect(toNumber(minLoan)).toBeLessThan(toNumber(maxLoan));
      expect(toNumber(minLoan)).toBeGreaterThan(0);
    });
  });

  describe("Business rule validation", () => {
    it("should enforce German mortgage market standards", () => {
      // Test typical German mortgage amounts
      const typicalAmounts = [
        150000, // Small apartment
        300000, // Average home
        600000, // Premium home
        1000000, // Luxury property
      ];

      typicalAmounts.forEach((amount) => {
        const result = createLoanAmount(amount);
        expect(result.success).toBe(true);
      });
    });

    it("should reject unrealistic micro-loans", () => {
      // Amounts too small for mortgage lending
      const microAmounts = [100, 500, 999];

      microAmounts.forEach((amount) => {
        const result = createLoanAmount(amount);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("BelowMinimum");
        }
      });
    });

    it("should reject ultra-high amounts beyond practical lending", () => {
      // Amounts beyond practical mortgage lending
      const ultraHighAmounts = [20000000, 50000000, 100000000];

      ultraHighAmounts.forEach((amount) => {
        const result = createLoanAmount(amount);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AboveMaximum");
        }
      });
    });
  });
});

// Property-based tests
describe("LoanAmount Property-Based Tests", () => {
  describe("Valid loan amount range", () => {
    it("should accept all amounts in valid range", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 10000000 }), (amount) => {
          const result = createLoanAmount(amount);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(toNumber(result.data)).toBe(amount);
          }
        }),
      );
    });

    it("should reject all amounts below minimum", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 999 }), (belowMinAmount) => {
          const result = createLoanAmount(belowMinAmount);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("BelowMinimum");
          }
        }),
      );
    });

    it("should reject all amounts above maximum", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10000001, max: 100000000 }),
          (aboveMaxAmount) => {
            const result = createLoanAmount(aboveMaxAmount);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("AboveMaximum");
            }
          },
        ),
      );
    });
  });

  describe("Type conversion properties", () => {
    it("should maintain value through conversion: LoanAmount -> number -> LoanAmount", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000000 }),
          (originalAmount) => {
            const loanAmountResult = createLoanAmount(originalAmount);

            if (loanAmountResult.success) {
              const extractedNumber = toNumber(loanAmountResult.data);
              const recreatedResult = createLoanAmount(extractedNumber);

              expect(recreatedResult.success).toBe(true);
              if (recreatedResult.success) {
                expect(toNumber(recreatedResult.data)).toBe(originalAmount);
              }
            }
          },
        ),
      );
    });

    it("should maintain value through Money conversion", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 10000000 }), (amount) => {
          const loanAmountResult = createLoanAmount(amount);

          if (loanAmountResult.success) {
            const _money = toMoney(loanAmountResult.data);
            const backToNumber = toNumber(loanAmountResult.data);

            expect(backToNumber).toBe(amount);
          }
        }),
      );
    });
  });

  describe("Formatting properties", () => {
    it("should always produce valid currency format string", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 10000000 }), (amount) => {
          const loanAmountResult = createLoanAmount(amount);

          if (loanAmountResult.success) {
            const formatted = formatLoanAmount(loanAmountResult.data);

            // Should contain Euro symbol and be a string
            expect(typeof formatted).toBe("string");
            expect(formatted).toMatch(/€/);
            expect(formatted.length).toBeGreaterThan(0);
          }
        }),
      );
    });
  });
});
