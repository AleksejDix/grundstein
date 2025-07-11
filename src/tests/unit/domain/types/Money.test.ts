import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  Money,
  createMoney,
  toEuros,
  addMoney,
  subtractMoney,
  multiplyMoney,
  compareMoney,
  isEqualMoney,
  formatMoney,
  ZERO_MONEY,
  type MoneyValidationError,
} from "../../../../domain/types/Money";

describe("Money Type", () => {
  describe("createMoney", () => {
    it("should create valid Money for positive amounts", () => {
      const result = createMoney(100.5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toEuros(result.data)).toBe(100.5);
        // Currency is implicitly EUR in this domain
      }
    });

    it("should create Money for zero amount", () => {
      const result = createMoney(0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toEuros(result.data)).toBe(0);
      }
    });

    it("should handle floating point precision correctly", () => {
      const result = createMoney(10.99);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toEuros(result.data)).toBe(10.99);
      }
    });

    it("should reject negative amounts", () => {
      const result = createMoney(-10);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NegativeAmount");
      }
    });

    it("should reject invalid amounts", () => {
      const invalidInputs = [NaN, Infinity, -Infinity];

      invalidInputs.forEach((input) => {
        const result = createMoney(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InvalidAmount");
        }
      });
    });

    it("should reject amounts exceeding maximum", () => {
      const result = createMoney(1_000_000_000); // Over max

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("ExceedsMaximum");
      }
    });
  });

  describe("toEuros", () => {
    it("should convert Money back to euros correctly", () => {
      const money = createMoney(123.45);

      if (money.success) {
        expect(toEuros(money.data)).toBe(123.45);
      }
    });

    it("should handle zero money", () => {
      expect(toEuros(ZERO_MONEY)).toBe(0);
    });
  });

  describe("addMoney", () => {
    it("should add two Money amounts correctly", () => {
      const money1 = createMoney(100);
      const money2 = createMoney(50.25);

      if (money1.success && money2.success) {
        const result = addMoney(money1.data, money2.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(150.25);
        }
      }
    });

    it("should handle adding zero", () => {
      const money = createMoney(100);

      if (money.success) {
        const result = addMoney(money.data, ZERO_MONEY);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(100);
        }
      }
    });

    it("should reject addition that exceeds maximum", () => {
      const largeAmount = createMoney(999_999_999);
      const smallAmount = createMoney(1);

      if (largeAmount.success && smallAmount.success) {
        const result = addMoney(largeAmount.data, smallAmount.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("ExceedsMaximum");
        }
      }
    });
  });

  describe("subtractMoney", () => {
    it("should subtract Money amounts correctly", () => {
      const money1 = createMoney(100);
      const money2 = createMoney(30.25);

      if (money1.success && money2.success) {
        const result = subtractMoney(money1.data, money2.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(69.75);
        }
      }
    });

    it("should handle subtracting to zero", () => {
      const money = createMoney(100);

      if (money.success) {
        const result = subtractMoney(money.data, money.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(0);
        }
      }
    });

    it("should reject subtraction that would result in negative", () => {
      const smaller = createMoney(50);
      const larger = createMoney(100);

      if (smaller.success && larger.success) {
        const result = subtractMoney(smaller.data, larger.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("NegativeAmount");
        }
      }
    });
  });

  describe("multiplyMoney", () => {
    it("should multiply Money by positive factor", () => {
      const money = createMoney(100);

      if (money.success) {
        const result = multiplyMoney(money.data, 1.5);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(150);
        }
      }
    });

    it("should handle multiplication by zero", () => {
      const money = createMoney(100);

      if (money.success) {
        const result = multiplyMoney(money.data, 0);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toEuros(result.data)).toBe(0);
        }
      }
    });

    it("should reject invalid factors", () => {
      const money = createMoney(100);
      const invalidFactors = [NaN, Infinity, -1, -Infinity];

      if (money.success) {
        invalidFactors.forEach((factor) => {
          const result = multiplyMoney(money.data, factor);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("InvalidAmount");
          }
        });
      }
    });
  });

  describe("compareMoney and isEqualMoney", () => {
    it("should compare Money amounts correctly", () => {
      const money1 = createMoney(100);
      const money2 = createMoney(50);
      const money3 = createMoney(100);

      if (money1.success && money2.success && money3.success) {
        expect(compareMoney(money1.data, money2.data)).toBeGreaterThan(0);
        expect(compareMoney(money2.data, money1.data)).toBeLessThan(0);
        expect(compareMoney(money1.data, money3.data)).toBe(0);

        expect(isEqualMoney(money1.data, money3.data)).toBe(true);
        expect(isEqualMoney(money1.data, money2.data)).toBe(false);
      }
    });
  });

  describe("formatMoney", () => {
    it("should format Money in German locale", () => {
      const money = createMoney(1234.56);

      if (money.success) {
        const formatted = formatMoney(money.data);
        expect(formatted).toMatch(/1\.234,56\s*€/);
      }
    });

    it("should format zero correctly", () => {
      const formatted = formatMoney(ZERO_MONEY);
      expect(formatted).toMatch(/0,00\s*€/);
    });
  });

  describe("ZERO_MONEY constant", () => {
    it("should be valid zero money", () => {
      expect(toEuros(ZERO_MONEY)).toBe(0);
      // Currency is implicitly EUR in this domain
    });
  });
});

