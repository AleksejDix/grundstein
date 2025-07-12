import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createPositiveDecimal,
  toNumber,
  addPositiveDecimal,
  subtractPositiveDecimal,
  multiplyPositiveDecimal,
  dividePositiveDecimal,
  multiplyByFactor,
  comparePositiveDecimal,
  isEqualPositiveDecimal,
  formatPositiveDecimal,
  roundPositiveDecimal,
  ONE_DECIMAL,
  HALF,
} from "../PositiveDecimal";

describe("PositiveDecimal Type", () => {
  describe("createPositiveDecimal", () => {
    it("should create valid PositiveDecimal for positive numbers", () => {
      const result = createPositiveDecimal(3.14159);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(3.14159);
      }
    });

    it("should create PositiveDecimal for integers", () => {
      const result = createPositiveDecimal(42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(42);
      }
    });

    it("should create PositiveDecimal for very small positive numbers", () => {
      const result = createPositiveDecimal(0.001);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(0.001);
      }
    });

    it("should reject zero", () => {
      const result = createPositiveDecimal(0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NotPositive");
      }
    });

    it("should reject negative numbers", () => {
      const result = createPositiveDecimal(-3.14);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NotPositive");
      }
    });

    it("should reject invalid values", () => {
      const invalidInputs = [NaN, Infinity, -Infinity];

      invalidInputs.forEach((input) => {
        const result = createPositiveDecimal(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InvalidValue");
        }
      });
    });
  });

  describe("addPositiveDecimal", () => {
    it("should add positive decimals correctly", () => {
      const a = createPositiveDecimal(1.5);
      const b = createPositiveDecimal(2.3);

      if (a.success && b.success) {
        const result = addPositiveDecimal(a.data, b.data);
        expect(toNumber(result)).toBeCloseTo(3.8);
      }
    });

    it("should handle adding half", () => {
      const num = createPositiveDecimal(1.5);

      if (num.success) {
        const result = addPositiveDecimal(num.data, HALF);
        expect(toNumber(result)).toBeCloseTo(2.0);
      }
    });
  });

  describe("subtractPositiveDecimal", () => {
    it("should subtract positive decimals correctly", () => {
      const a = createPositiveDecimal(5.7);
      const b = createPositiveDecimal(2.3);

      if (a.success && b.success) {
        const result = subtractPositiveDecimal(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBeCloseTo(3.4);
        }
      }
    });

    it("should handle subtracting to very small positive result", () => {
      const a = createPositiveDecimal(1.001);
      const b = createPositiveDecimal(1.0);

      if (a.success && b.success) {
        const result = subtractPositiveDecimal(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBeCloseTo(0.001);
        }
      }
    });

    it("should reject subtraction that would result in zero", () => {
      const a = createPositiveDecimal(5.0);
      const b = createPositiveDecimal(5.0);

      if (a.success && b.success) {
        const result = subtractPositiveDecimal(a.data, b.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NotPositive");
        }
      }
    });

    it("should reject subtraction where b > a", () => {
      const a = createPositiveDecimal(3.2);
      const b = createPositiveDecimal(7.8);

      if (a.success && b.success) {
        const result = subtractPositiveDecimal(a.data, b.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NotPositive");
        }
      }
    });
  });

  describe("multiplyPositiveDecimal", () => {
    it("should multiply positive decimals correctly", () => {
      const a = createPositiveDecimal(2.5);
      const b = createPositiveDecimal(4.0);

      if (a.success && b.success) {
        const result = multiplyPositiveDecimal(a.data, b.data);
        expect(toNumber(result)).toBeCloseTo(10.0);
      }
    });

    it("should handle multiplication by one", () => {
      const num = createPositiveDecimal(3.14159);

      if (num.success) {
        const result = multiplyPositiveDecimal(num.data, ONE_DECIMAL);
        expect(toNumber(result)).toBeCloseTo(3.14159);
      }
    });

    it("should handle multiplication by half", () => {
      const num = createPositiveDecimal(10.0);

      if (num.success) {
        const result = multiplyPositiveDecimal(num.data, HALF);
        expect(toNumber(result)).toBeCloseTo(5.0);
      }
    });
  });

  describe("dividePositiveDecimal", () => {
    it("should divide positive decimals correctly", () => {
      const a = createPositiveDecimal(10.0);
      const b = createPositiveDecimal(2.5);

      if (a.success && b.success) {
        const result = dividePositiveDecimal(a.data, b.data);
        expect(toNumber(result)).toBeCloseTo(4.0);
      }
    });

    it("should handle division by one", () => {
      const num = createPositiveDecimal(42.0);

      if (num.success) {
        const result = dividePositiveDecimal(num.data, ONE_DECIMAL);
        expect(toNumber(result)).toBeCloseTo(42.0);
      }
    });

    it("should handle division resulting in decimal", () => {
      const a = createPositiveDecimal(1.0);
      const b = createPositiveDecimal(3.0);

      if (a.success && b.success) {
        const result = dividePositiveDecimal(a.data, b.data);
        expect(toNumber(result)).toBeCloseTo(0.3333333333333333);
      }
    });
  });

  describe("multiplyByFactor", () => {
    it("should multiply by positive factor correctly", () => {
      const decimal = createPositiveDecimal(5.0);

      if (decimal.success) {
        const result = multiplyByFactor(decimal.data, 2.5);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBeCloseTo(12.5);
        }
      }
    });

    it("should reject invalid factors", () => {
      const decimal = createPositiveDecimal(5.0);
      const invalidFactors = [0, -1, NaN, Infinity, -Infinity];

      if (decimal.success) {
        invalidFactors.forEach((factor) => {
          const result = multiplyByFactor(decimal.data, factor);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("InvalidValue");
          }
        });
      }
    });
  });

  describe("comparePositiveDecimal and isEqualPositiveDecimal", () => {
    it("should compare positive decimals correctly", () => {
      const a = createPositiveDecimal(5.5);
      const b = createPositiveDecimal(3.3);
      const c = createPositiveDecimal(5.5);

      if (a.success && b.success && c.success) {
        expect(comparePositiveDecimal(a.data, b.data)).toBeGreaterThan(0);
        expect(comparePositiveDecimal(b.data, a.data)).toBeLessThan(0);
        expect(comparePositiveDecimal(a.data, c.data)).toBeCloseTo(0);

        expect(isEqualPositiveDecimal(a.data, c.data)).toBe(true);
        expect(isEqualPositiveDecimal(a.data, b.data)).toBe(false);
      }
    });

    it("should handle floating point precision in equality", () => {
      const a = createPositiveDecimal(0.1 + 0.2);
      const b = createPositiveDecimal(0.3);

      if (a.success && b.success) {
        expect(isEqualPositiveDecimal(a.data, b.data)).toBe(true);
      }
    });
  });

  describe("formatPositiveDecimal", () => {
    it("should format positive decimal in German locale", () => {
      const decimal = createPositiveDecimal(1234.56);

      if (decimal.success) {
        const formatted = formatPositiveDecimal(decimal.data);
        expect(formatted).toBe("1.234,56");
      }
    });

    it("should format with custom decimal places", () => {
      const decimal = createPositiveDecimal(3.14159);

      if (decimal.success) {
        const formatted = formatPositiveDecimal(decimal.data, 4);
        expect(formatted).toBe("3,1416");
      }
    });
  });

  describe("roundPositiveDecimal", () => {
    it("should round to specified decimal places", () => {
      const decimal = createPositiveDecimal(3.14159);

      if (decimal.success) {
        const rounded = roundPositiveDecimal(decimal.data, 2);
        expect(toNumber(rounded)).toBe(3.14);
      }
    });

    it("should round up correctly", () => {
      const decimal = createPositiveDecimal(2.987);

      if (decimal.success) {
        const rounded = roundPositiveDecimal(decimal.data, 1);
        expect(toNumber(rounded)).toBe(3.0);
      }
    });
  });

  describe("Constants", () => {
    it("should have valid positive decimal constants", () => {
      expect(toNumber(ONE_DECIMAL)).toBe(1.0);
      expect(toNumber(HALF)).toBe(0.5);
    });
  });
});

