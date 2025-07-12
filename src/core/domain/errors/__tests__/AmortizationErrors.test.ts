import { describe, it, expect } from "vitest";
import {
  createPaymentMonthCreationError,
  createMoneyCreationError,
  createMonthlyPaymentCalculationError,
  createPercentageValidationError,
  createRemainingMonthsCalculationError,
  createScheduleAnalysisError,
  formatAmortizationError,
  type AmortizationError,
  type PaymentMonthCreationError,
  type MoneyCreationError,
  type ScheduleAnalysisError,
} from "../AmortizationErrors";

describe("AmortizationErrors", () => {
  describe("createPaymentMonthCreationError", () => {
    it("should create payment month creation error", () => {
      const error = createPaymentMonthCreationError(
        500,
        "createPaymentMonth"
      );

      expect(error.type).toBe("PaymentMonthCreationError");
      expect(error.message).toContain("Failed to create payment month 500");
      expect(error.message).toContain("Must be between 1 and 480");
      expect(error.operation).toBe("createPaymentMonth");
      expect(error.context.monthNumber).toBe(500);
      expect(error.context.minAllowed).toBe(1);
      expect(error.context.maxAllowed).toBe(480);
    });

    it("should include cause error if provided", () => {
      const cause = {
        type: "ValidationError",
        message: "Invalid input",
        operation: "validate",
      };

      const error = createPaymentMonthCreationError(
        500,
        "createPaymentMonth",
        cause
      );

      expect(error.cause).toEqual(cause);
    });
  });

  describe("createMoneyCreationError", () => {
    it("should create money creation error for negative value", () => {
      const error = createMoneyCreationError(
        -100,
        "negative",
        "createMoney"
      );

      expect(error.type).toBe("MoneyCreationError");
      expect(error.message).toContain("Failed to create money value -100");
      expect(error.message).toContain("Reason: negative");
      expect(error.operation).toBe("createMoney");
      expect(error.context.value).toBe(-100);
      expect(error.context.reason).toBe("negative");
      expect(error.context.maxAllowed).toBeUndefined();
    });

    it("should create money creation error for exceeds maximum", () => {
      const error = createMoneyCreationError(
        1000000000,
        "exceeds_maximum",
        "createMoney"
      );

      expect(error.type).toBe("MoneyCreationError");
      expect(error.context.reason).toBe("exceeds_maximum");
      expect(error.context.maxAllowed).toBe(999_999_999);
    });

    it("should create money creation error for invalid value", () => {
      const error = createMoneyCreationError(
        NaN,
        "invalid",
        "createMoney"
      );

      expect(error.type).toBe("MoneyCreationError");
      expect(error.context.reason).toBe("invalid");
      expect(error.context.value).toBeNaN();
    });
  });

  describe("createMonthlyPaymentCalculationError", () => {
    it("should create monthly payment calculation error", () => {
      const error = createMonthlyPaymentCalculationError(
        1000,
        200,
        300000,
        0.00291667,
        "calculatePayment"
      );

      expect(error.type).toBe("MonthlyPaymentCalculationError");
      expect(error.message).toContain("Failed to calculate monthly payment");
      expect(error.message).toContain("Principal: 1000");
      expect(error.message).toContain("Interest: 200");
      expect(error.operation).toBe("calculatePayment");
      expect(error.context.principal).toBe(1000);
      expect(error.context.interest).toBe(200);
      expect(error.context.total).toBe(1200);
      expect(error.context.loanAmount).toBe(300000);
      expect(error.context.monthlyRate).toBe(0.00291667);
    });
  });

  describe("createPercentageValidationError", () => {
    it("should create percentage validation error", () => {
      const error = createPercentageValidationError(
        150,
        "validatePercentage"
      );

      expect(error.type).toBe("PercentageValidationError");
      expect(error.message).toContain("Invalid percentage value 150");
      expect(error.message).toContain("Must be between 0 and 100");
      expect(error.operation).toBe("validatePercentage");
      expect(error.context.value).toBe(150);
      expect(error.context.minAllowed).toBe(0);
      expect(error.context.maxAllowed).toBe(100);
    });
  });

  describe("createRemainingMonthsCalculationError", () => {
    it("should create remaining months calculation error", () => {
      const error = createRemainingMonthsCalculationError(
        250000,
        0.00291667,
        1500,
        240,
        "calculateRemaining"
      );

      expect(error.type).toBe("RemainingMonthsCalculationError");
      expect(error.message).toContain("Failed to calculate remaining months");
      expect(error.message).toContain("Balance: 250000");
      expect(error.message).toContain("Rate: 0.00291667");
      expect(error.message).toContain("Payment: 1500");
      expect(error.operation).toBe("calculateRemaining");
      expect(error.context.currentBalance).toBe(250000);
      expect(error.context.monthlyRate).toBe(0.00291667);
      expect(error.context.paymentAmount).toBe(1500);
      expect(error.context.estimatedMonths).toBe(240);
    });
  });

  describe("createScheduleAnalysisError", () => {
    it("should create schedule analysis error with all fields", () => {
      const error = createScheduleAnalysisError(
        100,
        "Invalid calculation",
        "analyzeSchedule",
        "totalInterest"
      );

      expect(error.type).toBe("ScheduleAnalysisError");
      expect(error.message).toContain("Failed to analyze schedule with 100 entries");
      expect(error.message).toContain("Reason: Invalid calculation");
      expect(error.message).toContain("(field: totalInterest)");
      expect(error.operation).toBe("analyzeSchedule");
      expect(error.context.entriesCount).toBe(100);
      expect(error.context.reason).toBe("Invalid calculation");
      expect(error.context.field).toBe("totalInterest");
    });

    it("should create schedule analysis error without field", () => {
      const error = createScheduleAnalysisError(
        0,
        "No entries in schedule",
        "generateSchedule"
      );

      expect(error.type).toBe("ScheduleAnalysisError");
      expect(error.message).toContain("Failed to analyze schedule with 0 entries");
      expect(error.message).toContain("Reason: No entries in schedule");
      expect(error.message).not.toContain("(field:");
      expect(error.context.field).toBeUndefined();
    });

    it("should include cause error if provided", () => {
      const cause = {
        type: "UnknownError",
        message: "Unexpected error",
        operation: "unknown",
      };

      const error = createScheduleAnalysisError(
        50,
        "Processing failed",
        "processSchedule",
        undefined,
        cause
      );

      expect(error.cause).toEqual(cause);
    });
  });

  describe("formatAmortizationError", () => {
    it("should format simple error", () => {
      const error: MoneyCreationError = createMoneyCreationError(
        -50,
        "negative",
        "createMoney"
      );

      const formatted = formatAmortizationError(error);
      
      expect(formatted).toContain("❌ MoneyCreationError in createMoney");
      expect(formatted).toContain("Message: Failed to create money value -50");
      expect(formatted).toContain("Context:");
      expect(formatted).toContain('"value": -50');
      expect(formatted).toContain('"reason": "negative"');
    });

    it("should format error with cause", () => {
      const cause: PaymentMonthCreationError = createPaymentMonthCreationError(
        500,
        "validate"
      );

      const error: ScheduleAnalysisError = createScheduleAnalysisError(
        100,
        "Validation failed",
        "analyze",
        "month",
        cause as AmortizationError
      );

      const formatted = formatAmortizationError(error);
      
      expect(formatted).toContain("❌ ScheduleAnalysisError in analyze");
      expect(formatted).toContain("Caused by: ❌ PaymentMonthCreationError in validate");
    });

    it("should format error with complex context", () => {
      const error = createMonthlyPaymentCalculationError(
        1000.50,
        250.75,
        300000,
        0.00291667,
        "calculate"
      );

      const formatted = formatAmortizationError(error);
      
      expect(formatted).toContain("Context:");
      expect(formatted).toContain('"principal": 1000.5');
      expect(formatted).toContain('"interest": 250.75');
      expect(formatted).toContain('"total": 1251.25');
      expect(formatted).toContain('"loanAmount": 300000');
      expect(formatted).toContain('"monthlyRate": 0.00291667');
    });

    it("should format deeply nested errors", () => {
      const level3 = createPaymentMonthCreationError(500, "level3");
      const level2 = createMoneyCreationError(
        -100,
        "negative",
        "level2",
        level3
      );
      const level1 = createScheduleAnalysisError(
        0,
        "Top level error",
        "level1",
        undefined,
        level2 as AmortizationError
      );

      const formatted = formatAmortizationError(level1);
      
      expect(formatted).toContain("❌ ScheduleAnalysisError in level1");
      expect(formatted).toContain("Caused by: ❌ MoneyCreationError in level2");
      expect(formatted).toContain("Caused by: ❌ PaymentMonthCreationError in level3");
    });
  });

  describe("Error type guards", () => {
    it("should correctly identify error types", () => {
      const paymentError = createPaymentMonthCreationError(500, "test");
      const moneyError = createMoneyCreationError(-100, "negative", "test");
      const scheduleError = createScheduleAnalysisError(0, "Empty", "test");

      expect(paymentError.type).toBe("PaymentMonthCreationError");
      expect(moneyError.type).toBe("MoneyCreationError");
      expect(scheduleError.type).toBe("ScheduleAnalysisError");
    });
  });

  describe("Error context preservation", () => {
    it("should preserve all context fields", () => {
      const error = createMonthlyPaymentCalculationError(
        1234.56,
        789.01,
        500000,
        0.00375,
        "complexCalculation"
      );

      expect(error.context).toEqual({
        principal: 1234.56,
        interest: 789.01,
        total: 2023.57,
        loanAmount: 500000,
        monthlyRate: 0.00375,
      });
    });
  });
});