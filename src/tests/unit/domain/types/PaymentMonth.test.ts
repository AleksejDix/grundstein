import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  PaymentMonth,
  PaymentMonthValidationError,
  createPaymentMonth,
  toPositiveInteger,
  toNumber,
  getPaymentYear,
  getMonthInYear,
  fromYearAndMonth,
  addMonths,
  isFirstYear,
  isEndOfYear,
  comparePaymentMonth,
  isEqualPaymentMonth,
  formatPaymentMonth,
  getFirstPaymentMonth,
  getMaximumPaymentMonth,
  isValidPaymentMonthRange,
  FIRST_PAYMENT,
  END_OF_FIRST_YEAR,
  END_OF_FIFTH_YEAR,
} from "../../../../domain/types/PaymentMonth";
import { toNumber as positiveIntegerToNumber } from "../../../../domain/types/PositiveInteger";

describe("PaymentMonth", () => {
  describe("createPaymentMonth", () => {
    it("should create valid payment month for month 1", () => {
      const result = createPaymentMonth(1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(1);
      }
    });

    it("should create valid payment month for month 12", () => {
      const result = createPaymentMonth(12);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(12);
      }
    });

    it("should create valid payment month for maximum term (480 months)", () => {
      const result = createPaymentMonth(480);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(480);
      }
    });

    it("should reject month 0", () => {
      const result = createPaymentMonth(0);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PositiveIntegerValidationError");
      }
    });

    it("should reject negative months", () => {
      const result = createPaymentMonth(-5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PositiveIntegerValidationError");
      }
    });

    it("should reject month 481 (exceeds maximum term)", () => {
      const result = createPaymentMonth(481);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidPaymentMonth");
      }
    });

    it("should reject decimal months", () => {
      const result = createPaymentMonth(12.5);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PositiveIntegerValidationError");
      }
    });

    it("should reject infinity", () => {
      const result = createPaymentMonth(Infinity);
      expect(result.success).toBe(false);
    });

    it("should reject NaN", () => {
      const result = createPaymentMonth(NaN);
      expect(result.success).toBe(false);
    });
  });

  describe("conversion functions", () => {
    it("should convert to PositiveInteger correctly", () => {
      const paymentMonth = createPaymentMonth(24);
      expect(paymentMonth.success).toBe(true);
      if (paymentMonth.success) {
        const positiveInt = toPositiveInteger(paymentMonth.data);
        expect(positiveIntegerToNumber(positiveInt)).toBe(24);
      }
    });

    it("should convert to number correctly", () => {
      const paymentMonth = createPaymentMonth(36);
      expect(paymentMonth.success).toBe(true);
      if (paymentMonth.success) {
        expect(toNumber(paymentMonth.data)).toBe(36);
      }
    });
  });

  describe("year calculations", () => {
    it("should calculate correct payment year for first year months", () => {
      const months = [1, 6, 12];
      months.forEach((month) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(getPaymentYear(paymentMonth.data)).toBe(1);
        }
      });
    });

    it("should calculate correct payment year for second year months", () => {
      const months = [13, 18, 24];
      months.forEach((month) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(getPaymentYear(paymentMonth.data)).toBe(2);
        }
      });
    });

    it("should calculate correct payment year for month 120 (year 10)", () => {
      const paymentMonth = createPaymentMonth(120);
      expect(paymentMonth.success).toBe(true);
      if (paymentMonth.success) {
        expect(getPaymentYear(paymentMonth.data)).toBe(10);
      }
    });

    it("should calculate month within year correctly", () => {
      const testCases = [
        { month: 1, expected: 1 }, // January of year 1
        { month: 12, expected: 12 }, // December of year 1
        { month: 13, expected: 1 }, // January of year 2
        { month: 24, expected: 12 }, // December of year 2
        { month: 25, expected: 1 }, // January of year 3
        { month: 36, expected: 12 }, // December of year 3
      ];

      testCases.forEach(({ month, expected }) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(getMonthInYear(paymentMonth.data)).toBe(expected);
        }
      });
    });
  });

  describe("fromYearAndMonth", () => {
    it("should create payment month from year 1, month 1", () => {
      const result = fromYearAndMonth(1, 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(1);
      }
    });

    it("should create payment month from year 1, month 12", () => {
      const result = fromYearAndMonth(1, 12);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(12);
      }
    });

    it("should create payment month from year 2, month 1", () => {
      const result = fromYearAndMonth(2, 1);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(13);
      }
    });

    it("should create payment month from year 5, month 6", () => {
      const result = fromYearAndMonth(5, 6);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(toNumber(result.data)).toBe(54);
      }
    });

    it("should reject year 0", () => {
      const result = fromYearAndMonth(0, 6);
      expect(result.success).toBe(false);
    });

    it("should reject year 41", () => {
      const result = fromYearAndMonth(41, 6);
      expect(result.success).toBe(false);
    });

    it("should reject month 0", () => {
      const result = fromYearAndMonth(5, 0);
      expect(result.success).toBe(false);
    });

    it("should reject month 13", () => {
      const result = fromYearAndMonth(5, 13);
      expect(result.success).toBe(false);
    });
  });

  describe("arithmetic operations", () => {
    it("should add months correctly", () => {
      const month1 = createPaymentMonth(10);
      expect(month1.success).toBe(true);
      if (month1.success) {
        const result = addMonths(month1.data, 5);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(15);
        }
      }
    });

    it("should handle adding months that exceed maximum", () => {
      const month475 = createPaymentMonth(475);
      expect(month475.success).toBe(true);
      if (month475.success) {
        const result = addMonths(month475.data, 10);
        expect(result.success).toBe(false);
      }
    });

    it("should handle adding negative months (subtraction)", () => {
      const month20 = createPaymentMonth(20);
      expect(month20.success).toBe(true);
      if (month20.success) {
        const result = addMonths(month20.data, -5);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(toNumber(result.data)).toBe(15);
        }
      }
    });

    it("should handle subtracting too many months", () => {
      const month5 = createPaymentMonth(5);
      expect(month5.success).toBe(true);
      if (month5.success) {
        const result = addMonths(month5.data, -10);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("predicates", () => {
    it("should identify first year months correctly", () => {
      for (let month = 1; month <= 12; month++) {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(isFirstYear(paymentMonth.data)).toBe(true);
        }
      }
    });

    it("should identify non-first year months correctly", () => {
      const months = [13, 24, 36, 120, 480];
      months.forEach((month) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(isFirstYear(paymentMonth.data)).toBe(false);
        }
      });
    });

    it("should identify end of year months correctly", () => {
      const endOfYearMonths = [12, 24, 36, 48, 60];
      endOfYearMonths.forEach((month) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(isEndOfYear(paymentMonth.data)).toBe(true);
        }
      });
    });

    it("should identify non-end of year months correctly", () => {
      const nonEndOfYearMonths = [1, 11, 13, 23, 25, 35];
      nonEndOfYearMonths.forEach((month) => {
        const paymentMonth = createPaymentMonth(month);
        expect(paymentMonth.success).toBe(true);
        if (paymentMonth.success) {
          expect(isEndOfYear(paymentMonth.data)).toBe(false);
        }
      });
    });
  });

  describe("comparison functions", () => {
    it("should compare payment months correctly", () => {
      const month10 = createPaymentMonth(10);
      const month20 = createPaymentMonth(20);
      expect(month10.success && month20.success).toBe(true);
      if (month10.success && month20.success) {
        expect(comparePaymentMonth(month10.data, month20.data)).toBeLessThan(0);
        expect(comparePaymentMonth(month20.data, month10.data)).toBeGreaterThan(
          0
        );
        expect(comparePaymentMonth(month10.data, month10.data)).toBe(0);
      }
    });

    it("should check equality correctly", () => {
      const month15a = createPaymentMonth(15);
      const month15b = createPaymentMonth(15);
      const month16 = createPaymentMonth(16);

      expect(month15a.success && month15b.success && month16.success).toBe(
        true
      );
      if (month15a.success && month15b.success && month16.success) {
        expect(isEqualPaymentMonth(month15a.data, month15b.data)).toBe(true);
        expect(isEqualPaymentMonth(month15a.data, month16.data)).toBe(false);
      }
    });
  });

  describe("formatting", () => {
    it("should format payment month correctly", () => {
      const month1 = createPaymentMonth(1);
      expect(month1.success).toBe(true);
      if (month1.success) {
        const formatted = formatPaymentMonth(month1.data);
        expect(formatted).toBe("Monat 1 (Jahr 1, 1. Monat)");
      }
    });

    it("should format payment month 12 correctly", () => {
      const month12 = createPaymentMonth(12);
      expect(month12.success).toBe(true);
      if (month12.success) {
        const formatted = formatPaymentMonth(month12.data);
        expect(formatted).toBe("Monat 12 (Jahr 1, 12. Monat)");
      }
    });

    it("should format payment month 25 correctly", () => {
      const month25 = createPaymentMonth(25);
      expect(month25.success).toBe(true);
      if (month25.success) {
        const formatted = formatPaymentMonth(month25.data);
        expect(formatted).toBe("Monat 25 (Jahr 3, 1. Monat)");
      }
    });
  });

  describe("constants and utilities", () => {
    it("should provide first payment month constant", () => {
      expect(toNumber(FIRST_PAYMENT)).toBe(1);
    });

    it("should provide end of first year constant", () => {
      expect(toNumber(END_OF_FIRST_YEAR)).toBe(12);
    });

    it("should provide end of fifth year constant", () => {
      expect(toNumber(END_OF_FIFTH_YEAR)).toBe(60);
    });

    it("should get first payment month", () => {
      const first = getFirstPaymentMonth();
      expect(toNumber(first)).toBe(1);
    });

    it("should get maximum payment month", () => {
      const max = getMaximumPaymentMonth();
      expect(toNumber(max)).toBe(480);
    });

    it("should validate payment month range correctly", () => {
      expect(isValidPaymentMonthRange(1)).toBe(true);
      expect(isValidPaymentMonthRange(480)).toBe(true);
      expect(isValidPaymentMonthRange(0)).toBe(false);
      expect(isValidPaymentMonthRange(481)).toBe(false);
      expect(isValidPaymentMonthRange(12.5)).toBe(false);
    });
  });

  describe("property-based testing", () => {
    it("should handle all valid payment months correctly", () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 480 }), (month) => {
          const result = createPaymentMonth(month);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(toNumber(result.data)).toBe(month);
            expect(getPaymentYear(result.data)).toBeGreaterThan(0);
            expect(getPaymentYear(result.data)).toBeLessThanOrEqual(40);
            expect(getMonthInYear(result.data)).toBeGreaterThan(0);
            expect(getMonthInYear(result.data)).toBeLessThanOrEqual(12);
          }
        })
      );
    });

    it("should reject all invalid payment months correctly", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ max: 0 }),
            fc.integer({ min: 481 }),
            fc
              .double()
              .filter((x) => !Number.isInteger(x) || isNaN(x) || !isFinite(x))
          ),
          (invalidMonth) => {
            const result = createPaymentMonth(invalidMonth);
            expect(result.success).toBe(false);
          }
        )
      );
    });

    it("should maintain year/month conversion consistency", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 40 }),
          fc.integer({ min: 1, max: 12 }),
          (year, monthInYear) => {
            const result = fromYearAndMonth(year, monthInYear);
            expect(result.success).toBe(true);
            if (result.success) {
              expect(getPaymentYear(result.data)).toBe(year);
              expect(getMonthInYear(result.data)).toBe(monthInYear);
            }
          }
        )
      );
    });

    it("should maintain arithmetic operation correctness", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 400 }),
          fc.integer({ min: 1, max: 80 }),
          (startMonth, monthsToAdd) => {
            const start = createPaymentMonth(startMonth);
            if (start.success && startMonth + monthsToAdd <= 480) {
              const result = addMonths(start.data, monthsToAdd);
              expect(result.success).toBe(true);
              if (result.success) {
                expect(toNumber(result.data)).toBe(startMonth + monthsToAdd);
              }
            }
          }
        )
      );
    });
  });
});