// Property-based tests
describe("Money Property-Based Tests", () => {
  describe("Money creation properties", () => {
    it("should always create valid Money for valid inputs", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(100_000), noNaN: true }),
          (euros) => {
            const result = createMoney(euros);
            if (result.success) {
              // Money should round-trip correctly (within cent precision)
              const roundTrip = toEuros(result.data);
              expect(Math.abs(roundTrip - euros)).toBeLessThan(0.01);
              // Currency is implicitly EUR in this domain
            }
          }
        )
      );
    });

    it("should reject all negative amounts", () => {
      fc.assert(
        fc.property(
          fc.float({
            min: Math.fround(-1000),
            max: Math.fround(-0.01),
            noNaN: true,
          }),
          (negativeEuros) => {
            const result = createMoney(negativeEuros);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("NegativeAmount");
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
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a, b) => {
            const moneyA = createMoney(a);
            const moneyB = createMoney(b);

            if (moneyA.success && moneyB.success) {
              const sum1 = addMoney(moneyA.data, moneyB.data);
              const sum2 = addMoney(moneyB.data, moneyA.data);

              if (sum1.success && sum2.success) {
                expect(isEqualMoney(sum1.data, sum2.data)).toBe(true);
              }
            }
          }
        )
      );
    });

    it("should be associative: (a + b) + c = a + (b + c)", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(5_000), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(5_000), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(5_000), noNaN: true }),
          (a, b, c) => {
            const moneyA = createMoney(a);
            const moneyB = createMoney(b);
            const moneyC = createMoney(c);

            if (moneyA.success && moneyB.success && moneyC.success) {
              const sum1 = addMoney(moneyA.data, moneyB.data);
              const sum2 = addMoney(moneyB.data, moneyC.data);

              if (sum1.success && sum2.success) {
                const leftAssoc = addMoney(sum1.data, moneyC.data);
                const rightAssoc = addMoney(moneyA.data, sum2.data);

                if (leftAssoc.success && rightAssoc.success) {
                  expect(isEqualMoney(leftAssoc.data, rightAssoc.data)).toBe(
                    true
                  );
                }
              }
            }
          }
        )
      );
    });

    it("should have zero as identity: a + 0 = a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a) => {
            const money = createMoney(a);

            if (money.success) {
              const sum = addMoney(money.data, ZERO_MONEY);

              if (sum.success) {
                expect(isEqualMoney(money.data, sum.data)).toBe(true);
              }
            }
          }
        )
      );
    });
  });

  describe("Subtraction properties", () => {
    it("should be inverse of addition: (a + b) - b = a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a, b) => {
            const moneyA = createMoney(a);
            const moneyB = createMoney(b);

            if (moneyA.success && moneyB.success) {
              const sum = addMoney(moneyA.data, moneyB.data);

              if (sum.success) {
                const diff = subtractMoney(sum.data, moneyB.data);

                if (diff.success) {
                  expect(isEqualMoney(moneyA.data, diff.data)).toBe(true);
                }
              }
            }
          }
        )
      );
    });

    it("should result in zero when subtracting from itself: a - a = 0", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a) => {
            const money = createMoney(a);

            if (money.success) {
              const diff = subtractMoney(money.data, money.data);

              if (diff.success) {
                expect(isEqualMoney(diff.data, ZERO_MONEY)).toBe(true);
              }
            }
          }
        )
      );
    });
  });

  describe("Multiplication properties", () => {
    it("should have 1 as identity: a * 1 = a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a) => {
            const money = createMoney(a);

            if (money.success) {
              const product = multiplyMoney(money.data, 1);

              if (product.success) {
                expect(isEqualMoney(money.data, product.data)).toBe(true);
              }
            }
          }
        )
      );
    });

    it("should have 0 as absorbing element: a * 0 = 0", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(10_000), noNaN: true }),
          (a) => {
            const money = createMoney(a);

            if (money.success) {
              const product = multiplyMoney(money.data, 0);

              if (product.success) {
                expect(isEqualMoney(product.data, ZERO_MONEY)).toBe(true);
              }
            }
          }
        )
      );
    });
  });
});
