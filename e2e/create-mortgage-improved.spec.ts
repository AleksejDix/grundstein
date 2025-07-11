import { test, expect } from "@playwright/test";
import { CreateMortgagePage } from "./page-objects/CreateMortgagePage";
import {
  PortfolioModal,
  CreatePortfolioModal,
} from "./page-objects/PortfolioModal";
import {
  mortgageTestData,
  portfolioTestData,
  validationMessages,
} from "./fixtures/mortgage-data";

test.describe("Create Mortgage - Enhanced Tests", () => {
  let createMortgagePage: CreateMortgagePage;
  let portfolioModal: PortfolioModal;
  let createPortfolioModal: CreatePortfolioModal;

  test.beforeEach(async ({ page }) => {
    createMortgagePage = new CreateMortgagePage(page);
    portfolioModal = new PortfolioModal(page);
    createPortfolioModal = new CreatePortfolioModal(page);

    await createMortgagePage.goto();
  });

  test("should display the create mortgage form with all elements", async ({
    page,
  }) => {
    await createMortgagePage.expectPageToBeLoaded();
    await createMortgagePage.expectFormFieldsToBeVisible();
    await createMortgagePage.expectDefaultValues();
  });

  test("should calculate standard German mortgage successfully", async ({
    page,
  }) => {
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.standardGermanMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
    await createMortgagePage.expectActionButtons();
    await createMortgagePage.expectCurrencyFormatting();
  });

  test("should calculate Swiss mortgage successfully", async ({ page }) => {
    await createMortgagePage.fillMortgageForm(mortgageTestData.swissMortgage);
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
    await createMortgagePage.expectActionButtons();
  });

  test("should validate required fields with specific error messages", async ({
    page,
  }) => {
    // Test loan amount validation
    await createMortgagePage.fillMortgageForm({ amount: 0 });
    await createMortgagePage.fillRequiredFields();

    const loanAmountPromise = createMortgagePage.expectValidationAlert(
      validationMessages.invalidLoanAmount
    );
    await createMortgagePage.calculateMortgage();
    await loanAmountPromise;

    // Test interest rate validation
    await createMortgagePage.fillMortgageForm({
      ...mortgageTestData.standardGermanMortgage,
      interestRate: 0,
    });

    const interestRatePromise = createMortgagePage.expectValidationAlert(
      validationMessages.invalidInterestRate
    );
    await createMortgagePage.calculateMortgage();
    await interestRatePromise;

    // Test monthly payment validation
    await createMortgagePage.fillMortgageForm({
      ...mortgageTestData.standardGermanMortgage,
      monthlyPayment: 0,
    });

    const monthlyPaymentPromise = createMortgagePage.expectValidationAlert(
      validationMessages.invalidMonthlyPayment
    );
    await createMortgagePage.calculateMortgage();
    await monthlyPaymentPromise;

    // Test mortgage name validation
    await createMortgagePage.fillMortgageForm({
      ...mortgageTestData.standardGermanMortgage,
      name: "",
    });

    const mortgageNamePromise = createMortgagePage.expectValidationAlert(
      validationMessages.missingMortgageName
    );
    await createMortgagePage.calculateMortgage();
    await mortgageNamePromise;

    // Test bank validation
    await createMortgagePage.fillMortgageForm({
      ...mortgageTestData.standardGermanMortgage,
      bank: "",
    });

    const bankPromise = createMortgagePage.expectValidationAlert(
      validationMessages.missingBank
    );
    await createMortgagePage.calculateMortgage();
    await bankPromise;
  });

  test("should reset form correctly", async ({ page }) => {
    // Fill with non-default values
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.highValueMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Reset form
    await createMortgagePage.resetForm();

    // Check form is reset to defaults
    await createMortgagePage.expectDefaultValues();
    await createMortgagePage.expectInitialState();
  });

  test("should handle portfolio creation workflow", async ({ page }) => {
    // Calculate mortgage first
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.standardGermanMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Open portfolio modal
    await createMortgagePage.addToPortfolio();
    await portfolioModal.expectModalToBeVisible();
    await portfolioModal.expectNoPortfoliosState();

    // Open create portfolio modal
    await portfolioModal.createNewPortfolio();
    await createPortfolioModal.expectModalToBeVisible();

    // Fill portfolio details
    await createPortfolioModal.fillPortfolioDetails(
      portfolioTestData.standardPortfolio.name,
      portfolioTestData.standardPortfolio.owner
    );

    // Create portfolio button should be visible
    await expect(createPortfolioModal.createButton).toBeVisible();
  });

  test("should handle different fixed rate periods", async ({ page }) => {
    const periods = [5, 10, 15, 20, 25, 30];

    for (const period of periods) {
      await createMortgagePage.fillMortgageForm({
        ...mortgageTestData.standardGermanMortgage,
        fixedRatePeriod: period,
      });

      await createMortgagePage.calculateMortgage();
      await createMortgagePage.waitForCalculation();
      await createMortgagePage.expectCalculationResults();

      // Reset for next iteration
      await createMortgagePage.resetForm();
    }
  });

  test("should handle high-value mortgage calculations", async ({ page }) => {
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.highValueMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
    await createMortgagePage.expectCurrencyFormatting();
  });

  test("should handle low-value mortgage calculations", async ({ page }) => {
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.lowValueMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
  });

  test("should handle past start dates correctly", async ({ page }) => {
    const pastDate = await createMortgagePage.getPastDate(2);

    await createMortgagePage.fillMortgageForm({
      ...mortgageTestData.standardGermanMortgage,
      startDate: pastDate,
    });

    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();

    // Should show elapsed months and current balance
    await expect(createMortgagePage.monthsElapsedResult).toBeVisible();
    await expect(createMortgagePage.currentBalanceResult).toBeVisible();
  });

  test("should handle edge case: very high monthly payment", async ({
    page,
  }) => {
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.highPaymentMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Should still show results even with high payment
    await createMortgagePage.expectCalculationResults();
  });

  test("should maintain form state during calculation", async ({ page }) => {
    const testData = mortgageTestData.standardGermanMortgage;
    await createMortgagePage.fillMortgageForm(testData);

    // Start calculation
    await createMortgagePage.calculateMortgage();

    // Form fields should maintain their values during calculation
    await expect(createMortgagePage.loanAmountInput).toHaveValue(
      testData.amount.toString()
    );
    await expect(createMortgagePage.interestRateInput).toHaveValue(
      testData.interestRate.toString()
    );
    await expect(createMortgagePage.bankInput).toHaveValue(testData.bank);
    await expect(createMortgagePage.mortgageNameInput).toHaveValue(
      testData.name
    );

    await createMortgagePage.waitForCalculation();
  });

  test("should display helpful text and hints", async ({ page }) => {
    await expect(
      page.getByText("Typical German mortgages have 10-year fixed rate periods")
    ).toBeVisible();
    await expect(
      page.getByText("How much do you want to pay monthly?")
    ).toBeVisible();
    await expect(
      page.getByText("When did you first take out this mortgage?")
    ).toBeVisible();
  });

  test("should show detailed calculation breakdown", async ({ page }) => {
    await createMortgagePage.fillMortgageForm(
      mortgageTestData.standardGermanMortgage
    );
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Check detailed breakdown elements
    await expect(page.getByText("Principal:")).toBeVisible();
    await expect(page.getByText("Interest:")).toBeVisible();
    await expect(page.getByText("Total Interest:")).toBeVisible();
    await expect(page.getByText("Total Amount:")).toBeVisible();
  });
});
