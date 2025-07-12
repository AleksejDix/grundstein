import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  createEUR,
  createCHF,
  createUSD,
  toDisplayAmount,
  formatEUR,
  formatCHF,
  formatUSD,
  isEUR,
  isCHF,
  addEUR,
  subtractEUR,
  addCHF,
  subtractCHF,
  convertEURtoCHF,
  convertCHFtoEUR,
  type ExchangeRate,
} from "../Currency";

describe("Currency Types", () => {
  describe("EUR Creation", () => {
    it("should create valid EUR amounts", () => {
      const result = createEUR(100.5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toDisplayAmount(result.data)).toBe(100.5);
      }
    });

    it("should reject negative amounts", () => {
      const result = createEUR(-50);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NegativeAmount");
      }
    });

    it("should reject invalid amounts", () => {
      const result = createEUR(NaN);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidAmount");
      }
    });

    it("should reject amounts with too many decimal places", () => {
      const result = createEUR(100.999);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("TooManyDecimals");
      }
    });

    it("should handle maximum amounts", () => {
      // MAX_AMOUNT_CENTS = 999_999_999_00 = 999,999,999.00 euros
      const result = createEUR(999999999.0);
      expect(result.success).toBe(true);
    });

    it("should reject amounts exceeding maximum", () => {
      // First verify max value succeeds
      const atMax = createEUR(999999999.0);
      expect(atMax.success).toBe(true);

      // The maximum is 999_999_999_00 cents = 999,999,999.00 euros (almost 1 billion)
      // So 1,000,000,000.00 should fail
      const exceedsMax = createEUR(1000000000.0);
      expect(exceedsMax.success).toBe(false);
      if (!exceedsMax.success) {
        expect(exceedsMax.error).toBe("ExceedsMaximum");
      }
    });
  });

  describe("CHF Creation", () => {
    it("should create valid CHF amounts", () => {
      const result = createCHF(250.75);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toDisplayAmount(result.data)).toBe(250.75);
      }
    });

    it("should handle Swiss rounding (0.05 precision)", () => {
      const result = createCHF(100.05);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toDisplayAmount(result.data)).toBe(100.05);
      }
    });
  });

  describe("USD Creation", () => {
    it("should create valid USD amounts", () => {
      const result = createUSD(1000.0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toDisplayAmount(result.data)).toBe(1000.0);
      }
    });
  });

  describe("Formatting", () => {
    it("should format EUR correctly", () => {
      const eurResult = createEUR(1234.56);
      expect(eurResult.success).toBe(true);
      if (eurResult.success) {
        const formatted = formatEUR(eurResult.data);
        expect(formatted).toMatch(/1\.234,56/); // German format
        expect(formatted).toContain("€");
      }
    });

    it("should format CHF correctly", () => {
      const chfResult = createCHF(2345.67);
      expect(chfResult.success).toBe(true);
      if (chfResult.success) {
        const formatted = formatCHF(chfResult.data);
        expect(formatted).toContain("CHF");
        expect(formatted).toMatch(/2.345[,.]67/); // Swiss format may vary
      }
    });

    it("should format USD correctly", () => {
      const usdResult = createUSD(3456.78);
      expect(usdResult.success).toBe(true);
      if (usdResult.success) {
        const formatted = formatUSD(usdResult.data);
        expect(formatted).toContain("$");
        expect(formatted).toMatch(/3,456\.78/); // US format
      }
    });
  });

  describe("Type Guards", () => {
    it("should identify EUR currency", () => {
      const eurResult = createEUR(100);
      expect(eurResult.success).toBe(true);
      if (eurResult.success) {
        expect(isEUR(eurResult.data)).toBe(true);
      }
    });

    it("should identify CHF currency", () => {
      const chfResult = createCHF(100);
      expect(chfResult.success).toBe(true);
      if (chfResult.success) {
        expect(isCHF(chfResult.data)).toBe(true);
      }
    });
  });

  describe("EUR Arithmetic", () => {
    it("should add EUR amounts", () => {
      const eur1 = createEUR(100.5);
      const eur2 = createEUR(50.25);

      expect(eur1.success && eur2.success).toBe(true);
      if (eur1.success && eur2.success) {
        const sum = addEUR(eur1.data, eur2.data);
        expect(toDisplayAmount(sum)).toBe(150.75);
      }
    });

    it("should subtract EUR amounts", () => {
      const eur1 = createEUR(100.5);
      const eur2 = createEUR(30.25);

      expect(eur1.success && eur2.success).toBe(true);
      if (eur1.success && eur2.success) {
        const result = subtractEUR(eur1.data, eur2.data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(toDisplayAmount(result.data)).toBe(70.25);
        }
      }
    });

    it("should reject subtraction resulting in negative", () => {
      const eur1 = createEUR(50);
      const eur2 = createEUR(100);

      expect(eur1.success && eur2.success).toBe(true);
      if (eur1.success && eur2.success) {
        const result = subtractEUR(eur1.data, eur2.data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NegativeAmount");
        }
      }
    });
  });

  describe("CHF Arithmetic", () => {
    it("should add CHF amounts", () => {
      const chf1 = createCHF(200.0);
      const chf2 = createCHF(150.5);

      expect(chf1.success && chf2.success).toBe(true);
      if (chf1.success && chf2.success) {
        const sum = addCHF(chf1.data, chf2.data);
        expect(toDisplayAmount(sum)).toBe(350.5);
      }
    });

    it("should subtract CHF amounts", () => {
      const chf1 = createCHF(300.0);
      const chf2 = createCHF(125.75);

      expect(chf1.success && chf2.success).toBe(true);
      if (chf1.success && chf2.success) {
        const result = subtractCHF(chf1.data, chf2.data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(toDisplayAmount(result.data)).toBe(174.25);
        }
      }
    });
  });

  describe("Currency Conversion", () => {
    it("should convert EUR to CHF", () => {
      const eurResult = createEUR(100);
      const rate = 1.05 as ExchangeRate; // 1 EUR = 1.05 CHF

      expect(eurResult.success).toBe(true);
      if (eurResult.success) {
        const chf = convertEURtoCHF(eurResult.data, rate);
        expect(toDisplayAmount(chf)).toBe(105);
      }
    });

    it("should convert CHF to EUR", () => {
      const chfResult = createCHF(105);
      const rate = 1.05 as ExchangeRate; // 1 EUR = 1.05 CHF

      expect(chfResult.success).toBe(true);
      if (chfResult.success) {
        const eur = convertCHFtoEUR(chfResult.data, rate);
        expect(toDisplayAmount(eur)).toBe(100);
      }
    });

    it("should handle conversion with decimal rates", () => {
      const eurResult = createEUR(100);
      const rate = 1.0765 as ExchangeRate;

      expect(eurResult.success).toBe(true);
      if (eurResult.success) {
        const chf = convertEURtoCHF(eurResult.data, rate);
        expect(toDisplayAmount(chf)).toBeCloseTo(107.65, 2);
      }
    });
  });

  describe("Property-based tests", () => {
    it("should always create valid currency for valid amounts", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(999999999), maxExcluded: true }),
          (amount) => {
            // Skip invalid values
            if (!Number.isFinite(amount) || amount < 0) {
              return;
            }

            // Round to 2 decimal places
            const rounded = Math.round(amount * 100) / 100;
            const result = createEUR(rounded);
            expect(result.success).toBe(true);
          },
        ),
      );
    });

    it("should maintain value through conversions", () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
          fc.float({ min: Math.fround(0.5), max: Math.fround(2.0) }),
          (amount, rateValue) => {
            // Skip if rate is invalid
            if (!Number.isFinite(rateValue) || rateValue <= 0) {
              return;
            }

            const rounded = Math.round(amount * 100) / 100;
            const rate = rateValue as ExchangeRate;

            const eurResult = createEUR(rounded);
            if (eurResult.success) {
              const chf = convertEURtoCHF(eurResult.data, rate);
              const backToEur = convertCHFtoEUR(chf, rate);

              // Should be close to original (may have small rounding differences)
              expect(toDisplayAmount(backToEur)).toBeCloseTo(rounded, 1);
            }
          },
        ),
      );
    });

    it("addition should be commutative", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(5000) }),
          fc.float({ min: 0, max: Math.fround(5000) }),
          (a, b) => {
            const roundedA = Math.round(a * 100) / 100;
            const roundedB = Math.round(b * 100) / 100;

            const eurA = createEUR(roundedA);
            const eurB = createEUR(roundedB);

            if (eurA.success && eurB.success) {
              const sum1 = addEUR(eurA.data, eurB.data);
              const sum2 = addEUR(eurB.data, eurA.data);

              expect(toDisplayAmount(sum1)).toBe(toDisplayAmount(sum2));
            }
          },
        ),
      );
    });
  });
});
