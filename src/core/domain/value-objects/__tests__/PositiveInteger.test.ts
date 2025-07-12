import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  type PositiveInteger,
  createPositiveInteger,
  toNumber,
  addPositiveInteger,
  subtractPositiveInteger,
  multiplyPositiveInteger,
  dividePositiveInteger,
  comparePositiveInteger,
  isEqualPositiveInteger,
  formatPositiveInteger,
  ONE,
  TWELVE,
  type PositiveIntegerValidationError,
} from "../PositiveInteger";

describe("PositiveInteger Type", () => {
  describe("createPositiveInteger", () => {
    it("should create valid PositiveInteger for positive integers", () => {
      const result = createPositiveInteger(42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(42);
      }
    });

    it("should create PositiveInteger for 1", () => {
      const result = createPositiveInteger(1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(1);
      }
    });

    it("should reject zero", () => {
      const result = createPositiveInteger(0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NotPositive");
      }
    });

    it("should reject negative integers", () => {
      const result = createPositiveInteger(-5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NotPositive");
      }
    });

    it("should reject decimal numbers", () => {
      const result = createPositiveInteger(3.14);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NotInteger");
      }
    });

    it("should reject invalid values", () => {
      const invalidInputs = [NaN, Infinity, -Infinity];

      invalidInputs.forEach((input) => {
        const result = createPositiveInteger(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InvalidValue");
        }
      });
    });
  });

  describe("addPositiveInteger", () => {
    it("should add positive integers correctly", () => {
      const a = createPositiveInteger(10);
      const b = createPositiveInteger(5);

      if (a.success && b.success) {
        const result = addPositiveInteger(a.data, b.data);
        expect(toNumber(result)).toBe(15);
      }
    });

    it("should handle adding one", () => {
      const num = createPositiveInteger(42);

      if (num.success) {
        const result = addPositiveInteger(num.data, ONE);
        expect(toNumber(result)).toBe(43);
      }
    });
  });

  describe("subtractPositiveInteger", () => {
    it("should subtract positive integers correctly", () => {
      const a = createPositiveInteger(10);
      const b = createPositiveInteger(3);

      if (a.success && b.success) {
        const result = subtractPositiveInteger(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(7);
        }
      }
    });

    it("should handle subtracting to 1", () => {
      const a = createPositiveInteger(5);
      const b = createPositiveInteger(4);

      if (a.success && b.success) {
        const result = subtractPositiveInteger(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(1);
        }
      }
    });

    it("should reject subtraction that would result in zero or negative", () => {
      const a = createPositiveInteger(5);
      const b = createPositiveInteger(5);

      if (a.success && b.success) {
        const result = subtractPositiveInteger(a.data, b.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NotPositive");
        }
      }
    });

    it("should reject subtraction where b > a", () => {
      const a = createPositiveInteger(3);
      const b = createPositiveInteger(7);

      if (a.success && b.success) {
        const result = subtractPositiveInteger(a.data, b.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NotPositive");
        }
      }
    });
  });

  describe("multiplyPositiveInteger", () => {
    it("should multiply positive integers correctly", () => {
      const a = createPositiveInteger(6);
      const b = createPositiveInteger(7);

      if (a.success && b.success) {
        const result = multiplyPositiveInteger(a.data, b.data);
        expect(toNumber(result)).toBe(42);
      }
    });

    it("should handle multiplication by one", () => {
      const num = createPositiveInteger(42);

      if (num.success) {
        const result = multiplyPositiveInteger(num.data, ONE);
        expect(toNumber(result)).toBe(42);
      }
    });
  });

  describe("dividePositiveInteger", () => {
    it("should divide positive integers correctly", () => {
      const a = createPositiveInteger(20);
      const b = createPositiveInteger(4);

      if (a.success && b.success) {
        const result = dividePositiveInteger(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(5);
        }
      }
    });

    it("should handle integer division with floor", () => {
      const a = createPositiveInteger(7);
      const b = createPositiveInteger(3);

      if (a.success && b.success) {
        const result = dividePositiveInteger(a.data, b.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(2); // Math.floor(7/3) = 2
        }
      }
    });

    it("should reject division that results in zero", () => {
      const a = createPositiveInteger(1);
      const b = createPositiveInteger(2);

      if (a.success && b.success) {
        const result = dividePositiveInteger(a.data, b.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NotPositive");
        }
      }
    });
  });

  describe("comparePositiveInteger and isEqualPositiveInteger", () => {
    it("should compare positive integers correctly", () => {
      const a = createPositiveInteger(10);
      const b = createPositiveInteger(5);
      const c = createPositiveInteger(10);

      if (a.success && b.success && c.success) {
        expect(comparePositiveInteger(a.data, b.data)).toBeGreaterThan(0);
        expect(comparePositiveInteger(b.data, a.data)).toBeLessThan(0);
        expect(comparePositiveInteger(a.data, c.data)).toBe(0);

        expect(isEqualPositiveInteger(a.data, c.data)).toBe(true);
        expect(isEqualPositiveInteger(a.data, b.data)).toBe(false);
      }
    });
  });

  describe("formatPositiveInteger", () => {
    it("should format positive integer in German locale", () => {
      const num = createPositiveInteger(1234);

      if (num.success) {
        const formatted = formatPositiveInteger(num.data);
        expect(formatted).toBe("1.234");
      }
    });

    it("should format small numbers correctly", () => {
      const num = createPositiveInteger(42);

      if (num.success) {
        const formatted = formatPositiveInteger(num.data);
        expect(formatted).toBe("42");
      }
    });
  });

  describe("Constants", () => {
    it("should have valid positive integer constants", () => {
      expect(toNumber(ONE)).toBe(1);
      expect(toNumber(TWELVE)).toBe(12);
    });
  });
});