// Property-based tests
describe("PositiveDecimal Property-Based Tests", () => {
  describe("PositiveDecimal creation properties", () => {
    it("should always create valid PositiveDecimal for valid inputs", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.001),
            max: Math.fround(10000),
            noNaN: true,
          }),
          (value) => {
            const result = createPositiveDecimal(value);
            if (result.success) {
              expect(toNumber(result.data)).toBeCloseTo(value, 10);
            }
          },
        ),
      );
    });

    it("should reject all non-positive numbers", () => {
      fc.assert(
        fc.property(fc.float({ max: 0, noNaN: true }), (nonPositiveValue) => {
          const result = createPositiveDecimal(nonPositiveValue);
          expect(result.success).toBe(false);
          if (!result.success) {
            // Handle special case of -Infinity which returns InvalidValue
            if (nonPositiveValue === Number.NEGATIVE_INFINITY) {
              expect(result.error).toBe("InvalidValue");
            } else {
              expect(result.error).toBe("NotPositive");
            }
          }
        }),
      );
    });
  });

  describe("Addition properties", () => {
    it("should be commutative: a + b = b + a", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(1000),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(1000),
            noNaN: true,
          }),
          (a, b) => {
            const decimalA = createPositiveDecimal(a);
            const decimalB = createPositiveDecimal(b);

            if (decimalA.success && decimalB.success) {
              const sum1 = addPositiveDecimal(decimalA.data, decimalB.data);
              const sum2 = addPositiveDecimal(decimalB.data, decimalA.data);

              expect(isEqualPositiveDecimal(sum1, sum2)).toBe(true);
            }
          },
        ),
      );
    });

    it("should be associative: (a + b) + c = a + (b + c)", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          (a, b, c) => {
            const decimalA = createPositiveDecimal(a);
            const decimalB = createPositiveDecimal(b);
            const decimalC = createPositiveDecimal(c);

            if (decimalA.success && decimalB.success && decimalC.success) {
              const sum1 = addPositiveDecimal(decimalA.data, decimalB.data);
              const sum2 = addPositiveDecimal(decimalB.data, decimalC.data);

              const leftAssoc = addPositiveDecimal(sum1, decimalC.data);
              const rightAssoc = addPositiveDecimal(decimalA.data, sum2);

              expect(isEqualPositiveDecimal(leftAssoc, rightAssoc)).toBe(true);
            }
          },
        ),
      );
    });
  });

  describe("Multiplication properties", () => {
    it("should be commutative: a * b = b * a", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          (a, b) => {
            const decimalA = createPositiveDecimal(a);
            const decimalB = createPositiveDecimal(b);

            if (decimalA.success && decimalB.success) {
              const product1 = multiplyPositiveDecimal(
                decimalA.data,
                decimalB.data,
              );
              const product2 = multiplyPositiveDecimal(
                decimalB.data,
                decimalA.data,
              );

              expect(isEqualPositiveDecimal(product1, product2)).toBe(true);
            }
          },
        ),
      );
    });

    it("should have 1 as identity: a * 1 = a", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(1000),
            noNaN: true,
          }),
          (a) => {
            const decimal = createPositiveDecimal(a);

            if (decimal.success) {
              const product = multiplyPositiveDecimal(
                decimal.data,
                ONE_DECIMAL,
              );

              expect(isEqualPositiveDecimal(decimal.data, product)).toBe(true);
            }
          },
        ),
      );
    });
  });

  describe("Division properties", () => {
    it("should be inverse of multiplication: (a * b) / b = a", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(100),
            noNaN: true,
          }),
          (a, b) => {
            const decimalA = createPositiveDecimal(a);
            const decimalB = createPositiveDecimal(b);

            if (decimalA.success && decimalB.success) {
              const product = multiplyPositiveDecimal(
                decimalA.data,
                decimalB.data,
              );
              const quotient = dividePositiveDecimal(product, decimalB.data);

              expect(
                isEqualPositiveDecimal(decimalA.data, quotient, 1e-8),
              ).toBe(true);
            }
          },
        ),
      );
    });

    it("should have 1 as identity: a / 1 = a", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(0.1),
            max: Math.fround(1000),
            noNaN: true,
          }),
          (a) => {
            const decimal = createPositiveDecimal(a);

            if (decimal.success) {
              const quotient = dividePositiveDecimal(decimal.data, ONE_DECIMAL);

              expect(isEqualPositiveDecimal(decimal.data, quotient)).toBe(true);
            }
          },
        ),
      );
    });
  });
});
