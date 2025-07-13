import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import {
  createMortgageId,
  generateMortgageId,
  createMortgage,
  updateMortgage,
  activateMortgage,
  completeMortgage,
  refinanceMortgage,
  isActive,
  isCompleted,
  canMakePayments,
  canAddExtraPayments,
  getMortgageAgeInMonths,
  getMortgageDisplayName,
  isMortgage,
  type Mortgage,
  type MortgageId,
} from "../Mortgage";
import { createLoanConfiguration } from "../../types/LoanConfiguration";
import { createLoanAmount } from "../../value-objects/LoanAmount";
import { createInterestRate } from "../../value-objects/InterestRate";
import { createMonthCount } from "../../value-objects/MonthCount";
import { createMoney } from "../../value-objects/Money";

describe("Mortgage Entity", () => {
  describe("MortgageId factory functions", () => {
    it("should create valid MortgageId from non-empty string", () => {
      const result = createMortgageId("test-123");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test-123");
      }
    });

    it("should reject empty string", () => {
      const result = createMortgageId("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mortgage ID cannot be empty");
      }
    });

    it("should reject whitespace-only string", () => {
      const result = createMortgageId("   ");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mortgage ID cannot be empty");
      }
    });

    it("should generate unique mortgage IDs", () => {
      const id1 = generateMortgageId();
      const id2 = generateMortgageId();

      expect(id1).not.toBe(id2);
      expect(id1).toContain("mortgage_");
      expect(id2).toContain("mortgage_");
    });

    it("should generate IDs with expected format", () => {
      const id = generateMortgageId();
      expect(id).toMatch(/^mortgage_\d+_[a-z0-9]+$/);
    });
  });

  describe("createMortgage", () => {
    const validLoanConfig = (() => {
      const amount = createLoanAmount(300000);
      const rate = createInterestRate(3.5);
      const term = createMonthCount(360);
      const payment = createMoney(1347); // Calculated monthly payment for 300k at 3.5% for 30 years

      if (
        !amount.success ||
        !rate.success ||
        !term.success ||
        !payment.success
      ) {
        throw new Error("Failed to create test data");
      }

      const config = createLoanConfiguration(
        amount.data,
        rate.data,
        term.data,
        payment.data,
      );

      if (!config.success) {
        throw new Error("Failed to create loan configuration");
      }

      return config.data;
    })();

    it("should create valid mortgage with all required fields", () => {
      const result = createMortgage({
        name: "Test Mortgage",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const mortgage = result.data;
        expect(mortgage.name).toBe("Test Mortgage");
        expect(mortgage.bankName).toBe("Test Bank");
        expect(mortgage.currency).toBe("EUR");
        expect(mortgage.configuration).toBe(validLoanConfig);
        expect(mortgage.status).toBe("draft");
        expect(mortgage.id).toContain("mortgage_");
        expect(mortgage.createdAt).toBeInstanceOf(Date);
        expect(mortgage.updatedAt).toBeInstanceOf(Date);
      }
    });

    it("should create mortgage with custom ID", () => {
      const customId = "custom-mortgage-123" as MortgageId;
      const result = createMortgage({
        id: customId,
        name: "Test Mortgage",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(customId);
      }
    });

    it("should create mortgage with optional fields", () => {
      const result = createMortgage({
        name: "Test Mortgage",
        propertyAddress: "123 Main St",
        bankName: "Test Bank",
        currency: "CHF",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
        metadata: {
          accountNumber: "ACC123",
          contactPerson: "John Doe",
          notes: "Test notes",
          market: "CH",
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const mortgage = result.data;
        expect(mortgage.propertyAddress).toBe("123 Main St");
        expect(mortgage.currency).toBe("CHF");
        expect(mortgage.metadata?.accountNumber).toBe("ACC123");
        expect(mortgage.metadata?.contactPerson).toBe("John Doe");
        expect(mortgage.metadata?.notes).toBe("Test notes");
        expect(mortgage.metadata?.market).toBe("CH");
      }
    });

    it("should trim whitespace from name and bank name", () => {
      const result = createMortgage({
        name: "  Test Mortgage  ",
        propertyAddress: "  123 Main St  ",
        bankName: "  Test Bank  ",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const mortgage = result.data;
        expect(mortgage.name).toBe("Test Mortgage");
        expect(mortgage.propertyAddress).toBe("123 Main St");
        expect(mortgage.bankName).toBe("Test Bank");
      }
    });

    it("should reject empty mortgage name", () => {
      const result = createMortgage({
        name: "",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mortgage name cannot be empty");
      }
    });

    it("should reject whitespace-only mortgage name", () => {
      const result = createMortgage({
        name: "   ",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mortgage name cannot be empty");
      }
    });

    it("should reject empty bank name", () => {
      const result = createMortgage({
        name: "Test Mortgage",
        bankName: "",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: new Date("2024-01-01"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Bank name cannot be empty");
      }
    });

    it("should reject future start date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = createMortgage({
        name: "Test Mortgage",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: validLoanConfig,
        startDate: futureDate,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Start date cannot be in the future");
      }
    });
  });

  describe("updateMortgage", () => {
    let testMortgage: Mortgage;

    beforeEach(() => {
      const amount = createLoanAmount(300000);
      const rate = createInterestRate(3.5);
      const term = createMonthCount(360);
      const payment = createMoney(1347);

      if (
        !amount.success ||
        !rate.success ||
        !term.success ||
        !payment.success
      ) {
        throw new Error("Failed to create test data");
      }

      const config = createLoanConfiguration(
        amount.data,
        rate.data,
        term.data,
        payment.data,
      );

      if (!config.success) {
        throw new Error("Failed to create loan configuration");
      }

      const mortgageResult = createMortgage({
        name: "Original Mortgage",
        bankName: "Original Bank",
        currency: "EUR",
        configuration: config.data,
        startDate: new Date("2024-01-01"),
      });

      if (!mortgageResult.success) {
        throw new Error("Failed to create test mortgage");
      }

      testMortgage = mortgageResult.data;
    });

    it("should update mortgage name", () => {
      const result = updateMortgage(testMortgage, {
        name: "Updated Mortgage",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const updated = result.data;
        expect(updated.name).toBe("Updated Mortgage");
        expect(updated.bankName).toBe("Original Bank"); // unchanged
        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
          testMortgage.updatedAt.getTime(),
        );
      }
    });

    it("should update multiple fields", () => {
      const result = updateMortgage(testMortgage, {
        name: "Updated Mortgage",
        bankName: "Updated Bank",
        propertyAddress: "456 Oak Ave",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const updated = result.data;
        expect(updated.name).toBe("Updated Mortgage");
        expect(updated.bankName).toBe("Updated Bank");
        expect(updated.propertyAddress).toBe("456 Oak Ave");
      }
    });

    it("should update metadata", () => {
      const result = updateMortgage(testMortgage, {
        metadata: {
          accountNumber: "NEW123",
          notes: "Updated notes",
          market: "DE",
        },
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const updated = result.data;
        expect(updated.metadata?.accountNumber).toBe("NEW123");
        expect(updated.metadata?.notes).toBe("Updated notes");
        expect(updated.metadata?.market).toBe("DE");
      }
    });

    it("should trim whitespace from updated fields", () => {
      const result = updateMortgage(testMortgage, {
        name: "  Updated Mortgage  ",
        bankName: "  Updated Bank  ",
        propertyAddress: "  456 Oak Ave  ",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const updated = result.data;
        expect(updated.name).toBe("Updated Mortgage");
        expect(updated.bankName).toBe("Updated Bank");
        expect(updated.propertyAddress).toBe("456 Oak Ave");
      }
    });

    it("should reject empty name update", () => {
      const result = updateMortgage(testMortgage, {
        name: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mortgage name cannot be empty");
      }
    });

    it("should reject empty bank name update", () => {
      const result = updateMortgage(testMortgage, {
        bankName: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Bank name cannot be empty");
      }
    });

    it("should preserve original values for undefined updates", () => {
      const result = updateMortgage(testMortgage, {
        name: "Updated Name",
        // bankName undefined - should preserve original
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const updated = result.data;
        expect(updated.name).toBe("Updated Name");
        expect(updated.bankName).toBe("Original Bank");
      }
    });
  });

  describe("status transitions", () => {
    let draftMortgage: Mortgage;
    let activeMortgage: Mortgage;

    beforeEach(() => {
      const amount = createLoanAmount(300000);
      const rate = createInterestRate(3.5);
      const term = createMonthCount(360);
      const payment = createMoney(1347);

      if (
        !amount.success ||
        !rate.success ||
        !term.success ||
        !payment.success
      ) {
        throw new Error("Failed to create test data");
      }

      const config = createLoanConfiguration(
        amount.data,
        rate.data,
        term.data,
        payment.data,
      );

      if (!config.success) {
        throw new Error("Failed to create loan configuration");
      }

      const mortgageResult = createMortgage({
        name: "Test Mortgage",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: config.data,
        startDate: new Date("2024-01-01"),
      });

      if (!mortgageResult.success) {
        throw new Error("Failed to create test mortgage");
      }

      draftMortgage = mortgageResult.data;

      const activationResult = activateMortgage(draftMortgage);
      if (!activationResult.success) {
        throw new Error("Failed to activate mortgage");
      }
      activeMortgage = activationResult.data;
    });

    describe("activateMortgage", () => {
      it("should activate draft mortgage", () => {
        const result = activateMortgage(draftMortgage);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe("active");
          expect(result.data.updatedAt.getTime()).toBeGreaterThanOrEqual(
            draftMortgage.updatedAt.getTime(),
          );
        }
      });

      it("should reject activating non-draft mortgage", () => {
        const result = activateMortgage(activeMortgage);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe(
            "Can only activate mortgages in draft status",
          );
        }
      });
    });

    describe("completeMortgage", () => {
      it("should complete active mortgage", () => {
        const result = completeMortgage(activeMortgage);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe("completed");
          expect(result.data.updatedAt.getTime()).toBeGreaterThanOrEqual(
            activeMortgage.updatedAt.getTime(),
          );
        }
      });

      it("should reject completing non-active mortgage", () => {
        const result = completeMortgage(draftMortgage);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("Can only complete active mortgages");
        }
      });
    });

    describe("refinanceMortgage", () => {
      it("should refinance active mortgage", () => {
        const newMortgageId = "new-mortgage-123" as MortgageId;
        const result = refinanceMortgage(activeMortgage, newMortgageId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe("refinanced");
          expect(result.data.metadata?.refinancedTo).toBe(newMortgageId);
          expect(result.data.updatedAt.getTime()).toBeGreaterThanOrEqual(
            activeMortgage.updatedAt.getTime(),
          );
        }
      });

      it("should reject refinancing non-active mortgage", () => {
        const newMortgageId = "new-mortgage-123" as MortgageId;
        const result = refinanceMortgage(draftMortgage, newMortgageId);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe("Can only refinance active mortgages");
        }
      });
    });
  });

  describe("query functions", () => {
    let mortgages: {
      draft: Mortgage;
      active: Mortgage;
      completed: Mortgage;
      refinanced: Mortgage;
    };

    beforeEach(() => {
      const amount = createLoanAmount(300000);
      const rate = createInterestRate(3.5);
      const term = createMonthCount(360);
      const payment = createMoney(1347);

      if (
        !amount.success ||
        !rate.success ||
        !term.success ||
        !payment.success
      ) {
        throw new Error("Failed to create test data");
      }

      const config = createLoanConfiguration(
        amount.data,
        rate.data,
        term.data,
        payment.data,
      );

      if (!config.success) {
        throw new Error("Failed to create loan configuration");
      }

      const draftResult = createMortgage({
        name: "Draft Mortgage",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: config.data,
        startDate: new Date("2024-01-01"),
      });

      if (!draftResult.success) {
        throw new Error("Failed to create draft mortgage");
      }

      const activeResult = activateMortgage(draftResult.data);
      if (!activeResult.success) {
        throw new Error("Failed to activate mortgage");
      }

      const completedResult = completeMortgage(activeResult.data);
      if (!completedResult.success) {
        throw new Error("Failed to complete mortgage");
      }

      const refinancedResult = refinanceMortgage(
        activeResult.data,
        "new-123" as MortgageId,
      );
      if (!refinancedResult.success) {
        throw new Error("Failed to refinance mortgage");
      }

      mortgages = {
        draft: draftResult.data,
        active: activeResult.data,
        completed: completedResult.data,
        refinanced: refinancedResult.data,
      };
    });

    describe("isActive", () => {
      it("should return true for active mortgage", () => {
        expect(isActive(mortgages.active)).toBe(true);
      });

      it("should return false for non-active mortgages", () => {
        expect(isActive(mortgages.draft)).toBe(false);
        expect(isActive(mortgages.completed)).toBe(false);
        expect(isActive(mortgages.refinanced)).toBe(false);
      });
    });

    describe("isCompleted", () => {
      it("should return true for completed mortgage", () => {
        expect(isCompleted(mortgages.completed)).toBe(true);
      });

      it("should return false for non-completed mortgages", () => {
        expect(isCompleted(mortgages.draft)).toBe(false);
        expect(isCompleted(mortgages.active)).toBe(false);
        expect(isCompleted(mortgages.refinanced)).toBe(false);
      });
    });

    describe("canMakePayments", () => {
      it("should return true for active mortgage", () => {
        expect(canMakePayments(mortgages.active)).toBe(true);
      });

      it("should return false for non-active mortgages", () => {
        expect(canMakePayments(mortgages.draft)).toBe(false);
        expect(canMakePayments(mortgages.completed)).toBe(false);
        expect(canMakePayments(mortgages.refinanced)).toBe(false);
      });
    });

    describe("canAddExtraPayments", () => {
      it("should return false for active mortgage without extra payment plan", () => {
        expect(canAddExtraPayments(mortgages.active)).toBe(false);
      });

      it("should return false for non-active mortgages", () => {
        expect(canAddExtraPayments(mortgages.draft)).toBe(false);
        expect(canAddExtraPayments(mortgages.completed)).toBe(false);
        expect(canAddExtraPayments(mortgages.refinanced)).toBe(false);
      });
    });
  });

  describe("utility functions", () => {
    let testMortgage: Mortgage;

    beforeEach(() => {
      const amount = createLoanAmount(300000);
      const rate = createInterestRate(3.5);
      const term = createMonthCount(360);
      const payment = createMoney(1347);

      if (
        !amount.success ||
        !rate.success ||
        !term.success ||
        !payment.success
      ) {
        throw new Error("Failed to create test data");
      }

      const config = createLoanConfiguration(
        amount.data,
        rate.data,
        term.data,
        payment.data,
      );

      if (!config.success) {
        throw new Error("Failed to create loan configuration");
      }

      const mortgageResult = createMortgage({
        name: "Test Mortgage",
        propertyAddress: "123 Main St",
        bankName: "Test Bank",
        currency: "EUR",
        configuration: config.data,
        startDate: new Date("2024-01-01"),
      });

      if (!mortgageResult.success) {
        throw new Error("Failed to create test mortgage");
      }

      testMortgage = mortgageResult.data;
    });

    describe("getMortgageAgeInMonths", () => {
      it("should calculate age correctly", () => {
        const testDate = new Date("2024-06-01"); // 5 months after start
        const age = getMortgageAgeInMonths(testMortgage, testDate);
        expect(age).toBeGreaterThanOrEqual(4);
        expect(age).toBeLessThanOrEqual(5);
      });

      it("should return 0 for mortgage starting today", () => {
        const today = new Date();
        const mortgageResult = createMortgage({
          name: "New Mortgage",
          bankName: "Test Bank",
          currency: "EUR",
          configuration: testMortgage.configuration,
          startDate: today,
        });

        if (mortgageResult.success) {
          const age = getMortgageAgeInMonths(mortgageResult.data, today);
          expect(age).toBe(0);
        }
      });

      it("should use current date when no date provided", () => {
        const age = getMortgageAgeInMonths(testMortgage);
        expect(age).toBeGreaterThanOrEqual(0);
      });
    });

    describe("getMortgageDisplayName", () => {
      it("should include property address when available", () => {
        const displayName = getMortgageDisplayName(testMortgage);
        expect(displayName).toBe("Test Mortgage - 123 Main St");
      });

      it("should use only name when no property address", () => {
        const mortgageWithoutAddress = {
          ...testMortgage,
          propertyAddress: undefined,
        };
        const displayName = getMortgageDisplayName(mortgageWithoutAddress);
        expect(displayName).toBe("Test Mortgage");
      });
    });

    describe("isMortgage type guard", () => {
      it("should return true for valid mortgage", () => {
        expect(isMortgage(testMortgage)).toBe(true);
      });

      it("should return false for null", () => {
        expect(isMortgage(null)).toBe(false);
      });

      it("should return false for undefined", () => {
        expect(isMortgage(undefined)).toBe(false);
      });

      it("should return false for non-object", () => {
        expect(isMortgage("string")).toBe(false);
        expect(isMortgage(123)).toBe(false);
        expect(isMortgage(true)).toBe(false);
      });

      it("should return false for object missing required fields", () => {
        expect(isMortgage({})).toBe(false);
        expect(isMortgage({ id: "123" })).toBe(false);
        expect(isMortgage({ id: "123", name: "Test" })).toBe(false);
      });

      it("should return true for object with all required fields", () => {
        const mortgageLike = {
          id: "test-id",
          name: "Test Mortgage",
          configuration: {},
          status: "draft",
        };
        expect(isMortgage(mortgageLike)).toBe(true);
      });
    });
  });

  describe("property-based tests", () => {
    it("should always create valid mortgages with valid inputs", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          fc
            .string({ minLength: 1, maxLength: 100 })
            .filter((s) => s.trim().length > 0),
          fc.constantFrom("EUR", "CHF", "USD"),
          fc.date({ min: new Date("2000-01-01"), max: new Date() }),
          (name, bankName, currency, startDate) => {
            const amount = createLoanAmount(300000);
            const rate = createInterestRate(3.5);
            const term = createMonthCount(360);
            const payment = createMoney(1347);

            if (
              !amount.success ||
              !rate.success ||
              !term.success ||
              !payment.success
            ) {
              return;
            }

            const config = createLoanConfiguration(
              amount.data,
              rate.data,
              term.data,
              payment.data,
            );

            if (!config.success) {
              return;
            }

            const result = createMortgage({
              name,
              bankName,
              currency,
              configuration: config.data,
              startDate,
            });

            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.name).toBe(name.trim());
              expect(result.data.bankName).toBe(bankName.trim());
              expect(result.data.currency).toBe(currency);
              expect(result.data.status).toBe("draft");
            }
          },
        ),
      );
    });

    it("should always reject invalid names and bank names", () => {
      fc.assert(
        fc.property(
          fc.constantFrom("", "   ", "\t\n"),
          fc.constantFrom("", "   ", "\t\n"),
          (invalidName, invalidBankName) => {
            const amount = createLoanAmount(300000);
            const rate = createInterestRate(3.5);
            const term = createMonthCount(360);
            const payment = createMoney(1347);

            if (
              !amount.success ||
              !rate.success ||
              !term.success ||
              !payment.success
            ) {
              return;
            }

            const config = createLoanConfiguration(
              amount.data,
              rate.data,
              term.data,
              payment.data,
            );

            if (!config.success) {
              return;
            }

            const nameResult = createMortgage({
              name: invalidName,
              bankName: "Valid Bank",
              currency: "EUR",
              configuration: config.data,
              startDate: new Date("2024-01-01"),
            });

            const bankResult = createMortgage({
              name: "Valid Mortgage",
              bankName: invalidBankName,
              currency: "EUR",
              configuration: config.data,
              startDate: new Date("2024-01-01"),
            });

            expect(nameResult.success).toBe(false);
            expect(bankResult.success).toBe(false);
          },
        ),
      );
    });

    it("should maintain status transitions correctly", () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => s.trim().length > 0),
          (name) => {
            const amount = createLoanAmount(300000);
            const rate = createInterestRate(3.5);
            const term = createMonthCount(360);
            const payment = createMoney(1347);

            if (
              !amount.success ||
              !rate.success ||
              !term.success ||
              !payment.success
            ) {
              return;
            }

            const config = createLoanConfiguration(
              amount.data,
              rate.data,
              term.data,
              payment.data,
            );

            if (!config.success) {
              return;
            }

            const mortgageResult = createMortgage({
              name,
              bankName: "Test Bank",
              currency: "EUR",
              configuration: config.data,
              startDate: new Date("2024-01-01"),
            });

            if (!mortgageResult.success) return;

            const draft = mortgageResult.data;
            expect(draft.status).toBe("draft");
            expect(isActive(draft)).toBe(false);
            expect(canMakePayments(draft)).toBe(false);

            const activeResult = activateMortgage(draft);
            if (!activeResult.success) return;

            const active = activeResult.data;
            expect(active.status).toBe("active");
            expect(isActive(active)).toBe(true);
            expect(canMakePayments(active)).toBe(true);

            const completedResult = completeMortgage(active);
            if (!completedResult.success) return;

            const completed = completedResult.data;
            expect(completed.status).toBe("completed");
            expect(isCompleted(completed)).toBe(true);
            expect(canMakePayments(completed)).toBe(false);
          },
        ),
      );
    });
  });
});