// Property-based tests
describe("PositiveInteger Property-Based Tests", () => {
  describe("PositiveInteger creation properties", () => {
    it("should always create valid PositiveInteger for valid inputs", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000000 }), (value) => {
          const result = createPositiveInteger(value);
          if (result.success) {
            expect(toNumber(result.data)).toBe(value);
          }
        })
      );
    });

    it("should reject all non-positive integers", () => {
      fc.assert(
        fc.property(fc.integer({ max: 0 }), (nonPositiveValue) => {
          const result = createPositiveInteger(nonPositiveValue);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("NotPositive");
          }
        })
      );
    });

    it("should reject all non-integers", () => {
      fc.assert(
        fc.property(
          fc
            .float({
              min: Math.fround(0.1),
              max: Math.fround(1000),
              noNaN: true,
            })
            .filter((n) => !Number.isInteger(n)),
          (nonInteger) => {
            const result = createPositiveInteger(nonInteger);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("NotInteger");
            }
          }
        )
      );
    });
  });

  describe("Addition properties", () => {
    it("should be commutative: a + b = b + a", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (a, b) => {
            const intA = createPositiveInteger(a);
            const intB = createPositiveInteger(b);

            if (intA.success && intB.success) {
              const sum1 = addPositiveInteger(intA.data, intB.data);
              const sum2 = addPositiveInteger(intB.data, intA.data);

              expect(isEqualPositiveInteger(sum1, sum2)).toBe(true);
            }
          }
        )
      );
    });

    it("should be associative: (a + b) + c = a + (b + c)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (a, b, c) => {
            const intA = createPositiveInteger(a);
            const intB = createPositiveInteger(b);
            const intC = createPositiveInteger(c);

            if (intA.success && intB.success && intC.success) {
              const sum1 = addPositiveInteger(intA.data, intB.data);
              const sum2 = addPositiveInteger(intB.data, intC.data);

              const leftAssoc = addPositiveInteger(sum1, intC.data);
              const rightAssoc = addPositiveInteger(intA.data, sum2);

              expect(isEqualPositiveInteger(leftAssoc, rightAssoc)).toBe(true);
            }
          }
        )
      );
    });

    it("should have 1 as identity: a + 0 = a (but since we need positive, a + 1 > a)", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (a) => {
          const intA = createPositiveInteger(a);

          if (intA.success) {
            const sum = addPositiveInteger(intA.data, ONE);

            expect(toNumber(sum)).toBe(a + 1);
          }
        })
      );
    });
  });

  describe("Multiplication properties", () => {
    it("should be commutative: a * b = b * a", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          (a, b) => {
            const intA = createPositiveInteger(a);
            const intB = createPositiveInteger(b);

            if (intA.success && intB.success) {
              const product1 = multiplyPositiveInteger(intA.data, intB.data);
              const product2 = multiplyPositiveInteger(intB.data, intA.data);

              expect(isEqualPositiveInteger(product1, product2)).toBe(true);
            }
          }
        )
      );
    });

    it("should have 1 as identity: a * 1 = a", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (a) => {
          const intA = createPositiveInteger(a);

          if (intA.success) {
            const product = multiplyPositiveInteger(intA.data, ONE);

            expect(isEqualPositiveInteger(intA.data, product)).toBe(true);
          }
        })
      );
    });
  });

  describe("Subtraction properties", () => {
    it("should be inverse of addition when result is positive: (a + b) - b = a", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          (a, b) => {
            const intA = createPositiveInteger(a);
            const intB = createPositiveInteger(b);

            if (intA.success && intB.success) {
              const sum = addPositiveInteger(intA.data, intB.data);
              const diff = subtractPositiveInteger(sum, intB.data);

              if (diff.success) {
                expect(isEqualPositiveInteger(intA.data, diff.data)).toBe(true);
              }
            }
          }
        )
      );
    });
  });
});
