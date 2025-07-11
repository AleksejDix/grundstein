import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  Percentage,
  createPercentage,
  toPercentageValue,
  toDecimal,
  fromDecimal,
  addPercentage,
  subtractPercentage,
  multiplyPercentage,
  comparePercentage,
  isEqualPercentage,
  formatPercentage,
  ZERO_PERCENT,
  FIFTY_PERCENT,
  HUNDRED_PERCENT,
  type PercentageValidationError,
} from "../../../../domain/types/Percentage";

describe("Percentage Type", () => {
  describe("createPercentage", () => {
    it("should create valid Percentage for values in range", () => {
      const result = createPercentage(25.5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toPercentageValue(result.data)).toBe(25.5);
      }
    });

    it("should create Percentage for boundary values", () => {
      const zero = createPercentage(0);
      const hundred = createPercentage(100);

      expect(zero.success).toBe(true);
      expect(hundred.success).toBe(true);

      if (zero.success && hundred.success) {
        expect(toPercentageValue(zero.data)).toBe(0);
        expect(toPercentageValue(hundred.data)).toBe(100);
      }
    });

    it("should reject values below 0", () => {
      const result = createPercentage(-0.1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("OutOfRange");
      }
    });

    it("should reject values above 100", () => {
      const result = createPercentage(100.1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("OutOfRange");
      }
    });

    it("should reject invalid values", () => {
      const invalidInputs = [NaN, Infinity, -Infinity];

      invalidInputs.forEach((input) => {
        const result = createPercentage(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InvalidValue");
        }
      });
    });
  });

  describe("toDecimal and fromDecimal", () => {
    it("should convert percentage to decimal correctly", () => {
      const percentage = createPercentage(50);

      if (percentage.success) {
        expect(toDecimal(percentage.data)).toBe(0.5);
      }
    });

    it("should create percentage from decimal", () => {
      const result = fromDecimal(0.25);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(toPercentageValue(result.data)).toBe(25);
      }
    });

    it("should round-trip correctly: percentage -> decimal -> percentage", () => {
      const originalValue = 33.33;
      const percentage = createPercentage(originalValue);

      if (percentage.success) {
        const decimal = toDecimal(percentage.data);
        const backToPercentage = fromDecimal(decimal);

        if (backToPercentage.success) {
          expect(
            Math.abs(toPercentageValue(backToPercentage.data) - originalValue)
          ).toBeLessThan(0.01);
        }
      }
    });

    it("should reject invalid decimals", () => {
      const invalidDecimals = [-0.1, 1.1, NaN, Infinity];

      invalidDecimals.forEach((decimal) => {
        const result = fromDecimal(decimal);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("addPercentage", () => {
    it("should add percentages correctly", () => {
      const p1 = createPercentage(30);
      const p2 = createPercentage(20);

      if (p1.success && p2.success) {
        const result = addPercentage(p1.data, p2.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(50);
        }
      }
    });

    it("should handle adding zero", () => {
      const percentage = createPercentage(50);

      if (percentage.success) {
        const result = addPercentage(percentage.data, ZERO_PERCENT);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(50);
        }
      }
    });

    it("should reject addition that exceeds 100%", () => {
      const p1 = createPercentage(60);
      const p2 = createPercentage(50);

      if (p1.success && p2.success) {
        const result = addPercentage(p1.data, p2.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("OutOfRange");
        }
      }
    });
  });

  describe("subtractPercentage", () => {
    it("should subtract percentages correctly", () => {
      const p1 = createPercentage(70);
      const p2 = createPercentage(30);

      if (p1.success && p2.success) {
        const result = subtractPercentage(p1.data, p2.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(40);
        }
      }
    });

    it("should handle subtracting to zero", () => {
      const percentage = createPercentage(50);

      if (percentage.success) {
        const result = subtractPercentage(percentage.data, percentage.data);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(0);
        }
      }
    });

    it("should reject subtraction that would result in negative", () => {
      const smaller = createPercentage(30);
      const larger = createPercentage(50);

      if (smaller.success && larger.success) {
        const result = subtractPercentage(smaller.data, larger.data);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("OutOfRange");
        }
      }
    });
  });

  describe("multiplyPercentage", () => {
    it("should multiply percentage by factor", () => {
      const percentage = createPercentage(40);

      if (percentage.success) {
        const result = multiplyPercentage(percentage.data, 1.5);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(60);
        }
      }
    });

    it("should handle multiplication by zero", () => {
      const percentage = createPercentage(50);

      if (percentage.success) {
        const result = multiplyPercentage(percentage.data, 0);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(toPercentageValue(result.data)).toBe(0);
        }
      }
    });

    it("should reject invalid factors", () => {
      const percentage = createPercentage(50);
      const invalidFactors = [NaN, Infinity, -1, -Infinity];

      if (percentage.success) {
        invalidFactors.forEach((factor) => {
          const result = multiplyPercentage(percentage.data, factor);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBe("InvalidValue");
          }
        });
      }
    });

    it("should reject multiplication that exceeds 100%", () => {
      const percentage = createPercentage(60);

      if (percentage.success) {
        const result = multiplyPercentage(percentage.data, 2);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("OutOfRange");
        }
      }
    });
  });

  describe("comparePercentage and isEqualPercentage", () => {
    it("should compare percentages correctly", () => {
      const p1 = createPercentage(70);
      const p2 = createPercentage(30);
      const p3 = createPercentage(70);

      if (p1.success && p2.success && p3.success) {
        expect(comparePercentage(p1.data, p2.data)).toBeGreaterThan(0);
        expect(comparePercentage(p2.data, p1.data)).toBeLessThan(0);
        expect(comparePercentage(p1.data, p3.data)).toBe(0);

        expect(isEqualPercentage(p1.data, p3.data)).toBe(true);
        expect(isEqualPercentage(p1.data, p2.data)).toBe(false);
      }
    });

    it("should handle floating point comparison correctly", () => {
      const p1 = createPercentage(33.333);
      const p2 = createPercentage(33.334);

      if (p1.success && p2.success) {
        expect(isEqualPercentage(p1.data, p2.data)).toBe(false);
      }
    });
  });

  describe("formatPercentage", () => {
    it("should format percentage in German locale", () => {
      const percentage = createPercentage(23.45);

      if (percentage.success) {
        const formatted = formatPercentage(percentage.data);
        expect(formatted).toMatch(/23,45\s*%/);
      }
    });

    it("should format with custom decimal places", () => {
      const percentage = createPercentage(33.333);

      if (percentage.success) {
        const formatted = formatPercentage(percentage.data, 1);
        expect(formatted).toMatch(/33,3\s*%/);
      }
    });
  });

  describe("Constants", () => {
    it("should have valid percentage constants", () => {
      expect(toPercentageValue(ZERO_PERCENT)).toBe(0);
      expect(toPercentageValue(FIFTY_PERCENT)).toBe(50);
      expect(toPercentageValue(HUNDRED_PERCENT)).toBe(100);
    });
  });
});

