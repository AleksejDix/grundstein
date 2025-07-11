import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  ExtraPayment,
  ExtraPaymentValidationError,
  createExtraPayment,
  createExtraPaymentFromMoney,
  getPaymentMonth,
  getAmount,
  getAmountAsEuros,
  getMonthAsNumber,
  compareExtraPaymentsByMonth,
  compareExtraPaymentsByAmount,
  isSameMonth,
  isEqualExtraPayment,
  combineExtraPayments,
  formatExtraPayment,
  formatExtraPaymentShort,
  isInFirstYear,
  isLargeExtraPayment,
  isSmallExtraPayment,
  calculateTotalExtraPayments,
  groupExtraPaymentsByMonth,
  filterExtraPaymentsByYear,
  getMinimumExtraPaymentAmount,
  getMaximumExtraPaymentAmount,
  isValidExtraPaymentAmount,
} from "../../../../domain/types/ExtraPayment";
import {
  createPaymentMonth,
  toNumber,
} from "../../../../domain/types/PaymentMonth";
import { createMoney, toEuros } from "../../../../domain/types/Money";

describe("ExtraPayment", () => {
  describe("createExtraPayment", () => {
    it("should create valid extra payment", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 5000);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getMonthAsNumber(result.data)).toBe(12);
          expect(getAmountAsEuros(result.data)).toBe(5000);
        }
      }
    });

    it("should create minimum extra payment", () => {
      const month = createPaymentMonth(1);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 1);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getAmountAsEuros(result.data)).toBe(1);
        }
      }
    });

    it("should create maximum extra payment", () => {
      const month = createPaymentMonth(120);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 1000000);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getAmountAsEuros(result.data)).toBe(1000000);
        }
      }
    });

    it("should reject amount below minimum", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 0.5);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AmountTooLarge");
        }
      }
    });

    it("should reject amount above maximum", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 1000001);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AmountTooLarge");
        }
      }
    });

    it("should reject negative amounts", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, -1000);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("InvalidAmount");
        }
      }
    });

    it("should handle fractional amounts correctly", () => {
      const month = createPaymentMonth(6);
      expect(month.success).toBe(true);

      if (month.success) {
        const result = createExtraPayment(month.data, 2500.75);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getAmountAsEuros(result.data)).toBeCloseTo(2500.75, 2);
        }
      }
    });
  });

  describe("createExtraPaymentFromMoney", () => {
    it("should create extra payment from Money object", () => {
      const month = createPaymentMonth(24);
      const money = createMoney(10000);
      expect(month.success && money.success).toBe(true);

      if (month.success && money.success) {
        const result = createExtraPaymentFromMoney(month.data, money.data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getMonthAsNumber(result.data)).toBe(24);
          expect(getAmountAsEuros(result.data)).toBe(10000);
        }
      }
    });

    it("should reject Money amounts outside valid range", () => {
      const month = createPaymentMonth(12);
      const invalidMoney = createMoney(2000000); // Above maximum
      expect(month.success && invalidMoney.success).toBe(true);

      if (month.success && invalidMoney.success) {
        const result = createExtraPaymentFromMoney(
          month.data,
          invalidMoney.data
        );
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("AmountTooLarge");
        }
      }
    });
  });

  describe("getter functions", () => {
    it("should get payment month correctly", () => {
      const month = createPaymentMonth(18);
      expect(month.success).toBe(true);

      if (month.success) {
        const extraPayment = createExtraPayment(month.data, 7500);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          expect(getPaymentMonth(extraPayment.data)).toBe(month.data);
        }
      }
    });

    it("should get amount as Money correctly", () => {
      const month = createPaymentMonth(6);
      expect(month.success).toBe(true);

      if (month.success) {
        const extraPayment = createExtraPayment(month.data, 3000);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          const amount = getAmount(extraPayment.data);
          expect(toEuros(amount)).toBe(3000);
        }
      }
    });

    it("should get amount as euros correctly", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const extraPayment = createExtraPayment(month.data, 15000);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          expect(getAmountAsEuros(extraPayment.data)).toBe(15000);
        }
      }
    });

    it("should get month as number correctly", () => {
      const month = createPaymentMonth(36);
      expect(month.success).toBe(true);

      if (month.success) {
        const extraPayment = createExtraPayment(month.data, 8000);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          expect(getMonthAsNumber(extraPayment.data)).toBe(36);
        }
      }
    });
  });

  describe("comparison functions", () => {
    it("should compare extra payments by month correctly", () => {
      const month6 = createPaymentMonth(6);
      const month12 = createPaymentMonth(12);
      expect(month6.success && month12.success).toBe(true);

      if (month6.success && month12.success) {
        const payment6 = createExtraPayment(month6.data, 5000);
        const payment12 = createExtraPayment(month12.data, 10000);
        expect(payment6.success && payment12.success).toBe(true);

        if (payment6.success && payment12.success) {
          expect(
            compareExtraPaymentsByMonth(payment6.data, payment12.data)
          ).toBeLessThan(0);
          expect(
            compareExtraPaymentsByMonth(payment12.data, payment6.data)
          ).toBeGreaterThan(0);
          expect(
            compareExtraPaymentsByMonth(payment6.data, payment6.data)
          ).toBe(0);
        }
      }
    });

    it("should compare extra payments by amount correctly", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const payment5k = createExtraPayment(month.data, 5000);
        const payment10k = createExtraPayment(month.data, 10000);
        expect(payment5k.success && payment10k.success).toBe(true);

        if (payment5k.success && payment10k.success) {
          expect(
            compareExtraPaymentsByAmount(payment5k.data, payment10k.data)
          ).toBeLessThan(0);
          expect(
            compareExtraPaymentsByAmount(payment10k.data, payment5k.data)
          ).toBeGreaterThan(0);
          expect(
            compareExtraPaymentsByAmount(payment5k.data, payment5k.data)
          ).toBe(0);
        }
      }
    });

    it("should check if payments are in same month", () => {
      const month12a = createPaymentMonth(12);
      const month12b = createPaymentMonth(12);
      const month24 = createPaymentMonth(24);
      expect(month12a.success && month12b.success && month24.success).toBe(
        true
      );

      if (month12a.success && month12b.success && month24.success) {
        const payment12a = createExtraPayment(month12a.data, 5000);
        const payment12b = createExtraPayment(month12b.data, 7000);
        const payment24 = createExtraPayment(month24.data, 5000);
        expect(
          payment12a.success && payment12b.success && payment24.success
        ).toBe(true);

        if (payment12a.success && payment12b.success && payment24.success) {
          expect(isSameMonth(payment12a.data, payment12b.data)).toBe(true);
          expect(isSameMonth(payment12a.data, payment24.data)).toBe(false);
        }
      }
    });

    it("should check equality correctly", () => {
      const month12 = createPaymentMonth(12);
      expect(month12.success).toBe(true);

      if (month12.success) {
        const payment1 = createExtraPayment(month12.data, 5000);
        const payment2 = createExtraPayment(month12.data, 5000);
        const payment3 = createExtraPayment(month12.data, 5001);
        expect(payment1.success && payment2.success && payment3.success).toBe(
          true
        );

        if (payment1.success && payment2.success && payment3.success) {
          expect(isEqualExtraPayment(payment1.data, payment2.data)).toBe(true);
          expect(isEqualExtraPayment(payment1.data, payment3.data)).toBe(false);
        }
      }
    });
  });

  describe("combining payments", () => {
    it("should combine payments in same month", () => {
      const month12 = createPaymentMonth(12);
      expect(month12.success).toBe(true);

      if (month12.success) {
        const payment1 = createExtraPayment(month12.data, 3000);
        const payment2 = createExtraPayment(month12.data, 2000);
        expect(payment1.success && payment2.success).toBe(true);

        if (payment1.success && payment2.success) {
          const combined = combineExtraPayments(payment1.data, payment2.data);
          expect(combined.success).toBe(true);
          if (combined.success) {
            expect(getMonthAsNumber(combined.data)).toBe(12);
            expect(getAmountAsEuros(combined.data)).toBe(5000);
          }
        }
      }
    });

    it("should reject combining payments from different months", () => {
      const month6 = createPaymentMonth(6);
      const month12 = createPaymentMonth(12);
      expect(month6.success && month12.success).toBe(true);

      if (month6.success && month12.success) {
        const payment6 = createExtraPayment(month6.data, 3000);
        const payment12 = createExtraPayment(month12.data, 2000);
        expect(payment6.success && payment12.success).toBe(true);

        if (payment6.success && payment12.success) {
          const combined = combineExtraPayments(payment6.data, payment12.data);
          expect(combined.success).toBe(false);
          if (!combined.success) {
            expect(combined.error).toBe("InvalidPaymentMonth");
          }
        }
      }
    });
  });

  describe("formatting", () => {
    it("should format extra payment correctly", () => {
      const month12 = createPaymentMonth(12);
      expect(month12.success).toBe(true);

      if (month12.success) {
        const extraPayment = createExtraPayment(month12.data, 10000);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          const formatted = formatExtraPayment(extraPayment.data);
          expect(formatted).toContain("Sondertilgung");
          expect(formatted).toContain("10.000,00");
          expect(formatted).toContain("Monat 12");
        }
      }
    });

    it("should format extra payment in short form", () => {
      const month24 = createPaymentMonth(24);
      expect(month24.success).toBe(true);

      if (month24.success) {
        const extraPayment = createExtraPayment(month24.data, 7500);
        expect(extraPayment.success).toBe(true);
        if (extraPayment.success) {
          const formatted = formatExtraPaymentShort(extraPayment.data);
          expect(formatted).toContain("7.500,00");
          expect(formatted).toContain("Monat 24");
        }
      }
    });
  });

  describe("predicates", () => {
    it("should identify first year payments", () => {
      const firstYearMonths = [1, 6, 12];
      firstYearMonths.forEach((monthNum) => {
        const month = createPaymentMonth(monthNum);
        expect(month.success).toBe(true);
        if (month.success) {
          const extraPayment = createExtraPayment(month.data, 5000);
          expect(extraPayment.success).toBe(true);
          if (extraPayment.success) {
            expect(isInFirstYear(extraPayment.data)).toBe(true);
          }
        }
      });
    });

    it("should identify non-first year payments", () => {
      const laterMonths = [13, 24, 36, 120];
      laterMonths.forEach((monthNum) => {
        const month = createPaymentMonth(monthNum);
        expect(month.success).toBe(true);
        if (month.success) {
          const extraPayment = createExtraPayment(month.data, 5000);
          expect(extraPayment.success).toBe(true);
          if (extraPayment.success) {
            expect(isInFirstYear(extraPayment.data)).toBe(false);
          }
        }
      });
    });

    it("should identify large extra payments", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const largePayment = createExtraPayment(month.data, 15000);
        const notLargePayment = createExtraPayment(month.data, 5000);
        expect(largePayment.success && notLargePayment.success).toBe(true);

        if (largePayment.success && notLargePayment.success) {
          expect(isLargeExtraPayment(largePayment.data)).toBe(true);
          expect(isLargeExtraPayment(notLargePayment.data)).toBe(false);
        }
      }
    });

    it("should identify small extra payments", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const smallPayment = createExtraPayment(month.data, 500);
        const notSmallPayment = createExtraPayment(month.data, 1500);
        expect(smallPayment.success && notSmallPayment.success).toBe(true);

        if (smallPayment.success && notSmallPayment.success) {
          expect(isSmallExtraPayment(smallPayment.data)).toBe(true);
          expect(isSmallExtraPayment(notSmallPayment.data)).toBe(false);
        }
      }
    });

    it("should handle edge cases for payment size classification", () => {
      const month = createPaymentMonth(12);
      expect(month.success).toBe(true);

      if (month.success) {
        const exactly1000 = createExtraPayment(month.data, 1000);
        const exactly10000 = createExtraPayment(month.data, 10000);
        expect(exactly1000.success && exactly10000.success).toBe(true);

        if (exactly1000.success && exactly10000.success) {
          expect(isSmallExtraPayment(exactly1000.data)).toBe(false); // < 1000, not <= 1000
          expect(isLargeExtraPayment(exactly10000.data)).toBe(true); // >= 10000
        }
      }
    });
  });

  describe("array operations", () => {
    it("should calculate total of extra payments", () => {
      const month6 = createPaymentMonth(6);
      const month12 = createPaymentMonth(12);
      const month24 = createPaymentMonth(24);
      expect(month6.success && month12.success && month24.success).toBe(true);

      if (month6.success && month12.success && month24.success) {
        const payment1 = createExtraPayment(month6.data, 2000);
        const payment2 = createExtraPayment(month12.data, 3000);
        const payment3 = createExtraPayment(month24.data, 5000);
        expect(payment1.success && payment2.success && payment3.success).toBe(
          true
        );

        if (payment1.success && payment2.success && payment3.success) {
          const payments = [payment1.data, payment2.data, payment3.data];
          const total = calculateTotalExtraPayments(payments);
          expect(total.success).toBe(true);
          if (total.success) {
            expect(toEuros(total.data)).toBe(10000);
          }
        }
      }
    });

    it("should handle empty array for total calculation", () => {
      const total = calculateTotalExtraPayments([]);
      expect(total.success).toBe(true);
      if (total.success) {
        expect(toEuros(total.data)).toBe(0);
      }
    });

    it("should group payments by month", () => {
      const month12 = createPaymentMonth(12);
      const month24 = createPaymentMonth(24);
      expect(month12.success && month24.success).toBe(true);

      if (month12.success && month24.success) {
        const payment1 = createExtraPayment(month12.data, 2000);
        const payment2 = createExtraPayment(month12.data, 3000); // Same month
        const payment3 = createExtraPayment(month24.data, 5000);
        expect(payment1.success && payment2.success && payment3.success).toBe(
          true
        );

        if (payment1.success && payment2.success && payment3.success) {
          const payments = [payment1.data, payment2.data, payment3.data];
          const grouped = groupExtraPaymentsByMonth(payments);
          expect(grouped.success).toBe(true);
          if (grouped.success) {
            expect(grouped.data).toHaveLength(2); // Two distinct months

            // Find the combined month 12 payment
            const month12Payment = grouped.data.find(
              (p) => getMonthAsNumber(p) === 12
            );
            expect(month12Payment).toBeDefined();
            if (month12Payment) {
              expect(getAmountAsEuros(month12Payment)).toBe(5000); // 2000 + 3000
            }

            // Find the month 24 payment
            const month24Payment = grouped.data.find(
              (p) => getMonthAsNumber(p) === 24
            );
            expect(month24Payment).toBeDefined();
            if (month24Payment) {
              expect(getAmountAsEuros(month24Payment)).toBe(5000);
            }
          }
        }
      }
    });

    it("should handle empty array for grouping", () => {
      const grouped = groupExtraPaymentsByMonth([]);
      expect(grouped.success).toBe(true);
      if (grouped.success) {
        expect(grouped.data).toHaveLength(0);
      }
    });

    it("should filter payments by year", () => {
      const month6 = createPaymentMonth(6); // Year 1
      const month12 = createPaymentMonth(12); // Year 1
      const month18 = createPaymentMonth(18); // Year 2
      const month36 = createPaymentMonth(36); // Year 3
      expect(
        month6.success && month12.success && month18.success && month36.success
      ).toBe(true);

      if (
        month6.success &&
        month12.success &&
        month18.success &&
        month36.success
      ) {
        const payment1 = createExtraPayment(month6.data, 1000);
        const payment2 = createExtraPayment(month12.data, 2000);
        const payment3 = createExtraPayment(month18.data, 3000);
        const payment4 = createExtraPayment(month36.data, 4000);
        expect(
          payment1.success &&
            payment2.success &&
            payment3.success &&
            payment4.success
        ).toBe(true);

        if (
          payment1.success &&
          payment2.success &&
          payment3.success &&
          payment4.success
        ) {
          const allPayments = [
            payment1.data,
            payment2.data,
            payment3.data,
            payment4.data,
          ];

          const year1Payments = filterExtraPaymentsByYear(allPayments, 1);
          expect(year1Payments).toHaveLength(2);

          const year2Payments = filterExtraPaymentsByYear(allPayments, 2);
          expect(year2Payments).toHaveLength(1);
          expect(getMonthAsNumber(year2Payments[0])).toBe(18);

          const year3Payments = filterExtraPaymentsByYear(allPayments, 3);
          expect(year3Payments).toHaveLength(1);
          expect(getMonthAsNumber(year3Payments[0])).toBe(36);
        }
      }
    });
  });

  describe("constants and utilities", () => {
    it("should provide minimum extra payment amount", () => {
      expect(getMinimumExtraPaymentAmount()).toBe(1);
    });

    it("should provide maximum extra payment amount", () => {
      expect(getMaximumExtraPaymentAmount()).toBe(1000000);
    });

    it("should validate extra payment amounts correctly", () => {
      expect(isValidExtraPaymentAmount(1)).toBe(true);
      expect(isValidExtraPaymentAmount(1000000)).toBe(true);
      expect(isValidExtraPaymentAmount(5000)).toBe(true);
      expect(isValidExtraPaymentAmount(0.5)).toBe(false);
      expect(isValidExtraPaymentAmount(1000001)).toBe(false);
      expect(isValidExtraPaymentAmount(-100)).toBe(false);
    });
  });

  describe("property-based testing", () => {
    it("should handle all valid extra payment amounts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 480 }),
          fc.double({ min: 1, max: 1000000, noNaN: true }),
          (monthNum, amount) => {
            const month = createPaymentMonth(monthNum);
            if (month.success) {
              const extraPayment = createExtraPayment(month.data, amount);
              expect(extraPayment.success).toBe(true);
              if (extraPayment.success) {
                expect(getMonthAsNumber(extraPayment.data)).toBe(monthNum);
                expect(getAmountAsEuros(extraPayment.data)).toBeCloseTo(
                  amount,
                  2
                );
              }
            }
          }
        )
      );
    });

    it("should reject all invalid extra payment amounts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 480 }),
          fc.oneof(
            fc.double({ max: 0.99 }),
            fc.double({ min: 1000001 }),
            fc.constant(NaN),
            fc.constant(Infinity),
            fc.constant(-Infinity)
          ),
          (monthNum, invalidAmount) => {
            const month = createPaymentMonth(monthNum);
            if (month.success && isFinite(invalidAmount)) {
              const extraPayment = createExtraPayment(
                month.data,
                invalidAmount
              );
              expect(extraPayment.success).toBe(false);
            }
          }
        )
      );
    });

    it("should maintain grouping invariants", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              month: fc.integer({ min: 1, max: 480 }),
              amount: fc.double({ min: 1, max: 50000, noNaN: true }),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          (paymentData) => {
            const payments: ExtraPayment[] = [];

            // Create valid extra payments
            for (const data of paymentData) {
              const month = createPaymentMonth(data.month);
              if (month.success) {
                const payment = createExtraPayment(month.data, data.amount);
                if (payment.success) {
                  payments.push(payment.data);
                }
              }
            }

            if (payments.length > 0) {
              const grouped = groupExtraPaymentsByMonth(payments);
              expect(grouped.success).toBe(true);

              if (grouped.success) {
                // Grouped payments should have unique months
                const groupedMonths = grouped.data.map((p) =>
                  getMonthAsNumber(p)
                );
                const uniqueMonths = [...new Set(groupedMonths)];
                expect(groupedMonths).toHaveLength(uniqueMonths.length);

                // Total amount should be preserved
                const originalTotal = calculateTotalExtraPayments(payments);
                const groupedTotal = calculateTotalExtraPayments(grouped.data);

                if (originalTotal.success && groupedTotal.success) {
                  expect(toEuros(originalTotal.data)).toBeCloseTo(
                    toEuros(groupedTotal.data),
                    2
                  );
                }
              }
            }
          }
        )
      );
    });

    it("should maintain comparison consistency", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 480 }),
          fc.integer({ min: 1, max: 480 }),
          fc.double({ min: 1, max: 100000, noNaN: true }),
          fc.double({ min: 1, max: 100000, noNaN: true }),
          (month1, month2, amount1, amount2) => {
            const pm1 = createPaymentMonth(month1);
            const pm2 = createPaymentMonth(month2);

            if (pm1.success && pm2.success) {
              const payment1 = createExtraPayment(pm1.data, amount1);
              const payment2 = createExtraPayment(pm2.data, amount2);

              if (payment1.success && payment2.success) {
                // Month comparison should be consistent with month numbers
                const monthComparison = compareExtraPaymentsByMonth(
                  payment1.data,
                  payment2.data
                );
                const actualMonthComparison = month1 - month2;
                expect(Math.sign(monthComparison)).toBe(
                  Math.sign(actualMonthComparison)
                );

                // Amount comparison should be consistent with amounts (with tolerance for floating point)
                const amountComparison = compareExtraPaymentsByAmount(
                  payment1.data,
                  payment2.data
                );
                const actualAmountComparison = amount1 - amount2;

                // Only check consistency if amounts are significantly different (> 0.01 cents)
                if (Math.abs(actualAmountComparison) > 0.01) {
                  expect(Math.sign(amountComparison)).toBe(
                    Math.sign(actualAmountComparison)
                  );
                }
              }
            }
          }
        )
      );
    });

    it("should handle realistic Sondertilgung scenarios", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              month: fc.integer({ min: 1, max: 120 }), // Up to 10 years
              amount: fc.double({ min: 1000, max: 50000, noNaN: true }), // Realistic Sondertilgung amounts
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (paymentData) => {
            const payments: ExtraPayment[] = [];

            for (const data of paymentData) {
              const month = createPaymentMonth(data.month);
              if (month.success) {
                const payment = createExtraPayment(month.data, data.amount);
                if (payment.success) {
                  payments.push(payment.data);
                }
              }
            }

            if (payments.length > 0) {
              // All operations should work without errors
              expect(() => calculateTotalExtraPayments(payments)).not.toThrow();
              expect(() => groupExtraPaymentsByMonth(payments)).not.toThrow();
              expect(() =>
                filterExtraPaymentsByYear(payments, 1)
              ).not.toThrow();

              // Formatting should work
              payments.forEach((payment) => {
                expect(() => formatExtraPayment(payment)).not.toThrow();
                expect(() => formatExtraPaymentShort(payment)).not.toThrow();
              });

              // Business rules should be consistent
              payments.forEach((payment) => {
                const isFirst = isInFirstYear(payment);
                const monthNum = getMonthAsNumber(payment);
                expect(isFirst).toBe(monthNum <= 12);

                const isLarge = isLargeExtraPayment(payment);
                const amount = getAmountAsEuros(payment);
                expect(isLarge).toBe(amount >= 10000);
              });
            }
          }
        )
      );
    });
  });
});
