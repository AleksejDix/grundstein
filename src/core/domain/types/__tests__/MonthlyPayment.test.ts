import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  createMonthlyPayment,
  createMonthlyPaymentFromMoney,
  createMonthlyPaymentWithTotal,
  getPrincipalAmount,
  getInterestAmount,
  getTotalAmount,
  getPrincipalToInterestRatio,
  getInterestPercentage,
  getPrincipalPercentage,
  addMonthlyPayments,
  compareMonthlyPayments,
  isEqualMonthlyPayment,
  formatMonthlyPayment,
  formatMonthlyPaymentBreakdown,
  isPrincipalHeavy,
  isInterestHeavy,
  createZeroMonthlyPayment,
} from "../MonthlyPayment";
import { createMoney, addMoney, toEuros } from "../../value-objects/Money";

describe("MonthlyPayment", () => {
  describe("createMonthlyPayment", () => {
    it("should create valid monthly payment with principal and interest", () => {
      const result = createMonthlyPayment(800, 200);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(800);
        expect(getInterestAmount(result.data)).toBe(200);
        expect(getTotalAmount(result.data)).toBe(1000);
      }
    });

    it("should create zero payment correctly", () => {
      const result = createMonthlyPayment(0, 0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(0);
        expect(getInterestAmount(result.data)).toBe(0);
        expect(getTotalAmount(result.data)).toBe(0);
      }
    });

    it("should create payment with only principal", () => {
      const result = createMonthlyPayment(1500, 0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(1500);
        expect(getInterestAmount(result.data)).toBe(0);
        expect(getTotalAmount(result.data)).toBe(1500);
      }
    });

    it("should create payment with only interest", () => {
      const result = createMonthlyPayment(0, 500);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(0);
        expect(getInterestAmount(result.data)).toBe(500);
        expect(getTotalAmount(result.data)).toBe(500);
      }
    });

    it("should reject negative principal", () => {
      const result = createMonthlyPayment(-100, 200);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidPrincipal");
      }
    });

    it("should reject negative interest", () => {
      const result = createMonthlyPayment(800, -50);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidInterest");
      }
    });

    it("should handle large payment amounts", () => {
      const result = createMonthlyPayment(50000, 10000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(50000);
        expect(getInterestAmount(result.data)).toBe(10000);
        expect(getTotalAmount(result.data)).toBe(60000);
      }
    });

    it("should handle small fractional amounts", () => {
      const result = createMonthlyPayment(1234.56, 567.89);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBeCloseTo(1234.56, 2);
        expect(getInterestAmount(result.data)).toBeCloseTo(567.89, 2);
        expect(getTotalAmount(result.data)).toBeCloseTo(1802.45, 2);
      }
    });
  });

  describe("createMonthlyPaymentFromMoney", () => {
    it("should create payment from Money objects", () => {
      const principal = createMoney(1200);
      const interest = createMoney(300);
      expect(principal.success && interest.success).toBe(true);

      if (principal.success && interest.success) {
        const result = createMonthlyPaymentFromMoney(
          principal.data,
          interest.data,
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPrincipalAmount(result.data)).toBe(1200);
          expect(getInterestAmount(result.data)).toBe(300);
          expect(getTotalAmount(result.data)).toBe(1500);
        }
      }
    });
  });

  describe("createMonthlyPaymentWithTotal", () => {
    it("should create payment when total matches expected", () => {
      const result = createMonthlyPaymentWithTotal(750, 250, 1000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPrincipalAmount(result.data)).toBe(750);
        expect(getInterestAmount(result.data)).toBe(250);
        expect(getTotalAmount(result.data)).toBe(1000);
      }
    });

    it("should accept small rounding differences", () => {
      const result = createMonthlyPaymentWithTotal(750.001, 249.999, 1000);
      expect(result.success).toBe(true);
    });

    it("should reject when total doesn't match expected", () => {
      const result = createMonthlyPaymentWithTotal(750, 250, 1001);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InconsistentAmounts");
      }
    });
  });

  describe("amount getters", () => {
    it("should get principal amount correctly", () => {
      const payment = createMonthlyPayment(1234.56, 567.89);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getPrincipalAmount(payment.data)).toBeCloseTo(1234.56, 2);
      }
    });

    it("should get interest amount correctly", () => {
      const payment = createMonthlyPayment(1234.56, 567.89);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getInterestAmount(payment.data)).toBeCloseTo(567.89, 2);
      }
    });

    it("should get total amount correctly", () => {
      const payment = createMonthlyPayment(1234.56, 567.89);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getTotalAmount(payment.data)).toBeCloseTo(1802.45, 2);
      }
    });
  });

  describe("ratio and percentage calculations", () => {
    it("should calculate principal to interest ratio correctly", () => {
      const payment = createMonthlyPayment(800, 200);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getPrincipalToInterestRatio(payment.data)).toBe(4); // 800/200 = 4
      }
    });

    it("should handle infinite ratio when interest is zero", () => {
      const payment = createMonthlyPayment(1000, 0);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getPrincipalToInterestRatio(payment.data)).toBe(Infinity);
      }
    });

    it("should calculate interest percentage correctly", () => {
      const payment = createMonthlyPayment(800, 200);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getInterestPercentage(payment.data)).toBe(20); // 200/1000 * 100 = 20%
      }
    });

    it("should calculate principal percentage correctly", () => {
      const payment = createMonthlyPayment(800, 200);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getPrincipalPercentage(payment.data)).toBe(80); // 800/1000 * 100 = 80%
      }
    });

    it("should handle zero total in percentage calculations", () => {
      const payment = createMonthlyPayment(0, 0);
      expect(payment.success).toBe(true);
      if (payment.success) {
        expect(getInterestPercentage(payment.data)).toBe(0);
        expect(getPrincipalPercentage(payment.data)).toBe(0);
      }
    });

    it("should have percentages sum to 100", () => {
      const payment = createMonthlyPayment(750, 250);
      expect(payment.success).toBe(true);
      if (payment.success) {
        const principalPct = getPrincipalPercentage(payment.data);
        const interestPct = getInterestPercentage(payment.data);
        expect(principalPct + interestPct).toBeCloseTo(100, 10);
      }
    });
  });

  describe("arithmetic operations", () => {
    it("should add two monthly payments correctly", () => {
      const payment1 = createMonthlyPayment(800, 200);
      const payment2 = createMonthlyPayment(600, 150);

      expect(payment1.success && payment2.success).toBe(true);
      if (payment1.success && payment2.success) {
        const result = addMonthlyPayments(payment1.data, payment2.data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPrincipalAmount(result.data)).toBe(1400);
          expect(getInterestAmount(result.data)).toBe(350);
          expect(getTotalAmount(result.data)).toBe(1750);
        }
      }
    });

    it("should handle adding zero payments", () => {
      const payment1 = createMonthlyPayment(1000, 0);
      const payment2 = createMonthlyPayment(0, 0);

      expect(payment1.success && payment2.success).toBe(true);
      if (payment1.success && payment2.success) {
        const result = addMonthlyPayments(payment1.data, payment2.data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPrincipalAmount(result.data)).toBe(1000);
          expect(getInterestAmount(result.data)).toBe(0);
          expect(getTotalAmount(result.data)).toBe(1000);
        }
      }
    });
  });

  describe("comparison functions", () => {
    it("should compare payments by total amount", () => {
      const payment1 = createMonthlyPayment(800, 200); // Total: 1000
      const payment2 = createMonthlyPayment(600, 500); // Total: 1100
      const payment3 = createMonthlyPayment(900, 100); // Total: 1000

      expect(payment1.success && payment2.success && payment3.success).toBe(
        true,
      );
      if (payment1.success && payment2.success && payment3.success) {
        expect(
          compareMonthlyPayments(payment1.data, payment2.data),
        ).toBeLessThan(0);
        expect(
          compareMonthlyPayments(payment2.data, payment1.data),
        ).toBeGreaterThan(0);
        expect(compareMonthlyPayments(payment1.data, payment3.data)).toBe(0);
      }
    });

    it("should check equality correctly", () => {
      const payment1 = createMonthlyPayment(800, 200);
      const payment2 = createMonthlyPayment(800, 200);
      const payment3 = createMonthlyPayment(801, 200);

      expect(payment1.success && payment2.success && payment3.success).toBe(
        true,
      );
      if (payment1.success && payment2.success && payment3.success) {
        expect(isEqualMonthlyPayment(payment1.data, payment2.data)).toBe(true);
        expect(isEqualMonthlyPayment(payment1.data, payment3.data)).toBe(false);
      }
    });
  });

  describe("formatting", () => {
    it("should format monthly payment correctly", () => {
      const payment = createMonthlyPayment(800, 200);
      expect(payment.success).toBe(true);
      if (payment.success) {
        const formatted = formatMonthlyPayment(payment.data);
        expect(formatted).toContain("1.000,00");
        expect(formatted).toContain("800,00");
        expect(formatted).toContain("200,00");
        expect(formatted).toContain("Monatliche Rate");
        expect(formatted).toContain("Tilgung");
        expect(formatted).toContain("Zinsen");
      }
    });

    it("should format payment breakdown with percentages", () => {
      const payment = createMonthlyPayment(800, 200);
      expect(payment.success).toBe(true);
      if (payment.success) {
        const formatted = formatMonthlyPaymentBreakdown(payment.data);
        expect(formatted).toContain("80.0%");
        expect(formatted).toContain("20.0%");
        expect(formatted).toContain("Tilgung");
        expect(formatted).toContain("Zinsen");
      }
    });

    it("should format zero payment correctly", () => {
      const payment = createMonthlyPayment(0, 0);
      expect(payment.success).toBe(true);
      if (payment.success) {
        const formatted = formatMonthlyPayment(payment.data);
        expect(formatted).toContain("0,00");
      }
    });
  });

  describe("payment type predicates", () => {
    it("should identify principal-heavy payments", () => {
      const principalHeavy = createMonthlyPayment(800, 200); // 80% principal
      const notPrincipalHeavy = createMonthlyPayment(500, 500); // 50% principal

      expect(principalHeavy.success && notPrincipalHeavy.success).toBe(true);
      if (principalHeavy.success && notPrincipalHeavy.success) {
        expect(isPrincipalHeavy(principalHeavy.data)).toBe(true);
        expect(isPrincipalHeavy(notPrincipalHeavy.data)).toBe(false);
      }
    });

    it("should identify interest-heavy payments", () => {
      const interestHeavy = createMonthlyPayment(200, 800); // 80% interest
      const notInterestHeavy = createMonthlyPayment(500, 500); // 50% interest

      expect(interestHeavy.success && notInterestHeavy.success).toBe(true);
      if (interestHeavy.success && notInterestHeavy.success) {
        expect(isInterestHeavy(interestHeavy.data)).toBe(true);
        expect(isInterestHeavy(notInterestHeavy.data)).toBe(false);
      }
    });

    it("should handle edge cases for 60% threshold", () => {
      const exactly60Principal = createMonthlyPayment(600, 400); // 60% principal
      const exactly60Interest = createMonthlyPayment(400, 600); // 60% interest

      expect(exactly60Principal.success && exactly60Interest.success).toBe(
        true,
      );
      if (exactly60Principal.success && exactly60Interest.success) {
        expect(isPrincipalHeavy(exactly60Principal.data)).toBe(false); // > 60%, not >= 60%
        expect(isInterestHeavy(exactly60Interest.data)).toBe(false); // > 60%, not >= 60%
      }
    });
  });

  describe("zero payment utility", () => {
    it("should create zero monthly payment", () => {
      const zero = createZeroMonthlyPayment();
      expect(getPrincipalAmount(zero)).toBe(0);
      expect(getInterestAmount(zero)).toBe(0);
      expect(getTotalAmount(zero)).toBe(0);
    });
  });

  describe("property-based testing", () => {
    it("should maintain total = principal + interest invariant", () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100000, noNaN: true }),
          fc.double({ min: 0, max: 100000, noNaN: true }),
          (principal, interest) => {
            const result = createMonthlyPayment(principal, interest);
            if (result.success) {
              const total = getTotalAmount(result.data);
              const calculatedTotal =
                getPrincipalAmount(result.data) +
                getInterestAmount(result.data);
              expect(total).toBeCloseTo(calculatedTotal, 10);
            }
          },
        ),
      );
    });

    it("should maintain percentage invariants", () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 100000, noNaN: true }),
          fc.double({ min: 0.01, max: 100000, noNaN: true }),
          (principal, interest) => {
            const result = createMonthlyPayment(principal, interest);
            if (result.success) {
              const principalPct = getPrincipalPercentage(result.data);
              const interestPct = getInterestPercentage(result.data);

              // Percentages should be between 0 and 100
              expect(principalPct).toBeGreaterThanOrEqual(0);
              expect(principalPct).toBeLessThanOrEqual(100);
              expect(interestPct).toBeGreaterThanOrEqual(0);
              expect(interestPct).toBeLessThanOrEqual(100);

              // Percentages should sum to 100
              expect(principalPct + interestPct).toBeCloseTo(100, 10);
            }
          },
        ),
      );
    });

    it("should maintain arithmetic operation correctness", () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 50000, noNaN: true }), // Avoid very small numbers that cause precision issues
          fc.double({ min: 0.01, max: 50000, noNaN: true }),
          fc.double({ min: 0.01, max: 50000, noNaN: true }),
          fc.double({ min: 0.01, max: 50000, noNaN: true }),
          (p1, i1, p2, i2) => {
            const payment1 = createMonthlyPayment(p1, i1);
            const payment2 = createMonthlyPayment(p2, i2);

            if (payment1.success && payment2.success) {
              const sum = addMonthlyPayments(payment1.data, payment2.data);
              if (sum.success) {
                // Create Money objects for expected values to use proper arithmetic
                const principal1Money = createMoney(p1);
                const interest1Money = createMoney(i1);
                const principal2Money = createMoney(p2);
                const interest2Money = createMoney(i2);

                if (
                  principal1Money.success &&
                  interest1Money.success &&
                  principal2Money.success &&
                  interest2Money.success
                ) {
                  const expectedPrincipalResult = addMoney(
                    principal1Money.data,
                    principal2Money.data,
                  );
                  const expectedInterestResult = addMoney(
                    interest1Money.data,
                    interest2Money.data,
                  );

                  if (
                    expectedPrincipalResult.success &&
                    expectedInterestResult.success
                  ) {
                    const expectedPrincipal = toEuros(
                      expectedPrincipalResult.data,
                    );
                    const expectedInterest = toEuros(
                      expectedInterestResult.data,
                    );
                    const expectedTotal = expectedPrincipal + expectedInterest;

                    expect(getPrincipalAmount(sum.data)).toBeCloseTo(
                      expectedPrincipal,
                      2,
                    );
                    expect(getInterestAmount(sum.data)).toBeCloseTo(
                      expectedInterest,
                      2,
                    );
                    expect(getTotalAmount(sum.data)).toBeCloseTo(
                      expectedTotal,
                      2,
                    );
                  }
                }
              }
            }
          },
        ),
      );
    });

    it("should maintain comparison transitivity", () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          fc.double({ min: 0, max: 10000, noNaN: true }),
          (p1, i1, p2, i2, p3, i3) => {
            const payment1 = createMonthlyPayment(p1, i1);
            const payment2 = createMonthlyPayment(p2, i2);
            const payment3 = createMonthlyPayment(p3, i3);

            if (payment1.success && payment2.success && payment3.success) {
              const cmp12 = compareMonthlyPayments(
                payment1.data,
                payment2.data,
              );
              const cmp23 = compareMonthlyPayments(
                payment2.data,
                payment3.data,
              );
              const cmp13 = compareMonthlyPayments(
                payment1.data,
                payment3.data,
              );

              // If payment1 <= payment2 and payment2 <= payment3, then payment1 <= payment3
              if (cmp12 <= 0 && cmp23 <= 0) {
                expect(cmp13).toBeLessThanOrEqual(0);
              }
            }
          },
        ),
      );
    });

    it("should handle realistic mortgage payment scenario: €100,000 at 5.6% for 7 years", () => {
      // Calculate monthly payment for €100,000 loan at 5.6% for 7 years (84 months)
      // Using standard loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
      const loanAmount = 100000;
      const annualRate = 0.056;
      const monthlyRate = annualRate / 12;
      const numberOfPayments = 7 * 12; // 84 months

      const monthlyPayment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      // For month 1 of a 7-year loan, calculate interest and principal
      const firstMonthInterest = loanAmount * monthlyRate;
      const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

      const payment = createMonthlyPayment(
        firstMonthPrincipal,
        firstMonthInterest,
      );
      expect(payment.success).toBe(true);

      if (payment.success) {
        const paymentData = payment.data;

        // Verify the total equals the calculated monthly payment
        expect(getTotalAmount(paymentData)).toBeCloseTo(monthlyPayment, 2);

        // Validate against real-world data: ~€1,460/month for this loan
        expect(getTotalAmount(paymentData)).toBeGreaterThan(1400);
        expect(getTotalAmount(paymentData)).toBeLessThan(1500);

        // Verify components add up correctly
        expect(getTotalAmount(paymentData)).toBeCloseTo(
          getPrincipalAmount(paymentData) + getInterestAmount(paymentData),
          2,
        );

        // For a 7-year loan (short term), principal is actually higher than interest from the start
        // This is different from longer loans (15-30 years) where interest dominates early payments
        expect(getPrincipalAmount(paymentData)).toBeGreaterThan(
          getInterestAmount(paymentData),
        );
        expect(isPrincipalHeavy(paymentData)).toBe(true);
        expect(isInterestHeavy(paymentData)).toBe(false);

        // Percentages should sum to 100%
        const principalPct = getPrincipalPercentage(paymentData);
        const interestPct = getInterestPercentage(paymentData);
        expect(principalPct + interestPct).toBeCloseTo(100, 1);

        // For a 7-year loan, expect principal to be the larger portion (~67% vs ~33%)
        expect(principalPct).toBeGreaterThan(60); // Principal dominates
        expect(interestPct).toBeLessThan(40); // Interest is smaller portion

        // Formatting should work without errors
        expect(() => formatMonthlyPayment(paymentData)).not.toThrow();
        expect(() => formatMonthlyPaymentBreakdown(paymentData)).not.toThrow();

        // Verify German formatting in output
        const formatted = formatMonthlyPayment(paymentData);
        expect(formatted).toContain("€");
        expect(formatted).toContain("Monatliche Rate");
        expect(formatted).toContain("Tilgung");
        expect(formatted).toContain("Zinsen");
      }
    });

    it("should handle realistic smaller loan scenario: €15,000 at 8% for 10 years", () => {
      // Calculate monthly payment for €15,000 loan at 8% for 10 years (120 months)
      // Using standard loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
      const loanAmount = 15000;
      const annualRate = 0.08;
      const monthlyRate = annualRate / 12;
      const numberOfPayments = 10 * 12; // 120 months

      const monthlyPayment =
        (loanAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      // For month 1 of a 10-year loan, calculate interest and principal
      const firstMonthInterest = loanAmount * monthlyRate;
      const firstMonthPrincipal = monthlyPayment - firstMonthInterest;

      const payment = createMonthlyPayment(
        firstMonthPrincipal,
        firstMonthInterest,
      );
      expect(payment.success).toBe(true);

      if (payment.success) {
        const paymentData = payment.data;

        // Verify the total equals the calculated monthly payment
        expect(getTotalAmount(paymentData)).toBeCloseTo(monthlyPayment, 2);

        // Expected monthly payment should be around €182 with 8% interest rate
        expect(getTotalAmount(paymentData)).toBeGreaterThan(180);
        expect(getTotalAmount(paymentData)).toBeLessThan(185);

        // Verify components add up correctly
        expect(getTotalAmount(paymentData)).toBeCloseTo(
          getPrincipalAmount(paymentData) + getInterestAmount(paymentData),
          2,
        );

        // For a 10-year loan at 8% interest, the higher rate makes interest the larger portion
        // Unlike lower rates where principal dominates even for medium-term loans
        expect(getInterestAmount(paymentData)).toBeGreaterThan(
          getPrincipalAmount(paymentData),
        );
        // Interest is ~55%, which is > 50% but < 60%, so not "heavy" by our definition
        expect(isInterestHeavy(paymentData)).toBe(false); // Needs > 60% to be "heavy"
        expect(isPrincipalHeavy(paymentData)).toBe(false); // Neither is > 60%

        // Percentages should sum to 100%
        const principalPct = getPrincipalPercentage(paymentData);
        const interestPct = getInterestPercentage(paymentData);
        expect(principalPct + interestPct).toBeCloseTo(100, 1);

        // For 8% interest rate: interest ~55%, principal ~45%
        expect(interestPct).toBeGreaterThan(54); // Interest dominates
        expect(principalPct).toBeLessThan(46); // Principal is smaller portion

        // Verify specific amounts match calculation: €100 interest, €82 principal
        expect(getInterestAmount(paymentData)).toBeCloseTo(100, 1);
        expect(getPrincipalAmount(paymentData)).toBeCloseTo(82, 1);

        // Formatting should work without errors
        expect(() => formatMonthlyPayment(paymentData)).not.toThrow();
        expect(() => formatMonthlyPaymentBreakdown(paymentData)).not.toThrow();

        // Verify German formatting in output
        const formatted = formatMonthlyPayment(paymentData);
        expect(formatted).toContain("€");
        expect(formatted).toContain("Monatliche Rate");
        expect(formatted).toContain("Tilgung");
        expect(formatted).toContain("Zinsen");
      }
    });
  });
});