// Property-based tests
describe("Percentage Property-Based Tests", () => {
  describe("Percentage creation properties", () => {
    it("should always create valid Percentage for valid inputs", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (value) => {
          const result = createPercentage(value);
          if (result.success) {
            expect(toPercentageValue(result.data)).toBeCloseTo(value, 10);
          }
        })
      );
    });

    it("should reject all values outside 0-100 range", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({
              min: Math.fround(-100),
              max: Math.fround(-0.001),
              noNaN: true,
            }),
            fc.float({
              min: Math.fround(100.001),
              max: Math.fround(1000),
              noNaN: true,
            })
          ),
          (invalidValue) => {
            const result = createPercentage(invalidValue);
            expect(result.success).toBe(false);
            if (!result.success) {
              expect(result.error).toBe("OutOfRange");
            }
          }
        )
      );
    });
  });

  describe("Decimal conversion properties", () => {
    it("should round-trip correctly: percentage -> decimal -> percentage", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (value) => {
          const percentage = createPercentage(value);

          if (percentage.success) {
            const decimal = toDecimal(percentage.data);
            const backToPercentage = fromDecimal(decimal);

            if (backToPercentage.success) {
              expect(
                Math.abs(toPercentageValue(backToPercentage.data) - value)
              ).toBeLessThan(0.000001);
            }
          }
        })
      );
    });
  });

  describe("Addition properties", () => {
    it("should be commutative: a + b = b + a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 40, noNaN: true }),
          fc.float({ min: 0, max: 40, noNaN: true }),
          (a, b) => {
            const percentA = createPercentage(a);
            const percentB = createPercentage(b);

            if (percentA.success && percentB.success) {
              const sum1 = addPercentage(percentA.data, percentB.data);
              const sum2 = addPercentage(percentB.data, percentA.data);

              if (sum1.success && sum2.success) {
                expect(isEqualPercentage(sum1.data, sum2.data)).toBe(true);
              }
            }
          }
        )
      );
    });

    it("should have zero as identity: a + 0 = a", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (a) => {
          const percentage = createPercentage(a);

          if (percentage.success) {
            const sum = addPercentage(percentage.data, ZERO_PERCENT);

            if (sum.success) {
              expect(isEqualPercentage(percentage.data, sum.data)).toBe(true);
            }
          }
        })
      );
    });
  });

  describe("Subtraction properties", () => {
    it("should be inverse of addition: (a + b) - b = a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 40, noNaN: true }),
          fc.float({ min: 0, max: 40, noNaN: true }),
          (a, b) => {
            const percentA = createPercentage(a);
            const percentB = createPercentage(b);

            if (percentA.success && percentB.success) {
              const sum = addPercentage(percentA.data, percentB.data);

              if (sum.success) {
                const diff = subtractPercentage(sum.data, percentB.data);

                if (diff.success) {
                  expect(isEqualPercentage(percentA.data, diff.data)).toBe(
                    true
                  );
                }
              }
            }
          }
        )
      );
    });

    it("should result in zero when subtracting from itself: a - a = 0", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (a) => {
          const percentage = createPercentage(a);

          if (percentage.success) {
            const diff = subtractPercentage(percentage.data, percentage.data);

            if (diff.success) {
              expect(isEqualPercentage(diff.data, ZERO_PERCENT)).toBe(true);
            }
          }
        })
      );
    });
  });

  describe("Multiplication properties", () => {
    it("should have 1 as identity: a * 1 = a", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (a) => {
          const percentage = createPercentage(a);

          if (percentage.success) {
            const product = multiplyPercentage(percentage.data, 1);

            if (product.success) {
              expect(isEqualPercentage(percentage.data, product.data)).toBe(
                true
              );
            }
          }
        })
      );
    });

    it("should have 0 as absorbing element: a * 0 = 0", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 100, noNaN: true }), (a) => {
          const percentage = createPercentage(a);

          if (percentage.success) {
            const product = multiplyPercentage(percentage.data, 0);

            if (product.success) {
              expect(isEqualPercentage(product.data, ZERO_PERCENT)).toBe(true);
            }
          }
        })
      );
    });
  });
});
