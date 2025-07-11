import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  SondertilgungPlan,
  SondertilgungLimit,
  createPercentageLimit,
  createUnlimitedLimit,
  createSondertilgungPlan,
  getYearlyPaymentSummaries,
  canAddPayment,
  getRemainingYearlyLimit,
  addPaymentToPlan,
  removePaymentFromPlan,
  getTotalExtraPayments,
  formatSondertilgungLimit,
  formatSondertilgungPlan,
  type SondertilgungValidationError,
} from "../../../../domain/types/SondertilgungPlan";
import { createExtraPayment } from "../../../../domain/types/ExtraPayment";
import { createPaymentMonth } from "../../../../domain/types/PaymentMonth";
import { createLoanAmount } from "../../../../domain/types/LoanAmount";
import { createPercentage } from "../../../../domain/types/Percentage";
import { toEuros } from "../../../../domain/types/Money";

describe("SondertilgungPlan Domain", () => {
  describe("SondertilgungLimit creation", () => {
    it("should create percentage-based limits", () => {
      const percentageResult = createPercentage(5);
      expect(percentageResult.success).toBe(true);

      if (percentageResult.success) {
        const limit = createPercentageLimit(percentageResult.data);
        expect(limit.type).toBe("Percentage");
        if (limit.type === "Percentage") {
          expect(limit.value).toBe(percentageResult.data);
        }
      }
    });

    it("should create unlimited limits", () => {
      const limit = createUnlimitedLimit();
      expect(limit.type).toBe("Unlimited");
    });
  });

  describe("SondertilgungPlan creation", () => {
    it("should create valid plan with percentage limit", () => {
      const loanAmountResult = createLoanAmount(200000);
      const percentageResult = createPercentage(5);
      const month1Result = createPaymentMonth(12);
      const month2Result = createPaymentMonth(24);

      expect(month1Result.success && month2Result.success).toBe(true);
      if (!month1Result.success || !month2Result.success) return;

      const payment1Result = createExtraPayment(month1Result.data, 5000);
      const payment2Result = createExtraPayment(month2Result.data, 5000);

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          expect(planResult.data.payments.length).toBe(2);
          expect(planResult.data.yearlyLimit.type).toBe("Percentage");
        }
      }
    });

    it("should create valid plan with unlimited limit", () => {
      const loanAmountResult = createLoanAmount(200000);
      const payment1Result = createExtraPayment(6, 20000);
      const payment2Result = createExtraPayment(18, 30000);

      expect(loanAmountResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          expect(planResult.data.payments.length).toBe(2);
          expect(planResult.data.yearlyLimit.type).toBe("Unlimited");
        }
      }
    });

    it("should reject plan with no payments", () => {
      const loanAmountResult = createLoanAmount(200000);
      const percentageResult = createPercentage(5);

      expect(loanAmountResult.success && percentageResult.success).toBe(true);

      if (loanAmountResult.success && percentageResult.success) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(false);
        if (!planResult.success) {
          expect(planResult.error).toBe("NoPayments");
        }
      }
    });

    it("should reject plan with duplicate payment months", () => {
      const loanAmountResult = createLoanAmount(200000);
      const percentageResult = createPercentage(5);
      const payment1Result = createExtraPayment(12, 5000);
      const payment2Result = createExtraPayment(12, 3000); // Same month

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(false);
        if (!planResult.success) {
          expect(planResult.error).toBe("DuplicatePaymentMonth");
        }
      }
    });

    it("should reject plan exceeding yearly percentage limit", () => {
      const loanAmountResult = createLoanAmount(200000); // €200,000 loan
      const percentageResult = createPercentage(5); // 5% = €10,000 per year max
      // Both payments in year 1 (months 1-12), totaling €15,000 > €10,000 limit
      const payment1Result = createExtraPayment(6, 8000);
      const payment2Result = createExtraPayment(12, 7000);

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(false);
        if (!planResult.success) {
          expect(planResult.error).toBe("ExceedsYearlyLimit");
        }
      }
    });
  });

  describe("yearly payment analysis", () => {
    it("should calculate yearly payment summaries correctly", () => {
      const loanAmountResult = createLoanAmount(200000);
      const payment1Result = createExtraPayment(6, 5000); // Year 1
      const payment2Result = createExtraPayment(12, 3000); // Year 1
      const payment3Result = createExtraPayment(18, 7000); // Year 2
      const payment4Result = createExtraPayment(36, 4000); // Year 3

      expect(loanAmountResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);
      expect(payment3Result.success && payment4Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        payment1Result.success &&
        payment2Result.success &&
        payment3Result.success &&
        payment4Result.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [
            payment1Result.data,
            payment2Result.data,
            payment3Result.data,
            payment4Result.data,
          ],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const summaries = getYearlyPaymentSummaries(planResult.data);

          expect(summaries.length).toBe(3); // 3 years with payments

          // Year 1: 2 payments totaling €8,000
          const year1 = summaries.find((s) => s.year === 1);
          expect(year1).toBeDefined();
          if (year1) {
            expect(toEuros(year1.totalAmount)).toBe(8000);
            expect(year1.paymentCount).toBe(2);
            expect(toEuros(year1.averagePayment)).toBe(4000);
          }

          // Year 2: 1 payment of €7,000
          const year2 = summaries.find((s) => s.year === 2);
          expect(year2).toBeDefined();
          if (year2) {
            expect(toEuros(year2.totalAmount)).toBe(7000);
            expect(year2.paymentCount).toBe(1);
            expect(toEuros(year2.averagePayment)).toBe(7000);
          }

          // Year 3: 1 payment of €4,000
          const year3 = summaries.find((s) => s.year === 3);
          expect(year3).toBeDefined();
          if (year3) {
            expect(toEuros(year3.totalAmount)).toBe(4000);
            expect(year3.paymentCount).toBe(1);
            expect(toEuros(year3.averagePayment)).toBe(4000);
          }
        }
      }
    });
  });

  describe("payment addition validation", () => {
    it("should allow adding payment within unlimited limit", () => {
      const loanAmountResult = createLoanAmount(200000);
      const existingPaymentResult = createExtraPayment(6, 5000);
      const newPaymentResult = createExtraPayment(12, 10000);

      expect(loanAmountResult.success).toBe(true);
      expect(existingPaymentResult.success && newPaymentResult.success).toBe(
        true
      );

      if (
        loanAmountResult.success &&
        existingPaymentResult.success &&
        newPaymentResult.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [existingPaymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const canAdd = canAddPayment(
            planResult.data,
            newPaymentResult.data,
            loanAmountResult.data
          );
          expect(canAdd).toBe(true);
        }
      }
    });

    it("should allow adding payment within percentage limit", () => {
      const loanAmountResult = createLoanAmount(200000); // €200,000
      const percentageResult = createPercentage(5); // 5% = €10,000 per year
      const existingPaymentResult = createExtraPayment(6, 4000); // €4,000 in year 1
      const newPaymentResult = createExtraPayment(12, 5000); // €5,000 more in year 1 = €9,000 total < €10,000

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(existingPaymentResult.success && newPaymentResult.success).toBe(
        true
      );

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        existingPaymentResult.success &&
        newPaymentResult.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [existingPaymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const canAdd = canAddPayment(
            planResult.data,
            newPaymentResult.data,
            loanAmountResult.data
          );
          expect(canAdd).toBe(true);
        }
      }
    });

    it("should reject adding payment that exceeds percentage limit", () => {
      const loanAmountResult = createLoanAmount(200000); // €200,000
      const percentageResult = createPercentage(5); // 5% = €10,000 per year
      const existingPaymentResult = createExtraPayment(6, 7000); // €7,000 in year 1
      const newPaymentResult = createExtraPayment(12, 5000); // €5,000 more = €12,000 total > €10,000

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(existingPaymentResult.success && newPaymentResult.success).toBe(
        true
      );

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        existingPaymentResult.success &&
        newPaymentResult.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [existingPaymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const canAdd = canAddPayment(
            planResult.data,
            newPaymentResult.data,
            loanAmountResult.data
          );
          expect(canAdd).toBe(false);
        }
      }
    });
  });

  describe("remaining yearly limit calculation", () => {
    it("should return null for unlimited plans", () => {
      const loanAmountResult = createLoanAmount(200000);
      const paymentResult = createExtraPayment(6, 5000);

      expect(loanAmountResult.success && paymentResult.success).toBe(true);

      if (loanAmountResult.success && paymentResult.success) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [paymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const remaining = getRemainingYearlyLimit(
            planResult.data,
            1,
            loanAmountResult.data
          );
          expect(remaining).toBeNull();
        }
      }
    });

    it("should calculate remaining limit for percentage plans", () => {
      const loanAmountResult = createLoanAmount(200000); // €200,000
      const percentageResult = createPercentage(5); // 5% = €10,000 per year
      const paymentResult = createExtraPayment(6, 3000); // €3,000 used in year 1

      expect(
        loanAmountResult.success &&
          percentageResult.success &&
          paymentResult.success
      ).toBe(true);

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        paymentResult.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [paymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const remaining = getRemainingYearlyLimit(
            planResult.data,
            1,
            loanAmountResult.data
          );
          expect(remaining).not.toBeNull();
          if (remaining !== null) {
            expect(toEuros(remaining)).toBe(7000); // €10,000 - €3,000 = €7,000
          }
        }
      }
    });

    it("should return zero when limit is fully used", () => {
      const loanAmountResult = createLoanAmount(200000); // €200,000
      const percentageResult = createPercentage(5); // 5% = €10,000 per year
      const payment1Result = createExtraPayment(6, 6000);
      const payment2Result = createExtraPayment(12, 4000); // Total €10,000 in year 1

      expect(loanAmountResult.success && percentageResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        percentageResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createPercentageLimit(percentageResult.data);
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const remaining = getRemainingYearlyLimit(
            planResult.data,
            1,
            loanAmountResult.data
          );
          expect(remaining).not.toBeNull();
          if (remaining !== null) {
            expect(toEuros(remaining)).toBe(0);
          }
        }
      }
    });
  });

  describe("plan modification", () => {
    it("should add payment to plan successfully", () => {
      const loanAmountResult = createLoanAmount(200000);
      const existingPaymentResult = createExtraPayment(6, 5000);
      const newPaymentResult = createExtraPayment(18, 7000);

      expect(loanAmountResult.success).toBe(true);
      expect(existingPaymentResult.success && newPaymentResult.success).toBe(
        true
      );

      if (
        loanAmountResult.success &&
        existingPaymentResult.success &&
        newPaymentResult.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [existingPaymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const updatedPlanResult = addPaymentToPlan(
            planResult.data,
            newPaymentResult.data,
            loanAmountResult.data
          );

          expect(updatedPlanResult.success).toBe(true);
          if (updatedPlanResult.success) {
            expect(updatedPlanResult.data.payments.length).toBe(2);
            // Should be sorted by month
            expect(updatedPlanResult.data.payments[0].month).toBe(6);
            expect(updatedPlanResult.data.payments[1].month).toBe(18);
          }
        }
      }
    });

    it("should reject adding payment for duplicate month", () => {
      const loanAmountResult = createLoanAmount(200000);
      const existingPaymentResult = createExtraPayment(6, 5000);
      const duplicatePaymentResult = createExtraPayment(6, 3000); // Same month

      expect(loanAmountResult.success).toBe(true);
      expect(
        existingPaymentResult.success && duplicatePaymentResult.success
      ).toBe(true);

      if (
        loanAmountResult.success &&
        existingPaymentResult.success &&
        duplicatePaymentResult.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [existingPaymentResult.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const updatedPlanResult = addPaymentToPlan(
            planResult.data,
            duplicatePaymentResult.data,
            loanAmountResult.data
          );

          expect(updatedPlanResult.success).toBe(false);
          if (!updatedPlanResult.success) {
            expect(updatedPlanResult.error).toBe("DuplicatePaymentMonth");
          }
        }
      }
    });

    it("should remove payment from plan", () => {
      const loanAmountResult = createLoanAmount(200000);
      const payment1Result = createExtraPayment(6, 5000);
      const payment2Result = createExtraPayment(18, 7000);

      expect(loanAmountResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const updatedPlan = removePaymentFromPlan(planResult.data, 6);
          expect(updatedPlan.payments.length).toBe(1);
          expect(updatedPlan.payments[0].month).toBe(18);
        }
      }
    });
  });

  describe("total calculations", () => {
    it("should calculate total extra payments correctly", () => {
      const loanAmountResult = createLoanAmount(200000);
      const payment1Result = createExtraPayment(6, 5000);
      const payment2Result = createExtraPayment(18, 7000);
      const payment3Result = createExtraPayment(30, 3000);

      expect(loanAmountResult.success).toBe(true);
      expect(
        payment1Result.success &&
          payment2Result.success &&
          payment3Result.success
      ).toBe(true);

      if (
        loanAmountResult.success &&
        payment1Result.success &&
        payment2Result.success &&
        payment3Result.success
      ) {
        const limit = createUnlimitedLimit();
        const planResult = createSondertilgungPlan(
          limit,
          [payment1Result.data, payment2Result.data, payment3Result.data],
          loanAmountResult.data
        );

        expect(planResult.success).toBe(true);
        if (planResult.success) {
          const total = getTotalExtraPayments(planResult.data);
          expect(toEuros(total)).toBe(15000); // €5,000 + €7,000 + €3,000
        }
      }
    });
  });

  describe("formatting", () => {
    it("should format percentage limits correctly", () => {
      const percentageResult = createPercentage(5);
      expect(percentageResult.success).toBe(true);

      if (percentageResult.success) {
        const limit = createPercentageLimit(percentageResult.data);
        const formatted = formatSondertilgungLimit(limit);
        expect(formatted).toBe("Maximal 5% der Darlehenssumme pro Jahr");
      }
    });

    it("should format unlimited limits correctly", () => {
      const limit = createUnlimitedLimit();
      const formatted = formatSondertilgungLimit(limit);
      expect(formatted).toBe("Unbegrenzte Sondertilgungen");
    });

    it("should format plan summaries correctly", () => {
      const loanAmountResult = createLoanAmount(200000);
      const payment1Result = createExtraPayment(6, 5000);
      const payment2Result = createExtraPayment(18, 7000);

      expect(loanAmountResult.success).toBe(true);
      expect(payment1Result.success && payment2Result.success).toBe(true);

      if (
        loanAmountResult.success &&
        payment1Result.success &&
        payment2Result.success
      ) {
        const percentageResult = createPercentage(5);
        expect(percentageResult.success).toBe(true);

        if (percentageResult.success) {
          const limit = createPercentageLimit(percentageResult.data);
          const planResult = createSondertilgungPlan(
            limit,
            [payment1Result.data, payment2Result.data],
            loanAmountResult.data
          );

          expect(planResult.success).toBe(true);
          if (planResult.success) {
            const formatted = formatSondertilgungPlan(planResult.data);
            expect(formatted).toContain("2 Zahlungen");
            expect(formatted).toContain("12000.00");
            expect(formatted).toContain(
              "Maximal 5% der Darlehenssumme pro Jahr"
            );
          }
        }
      }
    });
  });

  describe("German market business rules", () => {
    it("should handle typical German mortgage Sondertilgung scenarios", () => {
      // Typical scenario: €300,000 mortgage with 5% yearly Sondertilgung limit
      const loanAmountResult = createLoanAmount(300000);
      const percentageResult = createPercentage(5); // Common bank limit

      expect(loanAmountResult.success && percentageResult.success).toBe(true);

      if (loanAmountResult.success && percentageResult.success) {
        const limit = createPercentageLimit(percentageResult.data);

        // Yearly limit should be €15,000
        const payment1Result = createExtraPayment(6, 10000); // €10,000 mid-year
        const payment2Result = createExtraPayment(12, 5000); // €5,000 end of year = €15,000 total

        expect(payment1Result.success && payment2Result.success).toBe(true);

        if (payment1Result.success && payment2Result.success) {
          const planResult = createSondertilgungPlan(
            limit,
            [payment1Result.data, payment2Result.data],
            loanAmountResult.data
          );

          expect(planResult.success).toBe(true);
          if (planResult.success) {
            const remaining = getRemainingYearlyLimit(
              planResult.data,
              1,
              loanAmountResult.data
            );
            expect(remaining).not.toBeNull();
            if (remaining !== null) {
              expect(toEuros(remaining)).toBe(0); // Fully used
            }
          }
        }
      }
    });

    it("should validate against common bank percentage limits", () => {
      const commonLimits = [5, 10]; // Common German bank limits: 5% or 10%
      const loanAmountResult = createLoanAmount(250000);

      expect(loanAmountResult.success).toBe(true);

      if (loanAmountResult.success) {
        commonLimits.forEach((limitPercentage) => {
          const percentageResult = createPercentage(limitPercentage);
          expect(percentageResult.success).toBe(true);

          if (percentageResult.success) {
            const limit = createPercentageLimit(percentageResult.data);
            const expectedMaxYearly = 250000 * (limitPercentage / 100);

            // Test with payment exactly at limit
            const maxPaymentResult = createExtraPayment(12, expectedMaxYearly);
            expect(maxPaymentResult.success).toBe(true);

            if (maxPaymentResult.success) {
              const planResult = createSondertilgungPlan(
                limit,
                [maxPaymentResult.data],
                loanAmountResult.data
              );
              expect(planResult.success).toBe(true);
            }
          }
        });
      }
    });
  });

  describe("property-based testing", () => {
    it("should maintain yearly limit invariants", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50000, max: 1000000 }), // Loan amount
          fc.integer({ min: 1, max: 20 }), // Percentage
          fc.array(
            fc.record({
              month: fc.integer({ min: 1, max: 120 }),
              amount: fc.integer({ min: 100, max: 5000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (loanAmount, percentage, rawPayments) => {
            const loanAmountResult = createLoanAmount(loanAmount);
            const percentageResult = createPercentage(percentage);

            if (!loanAmountResult.success || !percentageResult.success) return;

            // Create unique months to avoid duplicates
            const uniquePayments = rawPayments.filter(
              (payment, index, arr) =>
                arr.findIndex((p) => p.month === payment.month) === index
            );

            const payments = uniquePayments
              .map((p) => createExtraPayment(p.month, p.amount))
              .filter((result) => result.success)
              .map((result) => result.data);

            if (payments.length === 0) return;

            const limit = createPercentageLimit(percentageResult.data);
            const planResult = createSondertilgungPlan(
              limit,
              payments,
              loanAmountResult.data
            );

            if (planResult.success) {
              // Verify yearly totals don't exceed limit
              const summaries = getYearlyPaymentSummaries(planResult.data);
              const maxYearlyAmount = loanAmount * (percentage / 100);

              summaries.forEach((summary) => {
                expect(toEuros(summary.totalAmount)).toBeLessThanOrEqual(
                  maxYearlyAmount
                );
              });
            }
          }
        )
      );
    });
  });
});
