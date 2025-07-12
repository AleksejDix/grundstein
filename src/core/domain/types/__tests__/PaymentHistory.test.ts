/**
 * Comprehensive tests for PaymentHistory domain type
 *
 * Tests cover:
 * - Payment record creation and validation
 * - Payment history management
 * - German banking payment standards
 * - Payment status determination
 * - Statistical analysis and reporting
 * - Good standing assessment
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createPaymentHistory,
  createPaymentRecord,
  addPaymentRecord,
  updatePaymentRecord,
  getLoanId,
  getPaymentRecords,
  getStartDate,
  getPaymentRecord,
  calculateTotalPaymentsMade,
  calculateTotalScheduledPayments,
  calculatePaymentVariance,
  getPaymentStatistics,
  getPaymentsByStatus,
  getPaymentsInDateRange,
  isInGoodStanding,
  calculateDaysLate,
  formatPaymentRecord,
  getPaymentStatusDescription,
  getPaymentMethodDescription,
  exportPaymentSummary,
  getMaxLateDays,
  getMinPartialPaymentPercent,
  type PaymentStatus,
  type PaymentMethod,
} from "../PaymentHistory";
import { createMonthlyPayment } from "../MonthlyPayment";
import { toEuros } from "../../value-objects/Money";

describe("PaymentHistory", () => {
  let testStartDate: Date;
  let testLoanId: string;
  let sampleScheduledPayment: any;

  beforeEach(() => {
    testStartDate = new Date("2023-01-01");
    testLoanId = "LOAN-123456";

    // Create sample scheduled payment
    const paymentResult = createMonthlyPayment(1200, 800); // €1200 principal, €800 interest
    expect(paymentResult.success).toBe(true);
    sampleScheduledPayment = paymentResult.success ? paymentResult.data : null;
  });

  describe("createPaymentHistory", () => {
    it("should create empty payment history", () => {
      const result = createPaymentHistory(testLoanId, testStartDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getLoanId(result.data)).toBe(testLoanId);
        expect(getStartDate(result.data)).toEqual(testStartDate);
        expect(getPaymentRecords(result.data)).toHaveLength(0);
      }
    });

    it("should create payment history with initial payments", () => {
      const paymentRecord1Result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000, // Actual payment
        new Date("2023-01-15"),
        "SEPA_DirectDebit"
      );
      expect(paymentRecord1Result.success).toBe(true);

      const paymentRecord2Result = createPaymentRecord(
        2,
        sampleScheduledPayment,
        2000,
        new Date("2023-02-15"),
        "SEPA_DirectDebit"
      );
      expect(paymentRecord2Result.success).toBe(true);

      if (paymentRecord1Result.success && paymentRecord2Result.success) {
        const result = createPaymentHistory(testLoanId, testStartDate, [
          paymentRecord1Result.data,
          paymentRecord2Result.data,
        ]);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPaymentRecords(result.data)).toHaveLength(2);
        }
      }
    });

    it("should reject invalid loan ID", () => {
      const result = createPaymentHistory("", testStartDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidLoanId");
      }
    });

    it("should reject start date too far in past", () => {
      const veryOldDate = new Date("2010-01-01");
      const result = createPaymentHistory(testLoanId, veryOldDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidStartDate");
      }
    });

    it("should reject future start date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = createPaymentHistory(testLoanId, futureDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidStartDate");
      }
    });
  });

  describe("createPaymentRecord", () => {
    it("should create payment record with all fields", () => {
      const paymentDate = new Date("2023-01-15");
      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        paymentDate,
        "SEPA_DirectDebit",
        500, // Extra payment
        "Regular payment with extra"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentDate).toEqual(paymentDate);
        expect(toEuros(result.data.actualPayment)).toBe(2000);
        expect(result.data.extraPayment).toBeDefined();
        if (result.data.extraPayment) {
          expect(toEuros(result.data.extraPayment)).toBe(500);
        }
        expect(result.data.notes).toBe("Regular payment with extra");
      }
    });

    it("should create payment record with minimal fields", () => {
      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15")
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentMethod).toBe("SEPA_DirectDebit"); // Default
        expect(result.data.extraPayment).toBeUndefined();
        expect(result.data.notes).toBeUndefined();
      }
    });

    it("should reject negative payment amount", () => {
      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        -100, // Negative amount
        new Date("2023-01-15")
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NegativePaymentAmount");
      }
    });

    it("should reject negative extra payment", () => {
      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15"),
        "SEPA_DirectDebit",
        -100 // Negative extra payment
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("NegativePaymentAmount");
      }
    });

    it("should reject future payment date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        futureDate
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("FuturePaymentDate");
      }
    });

    it("should determine correct payment status for different scenarios", () => {
      const testCases = [
        { actualAmount: 2000, expectedStatus: "OnTime" as PaymentStatus }, // Exact amount
        { actualAmount: 2100, expectedStatus: "Overpaid" as PaymentStatus }, // Overpaid
        { actualAmount: 1000, expectedStatus: "Partial" as PaymentStatus }, // Partial (50%)
        { actualAmount: 100, expectedStatus: "Missed" as PaymentStatus }, // Too little (5%)
        { actualAmount: 0, expectedStatus: "Missed" as PaymentStatus }, // No payment
      ];

      testCases.forEach(({ actualAmount, expectedStatus }) => {
        const result = createPaymentRecord(
          1,
          sampleScheduledPayment,
          actualAmount,
          new Date("2023-01-15")
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.paymentStatus).toBe(expectedStatus);
        }
      });
    });
  });

  describe("payment history management", () => {
    let paymentHistory: any;

    beforeEach(() => {
      const historyResult = createPaymentHistory(testLoanId, testStartDate);
      expect(historyResult.success).toBe(true);
      paymentHistory = historyResult.success ? historyResult.data : null;
    });

    it("should add payment record to history", () => {
      const paymentRecordResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15")
      );
      expect(paymentRecordResult.success).toBe(true);

      if (paymentRecordResult.success) {
        const result = addPaymentRecord(
          paymentHistory,
          paymentRecordResult.data
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPaymentRecords(result.data)).toHaveLength(1);
          expect(getPaymentRecord(result.data, 1)).toBeDefined();
        }
      }
    });

    it("should reject duplicate payment month", () => {
      const paymentRecord1Result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15")
      );
      expect(paymentRecord1Result.success).toBe(true);

      const paymentRecord2Result = createPaymentRecord(
        1, // Same month
        sampleScheduledPayment,
        1500,
        new Date("2023-01-20")
      );
      expect(paymentRecord2Result.success).toBe(true);

      if (paymentRecord1Result.success && paymentRecord2Result.success) {
        const firstAddResult = addPaymentRecord(
          paymentHistory,
          paymentRecord1Result.data
        );
        expect(firstAddResult.success).toBe(true);

        if (firstAddResult.success) {
          const secondAddResult = addPaymentRecord(
            firstAddResult.data,
            paymentRecord2Result.data
          );
          expect(secondAddResult.success).toBe(false);
          if (!secondAddResult.success) {
            expect(secondAddResult.error).toBe("DuplicatePaymentMonth");
          }
        }
      }
    });

    it("should update existing payment record", () => {
      const paymentRecordResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15")
      );
      expect(paymentRecordResult.success).toBe(true);

      if (paymentRecordResult.success) {
        const addResult = addPaymentRecord(
          paymentHistory,
          paymentRecordResult.data
        );
        expect(addResult.success).toBe(true);

        if (addResult.success) {
          const updateResult = updatePaymentRecord(addResult.data, 1, {
            paymentStatus: "Late",
            notes: "Payment was delayed",
          });

          expect(updateResult.success).toBe(true);
          if (updateResult.success) {
            const updatedRecord = getPaymentRecord(updateResult.data, 1);
            expect(updatedRecord?.paymentStatus).toBe("Late");
            expect(updatedRecord?.notes).toBe("Payment was delayed");
          }
        }
      }
    });

    it("should sort payments by month", () => {
      const payment3Result = createPaymentRecord(
        3,
        sampleScheduledPayment,
        2000,
        new Date("2023-03-15")
      );
      const payment1Result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15")
      );
      const payment2Result = createPaymentRecord(
        2,
        sampleScheduledPayment,
        2000,
        new Date("2023-02-15")
      );

      expect(payment1Result.success).toBe(true);
      expect(payment2Result.success).toBe(true);
      expect(payment3Result.success).toBe(true);

      if (
        payment1Result.success &&
        payment2Result.success &&
        payment3Result.success
      ) {
        let history = paymentHistory;

        history = addPaymentRecord(history, payment3Result.data).data; // Add month 3 first
        history = addPaymentRecord(history, payment1Result.data).data; // Add month 1
        history = addPaymentRecord(history, payment2Result.data).data; // Add month 2

        const records = getPaymentRecords(history);
        expect(records).toHaveLength(3);
        expect(records[0].paymentMonth).toBe(payment1Result.data.paymentMonth); // Month 1
        expect(records[1].paymentMonth).toBe(payment2Result.data.paymentMonth); // Month 2
        expect(records[2].paymentMonth).toBe(payment3Result.data.paymentMonth); // Month 3
      }
    });
  });

  describe("payment calculations", () => {
    let historyWithPayments: any;

    beforeEach(() => {
      const historyResult = createPaymentHistory(testLoanId, testStartDate);
      expect(historyResult.success).toBe(true);

      if (historyResult.success) {
        let history = historyResult.data;

        // Add three payment records
        const payment1 = createPaymentRecord(
          1,
          sampleScheduledPayment,
          2000,
          new Date("2023-01-15")
        );
        const payment2 = createPaymentRecord(
          2,
          sampleScheduledPayment,
          1800,
          new Date("2023-02-15")
        ); // Partial
        const payment3 = createPaymentRecord(
          3,
          sampleScheduledPayment,
          2200,
          new Date("2023-03-15")
        ); // Overpaid

        expect(payment1.success && payment2.success && payment3.success).toBe(
          true
        );

        if (payment1.success && payment2.success && payment3.success) {
          history = addPaymentRecord(history, payment1.data).data;
          history = addPaymentRecord(history, payment2.data).data;
          history = addPaymentRecord(history, payment3.data).data;
        }

        historyWithPayments = history;
      }
    });

    it("should calculate total payments made", () => {
      const total = calculateTotalPaymentsMade(historyWithPayments);
      expect(toEuros(total)).toBe(6000); // 2000 + 1800 + 2200
    });

    it("should calculate total scheduled payments", () => {
      const total = calculateTotalScheduledPayments(historyWithPayments);
      expect(toEuros(total)).toBe(6000); // 3 * 2000
    });

    it("should calculate payment variance", () => {
      const variance = calculatePaymentVariance(historyWithPayments);
      expect(variance).toBe(0); // 6000 actual - 6000 scheduled
    });

    it("should calculate payment statistics", () => {
      const stats = getPaymentStatistics(historyWithPayments);

      expect(stats.totalPayments).toBe(3);
      expect(stats.onTimePayments).toBe(1); // Only first payment
      expect(stats.partialPayments).toBe(1); // Second payment
      expect(stats.overpayments).toBe(1); // Third payment
      expect(stats.averagePaymentAmount).toBe(2000); // 6000 / 3
      expect(stats.paymentConsistencyScore).toBe(67); // (1 + 1) / 3 * 100 = 67%
    });
  });

  describe("payment filtering and analysis", () => {
    let historyWithVariousPayments: any;

    beforeEach(() => {
      const historyResult = createPaymentHistory(testLoanId, testStartDate);
      expect(historyResult.success).toBe(true);

      if (historyResult.success) {
        let history = historyResult.data;

        // Create payments with different statuses
        const payments = [
          { month: 1, amount: 2000, date: "2023-01-15", status: "OnTime" },
          { month: 2, amount: 1800, date: "2023-02-15", status: "Partial" },
          { month: 3, amount: 0, date: "2023-03-15", status: "Missed" },
          { month: 4, amount: 2200, date: "2023-04-15", status: "Overpaid" },
        ];

        for (const payment of payments) {
          const paymentResult = createPaymentRecord(
            payment.month,
            sampleScheduledPayment,
            payment.amount,
            new Date(payment.date)
          );

          if (paymentResult.success) {
            // Update status if needed (since it's auto-determined)
            let record = paymentResult.data;
            if (record.paymentStatus !== payment.status) {
              record = {
                ...record,
                paymentStatus: payment.status as PaymentStatus,
              };
            }

            const addResult = addPaymentRecord(history, record);
            if (addResult.success) {
              history = addResult.data;
            }
          }
        }

        historyWithVariousPayments = history;
      }
    });

    it("should filter payments by status", () => {
      const onTimePayments = getPaymentsByStatus(
        historyWithVariousPayments,
        "OnTime"
      );
      const partialPayments = getPaymentsByStatus(
        historyWithVariousPayments,
        "Partial"
      );
      const missedPayments = getPaymentsByStatus(
        historyWithVariousPayments,
        "Missed"
      );

      expect(onTimePayments).toHaveLength(1);
      expect(partialPayments).toHaveLength(1);
      expect(missedPayments).toHaveLength(1);
    });

    it("should filter payments by date range", () => {
      const startDate = new Date("2023-02-01");
      const endDate = new Date("2023-03-31");

      const paymentsInRange = getPaymentsInDateRange(
        historyWithVariousPayments,
        startDate,
        endDate
      );

      expect(paymentsInRange).toHaveLength(2); // February and March payments
    });

    it("should determine good standing correctly", () => {
      // This history should not be in good standing due to missed payment
      expect(isInGoodStanding(historyWithVariousPayments)).toBe(false);
    });
  });

  describe("payment timing analysis", () => {
    it("should calculate days late correctly", () => {
      const dueDate = new Date("2023-01-15");
      const latePaymentDate = new Date("2023-01-20");

      const paymentRecordResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        latePaymentDate
      );
      expect(paymentRecordResult.success).toBe(true);

      if (paymentRecordResult.success) {
        // Manually set status to late for testing
        const lateRecord = {
          ...paymentRecordResult.data,
          paymentStatus: "Late" as PaymentStatus,
        };

        const daysLate = calculateDaysLate(lateRecord, dueDate);
        expect(daysLate).toBe(5); // 5 days late
      }
    });

    it("should return zero days late for on-time payments", () => {
      const dueDate = new Date("2023-01-15");
      const onTimePaymentDate = new Date("2023-01-15");

      const paymentRecordResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        onTimePaymentDate
      );
      expect(paymentRecordResult.success).toBe(true);

      if (paymentRecordResult.success) {
        const daysLate = calculateDaysLate(paymentRecordResult.data, dueDate);
        expect(daysLate).toBe(0);
      }
    });
  });

  describe("formatting and display", () => {
    it("should format payment record correctly", () => {
      const paymentRecordResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2100, // Overpaid
        new Date("2023-01-15"),
        "SEPA_DirectDebit",
        500 // Extra payment
      );
      expect(paymentRecordResult.success).toBe(true);

      if (paymentRecordResult.success) {
        const formatted = formatPaymentRecord(paymentRecordResult.data);

        expect(formatted).toContain("Monat 1");
        expect(formatted).toContain("2.100,00");
        expect(formatted).toContain("2.000,00"); // Scheduled
        expect(formatted).toContain("Überzahlung");
        expect(formatted).toContain("Sondertilgung");
        expect(formatted).toContain("500,00");
      }
    });

    it("should provide payment status descriptions in German", () => {
      const statuses: PaymentStatus[] = [
        "Scheduled",
        "OnTime",
        "Late",
        "Partial",
        "Overpaid",
        "Missed",
        "Reversed",
      ];

      const descriptions = statuses.map((status) =>
        getPaymentStatusDescription(status)
      );

      expect(descriptions).toEqual([
        "Geplant",
        "Pünktlich",
        "Verspätet",
        "Teilzahlung",
        "Überzahlung",
        "Ausgefallen",
        "Rückgängig",
      ]);
    });

    it("should provide payment method descriptions in German", () => {
      const methods: PaymentMethod[] = [
        "SEPA_DirectDebit",
        "BankTransfer",
        "OnlineBanking",
        "Standing_Order",
        "Cash",
        "Check",
      ];

      const descriptions = methods.map((method) =>
        getPaymentMethodDescription(method)
      );

      expect(descriptions).toEqual([
        "SEPA Lastschrift",
        "Überweisung",
        "Online Banking",
        "Dauerauftrag",
        "Bar",
        "Scheck",
      ]);
    });
  });

  describe("export and summary", () => {
    it("should export payment summary correctly", () => {
      const historyResult = createPaymentHistory(testLoanId, testStartDate);
      expect(historyResult.success).toBe(true);

      if (historyResult.success) {
        let history = historyResult.data;

        // Add a few payments
        const payment1 = createPaymentRecord(
          1,
          sampleScheduledPayment,
          2000,
          new Date("2023-01-15")
        );
        const payment2 = createPaymentRecord(
          2,
          sampleScheduledPayment,
          2000,
          new Date("2023-02-15")
        );

        if (payment1.success && payment2.success) {
          history = addPaymentRecord(history, payment1.data).data;
          history = addPaymentRecord(history, payment2.data).data;

          const summary = exportPaymentSummary(history);

          expect(summary.loanId).toBe(testLoanId);
          expect(summary.totalPayments).toBe(2);
          expect(summary.totalAmount).toBe(4000);
          expect(summary.averagePayment).toBe(2000);
          expect(summary.consistencyScore).toBe(100); // Both on-time
          expect(summary.goodStanding).toBe(true);
          expect(summary.lastPaymentDate).toEqual(new Date("2023-02-15"));
        }
      }
    });
  });

  describe("business constants", () => {
    it("should return correct business constants", () => {
      expect(getMaxLateDays()).toBe(90);
      expect(getMinPartialPaymentPercent()).toBe(10);
    });
  });

  describe("edge cases", () => {
    it("should handle empty payment history calculations", () => {
      const historyResult = createPaymentHistory(testLoanId, testStartDate);
      expect(historyResult.success).toBe(true);

      if (historyResult.success) {
        const total = calculateTotalPaymentsMade(historyResult.data);
        expect(toEuros(total)).toBe(0);

        const stats = getPaymentStatistics(historyResult.data);
        expect(stats.totalPayments).toBe(0);
        expect(stats.paymentConsistencyScore).toBe(0);

        expect(isInGoodStanding(historyResult.data)).toBe(true); // Empty is considered good
      }
    });

    it("should handle boundary payment amounts", () => {
      // Test minimum partial payment (10% of scheduled)
      const minPartialResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        200, // 10% of 2000
        new Date("2023-01-15")
      );
      expect(minPartialResult.success).toBe(true);
      if (minPartialResult.success) {
        expect(minPartialResult.data.paymentStatus).toBe("Partial");
      }

      // Test just below minimum (should be missed)
      const belowMinResult = createPaymentRecord(
        1,
        sampleScheduledPayment,
        150, // 7.5% of 2000
        new Date("2023-01-15")
      );
      expect(belowMinResult.success).toBe(true);
      if (belowMinResult.success) {
        expect(belowMinResult.data.paymentStatus).toBe("Missed");
      }
    });

    it("should handle payment record with zero extra payment", () => {
      const result = createPaymentRecord(
        1,
        sampleScheduledPayment,
        2000,
        new Date("2023-01-15"),
        "SEPA_DirectDebit",
        0 // Zero extra payment
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extraPayment).toBeDefined();
        if (result.data.extraPayment) {
          expect(toEuros(result.data.extraPayment)).toBe(0);
        }
      }
    });
  });
});
