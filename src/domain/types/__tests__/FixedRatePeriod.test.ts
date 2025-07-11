/**
 * Comprehensive tests for FixedRatePeriod domain type
 *
 * Tests cover:
 * - Value object creation and validation
 * - Business rule enforcement
 * - German mortgage market specifics
 * - Edge cases and error conditions
 * - Date calculations and expiry logic
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createFixedRatePeriod,
  createStandardGermanPeriod,
  getPeriodYears,
  getInitialRate,
  getRateType,
  getStartDate,
  getEndDate,
  isCurrentlyActive,
  getRemainingYears,
  isTypicalPeriod,
  formatFixedRatePeriod,
  getDaysUntilExpiry,
  isExpiringSoon,
  compareByEndDate,
  getTypicalPeriods,
  isValidPeriodLength,
  getMinimumPeriodYears,
  getMaximumPeriodYears,
  type FixedRateType,
} from "../FixedRatePeriod";

describe("FixedRatePeriod", () => {
  let testDate: Date;

  beforeEach(() => {
    // Use a fixed date for consistent testing
    testDate = new Date("2024-01-15T10:00:00.000Z");
  });

  describe("createFixedRatePeriod", () => {
    it("should create a valid fixed rate period with valid inputs", () => {
      const result = createFixedRatePeriod(10, 3.5, "InitialFixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPeriodYears(result.data)).toBe(10);
        expect(getInitialRate(result.data)).toBe(3.5);
        expect(getRateType(result.data)).toBe("InitialFixed");
        expect(getStartDate(result.data)).toEqual(testDate);
      }
    });

    it("should use default values when not provided", () => {
      const result = createFixedRatePeriod(15, 4.0);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getRateType(result.data)).toBe("InitialFixed");
        // Start date should be close to now (within 1 second)
        const startDate = getStartDate(result.data);
        const now = new Date();
        expect(Math.abs(startDate.getTime() - now.getTime())).toBeLessThan(
          1000
        );
      }
    });

    it("should reject period too short", () => {
      const result = createFixedRatePeriod(0, 3.5, "Fixed", testDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PeriodTooShort");
      }
    });

    it("should reject period too long", () => {
      const result = createFixedRatePeriod(41, 3.5, "Fixed", testDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("PeriodTooLong");
      }
    });

    it("should reject invalid interest rate", () => {
      const result = createFixedRatePeriod(10, -1, "Fixed", testDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidInterestRate");
      }
    });

    it("should reject very old start dates", () => {
      const veryOldDate = new Date("2015-01-01");
      const result = createFixedRatePeriod(10, 3.5, "Fixed", veryOldDate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("InvalidStartDate");
      }
    });

    it("should accept recent past dates within reasonable range", () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 2); // 2 years ago

      const result = createFixedRatePeriod(10, 3.5, "Fixed", recentDate);
      expect(result.success).toBe(true);
    });

    it("should handle all valid rate types", () => {
      const rateTypes: FixedRateType[] = ["Fixed", "InitialFixed", "CapFixed"];

      rateTypes.forEach((rateType) => {
        const result = createFixedRatePeriod(10, 3.5, rateType, testDate);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getRateType(result.data)).toBe(rateType);
        }
      });
    });
  });

  describe("createStandardGermanPeriod", () => {
    it("should create standard German periods", () => {
      const standardPeriods = [5, 10, 15, 20, 25, 30] as const;

      standardPeriods.forEach((years) => {
        const result = createStandardGermanPeriod(years, 3.5, testDate);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(getPeriodYears(result.data)).toBe(years);
          expect(getRateType(result.data)).toBe("InitialFixed");
        }
      });
    });
  });

  describe("date calculations", () => {
    it("should calculate correct end date", () => {
      const result = createFixedRatePeriod(10, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        const endDate = getEndDate(result.data);
        const expectedEndDate = new Date(testDate);
        expectedEndDate.setFullYear(expectedEndDate.getFullYear() + 10);

        expect(endDate).toEqual(expectedEndDate);
      }
    });

    it("should correctly determine if period is currently active", () => {
      const result = createFixedRatePeriod(10, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        // Test current date within period
        const currentDate1 = new Date("2025-06-15"); // 1.5 years after start
        expect(isCurrentlyActive(result.data, currentDate1)).toBe(true);

        // Test current date before period
        const currentDate2 = new Date("2023-12-15"); // Before start
        expect(isCurrentlyActive(result.data, currentDate2)).toBe(false);

        // Test current date after period
        const currentDate3 = new Date("2035-01-15"); // After 10 years
        expect(isCurrentlyActive(result.data, currentDate3)).toBe(false);
      }
    });

    it("should calculate remaining years correctly", () => {
      const result = createFixedRatePeriod(10, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        // Test 2 years into the period
        const currentDate = new Date("2026-01-15");
        const remainingYears = getRemainingYears(result.data, currentDate);

        expect(remainingYears).toBeCloseTo(8, 1); // Should be close to 8 years remaining
      }
    });

    it("should return 0 remaining years when period is expired", () => {
      const result = createFixedRatePeriod(10, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        const expiredDate = new Date("2035-01-15"); // After 10 years
        const remainingYears = getRemainingYears(result.data, expiredDate);

        expect(remainingYears).toBe(0);
      }
    });

    it("should calculate days until expiry correctly", () => {
      const result = createFixedRatePeriod(1, 3.5, "Fixed", testDate); // 1 year period

      expect(result.success).toBe(true);
      if (result.success) {
        // Test 6 months before expiry
        const currentDate = new Date("2024-07-15");
        const daysUntilExpiry = getDaysUntilExpiry(result.data, currentDate);

        // Should be approximately 184 days (6 months)
        expect(daysUntilExpiry).toBeGreaterThan(180);
        expect(daysUntilExpiry).toBeLessThan(190);
      }
    });

    it("should return 0 days until expiry when already expired", () => {
      const result = createFixedRatePeriod(1, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        const expiredDate = new Date("2025-06-15"); // After 1 year + 5 months
        const daysUntilExpiry = getDaysUntilExpiry(result.data, expiredDate);

        expect(daysUntilExpiry).toBe(0);
      }
    });
  });

  describe("business logic", () => {
    it("should identify typical German mortgage periods", () => {
      const typicalPeriods = [5, 10, 15, 20, 25, 30];
      const atypicalPeriods = [3, 7, 12, 35, 40];

      typicalPeriods.forEach((years) => {
        const result = createFixedRatePeriod(years, 3.5, "Fixed", testDate);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(isTypicalPeriod(result.data)).toBe(true);
        }
      });

      atypicalPeriods.forEach((years) => {
        const result = createFixedRatePeriod(years, 3.5, "Fixed", testDate);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(isTypicalPeriod(result.data)).toBe(false);
        }
      });
    });

    it("should correctly identify expiring periods", () => {
      // Create a period that expires in 6 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Started 6 months ago

      const result = createFixedRatePeriod(1, 3.5, "Fixed", startDate); // 1 year period

      expect(result.success).toBe(true);
      if (result.success) {
        // Should be expiring soon (within 12 months)
        expect(isExpiringSoon(result.data)).toBe(true);

        // Should not be expiring soon with 3 month threshold
        expect(isExpiringSoon(result.data, new Date(), 3)).toBe(false);
      }
    });

    it("should not identify non-expiring periods as expiring soon", () => {
      const result = createFixedRatePeriod(10, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(isExpiringSoon(result.data, testDate)).toBe(false);
      }
    });
  });

  describe("formatting and display", () => {
    it("should format fixed rate period correctly", () => {
      const result = createFixedRatePeriod(10, 3.5, "InitialFixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        const formatted = formatFixedRatePeriod(result.data);
        expect(formatted).toContain("10 Jahre");
        expect(formatted).toContain("Zinsbindung");
        expect(formatted).toContain("3,50");
      }
    });

    it("should format different rate types correctly", () => {
      const testCases = [
        { type: "Fixed" as FixedRateType, expectedLabel: "Festzins" },
        { type: "InitialFixed" as FixedRateType, expectedLabel: "Zinsbindung" },
        { type: "CapFixed" as FixedRateType, expectedLabel: "Zinsobergrenze" },
      ];

      testCases.forEach(({ type, expectedLabel }) => {
        const result = createFixedRatePeriod(10, 3.5, type, testDate);
        expect(result.success).toBe(true);
        if (result.success) {
          const formatted = formatFixedRatePeriod(result.data);
          expect(formatted).toContain(expectedLabel);
        }
      });
    });
  });

  describe("comparison and sorting", () => {
    it("should compare fixed rate periods by end date", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-06-01");

      const period1Result = createFixedRatePeriod(5, 3.5, "Fixed", date1);
      const period2Result = createFixedRatePeriod(10, 4.0, "Fixed", date2);

      expect(period1Result.success).toBe(true);
      expect(period2Result.success).toBe(true);

      if (period1Result.success && period2Result.success) {
        const comparison = compareByEndDate(
          period1Result.data,
          period2Result.data
        );

        // period1 ends in 2029, period2 ends in 2034, so period1 should be less
        expect(comparison).toBeLessThan(0);
      }
    });
  });

  describe("utility functions", () => {
    it("should return correct typical periods", () => {
      const typicalPeriods = getTypicalPeriods();
      expect(typicalPeriods).toEqual([5, 10, 15, 20, 25, 30]);
    });

    it("should validate period lengths correctly", () => {
      expect(isValidPeriodLength(10)).toBe(true);
      expect(isValidPeriodLength(0)).toBe(false);
      expect(isValidPeriodLength(41)).toBe(false);
      expect(isValidPeriodLength(1)).toBe(true);
      expect(isValidPeriodLength(40)).toBe(true);
    });

    it("should return correct minimum and maximum periods", () => {
      expect(getMinimumPeriodYears()).toBe(1);
      expect(getMaximumPeriodYears()).toBe(40);
    });
  });

  describe("edge cases", () => {
    it("should handle leap year calculations correctly", () => {
      const leapYearStart = new Date("2024-02-29"); // Leap year date
      const result = createFixedRatePeriod(4, 3.5, "Fixed", leapYearStart);

      expect(result.success).toBe(true);
      if (result.success) {
        const endDate = getEndDate(result.data);
        // Should end on 2028-02-29 (next leap year) or 2028-02-28
        expect(endDate.getFullYear()).toBe(2028);
        expect(endDate.getMonth()).toBe(1); // February (0-indexed)
        expect([28, 29]).toContain(endDate.getDate());
      }
    });

    it("should handle maximum boundary values", () => {
      const maxPeriod = getMaximumPeriodYears();
      const result = createFixedRatePeriod(maxPeriod, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPeriodYears(result.data)).toBe(maxPeriod);
      }
    });

    it("should handle minimum boundary values", () => {
      const minPeriod = getMinimumPeriodYears();
      const result = createFixedRatePeriod(minPeriod, 3.5, "Fixed", testDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(getPeriodYears(result.data)).toBe(minPeriod);
      }
    });

    it("should ensure immutability of dates", () => {
      const originalDate = new Date("2024-01-15");
      const result = createFixedRatePeriod(10, 3.5, "Fixed", originalDate);

      expect(result.success).toBe(true);
      if (result.success) {
        const retrievedDate = getStartDate(result.data);

        // Modify the original date
        originalDate.setFullYear(2025);

        // Retrieved date should not be affected
        expect(retrievedDate.getFullYear()).toBe(2024);

        // Modify the retrieved date
        retrievedDate.setFullYear(2023);

        // Getting the date again should return the original
        const secondRetrievedDate = getStartDate(result.data);
        expect(secondRetrievedDate.getFullYear()).toBe(2024);
      }
    });
  });
});
