import { test, expect } from "@playwright/test";
import { CreateMortgagePage } from "./page-objects/CreateMortgagePage";
import { mortgageTestData } from "./fixtures/mortgage-data";

test.describe("Create Mortgage - Working Tests", () => {
  let createMortgagePage: CreateMortgagePage;

  test.beforeEach(async ({ page }) => {
    createMortgagePage = new CreateMortgagePage(page);
    await createMortgagePage.goto();
    await page.waitForLoadState("networkidle");
  });

  test("should display the create mortgage form", async ({ page }) => {
    await createMortgagePage.expectPageToBeLoaded();
    await createMortgagePage.expectFormFieldsToBeVisible();
    await createMortgagePage.expectDefaultValues();
  });

  test("should calculate mortgage with valid inputs", async ({ page }) => {
    // Fill required fields
    await createMortgagePage.fillRequiredFields("Test Bank", "Test Mortgage");

    // Calculate mortgage
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Verify results
    await createMortgagePage.expectCalculationResults();
    await createMortgagePage.expectActionButtons();
  });

  test("should validate required bank field", async ({ page }) => {
    // Leave bank field empty
    await createMortgagePage.mortgageNameInput.fill("Test Mortgage");

    // Set up dialog handler
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Please enter a bank/lender name");
      await dialog.accept();
    });

    await createMortgagePage.calculateMortgage();
  });

  test("should validate required mortgage name field", async ({ page }) => {
    // Leave mortgage name empty
    await createMortgagePage.bankInput.fill("Test Bank");

    // Set up dialog handler
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Please enter a mortgage name");
      await dialog.accept();
    });

    await createMortgagePage.calculateMortgage();
  });

  test("should reset form correctly", async ({ page }) => {
    // Fill with custom values
    await createMortgagePage.fillMortgageForm({
      amount: 500000,
      interestRate: 4.5,
      bank: "Custom Bank",
      name: "Custom Mortgage",
    });

    // Calculate to show results
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Reset form
    await createMortgagePage.resetForm();

    // Verify form is reset
    await createMortgagePage.expectDefaultValues();
    await createMortgagePage.expectInitialState();
  });

  test("should handle different markets", async ({ page }) => {
    // Test German market (default)
    await expect(createMortgagePage.marketSelect).toHaveValue("DE");

    // Switch to Swiss market
    await createMortgagePage.marketSelect.selectOption("CH");
    await expect(createMortgagePage.marketSelect).toHaveValue("CH");

    // Fill required fields and calculate
    await createMortgagePage.fillRequiredFields("Swiss Bank", "Swiss Mortgage");
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Should calculate successfully
    await createMortgagePage.expectCalculationResults();
  });

  test("should handle different fixed rate periods", async ({ page }) => {
    const periods = ["5", "10", "15", "20", "25", "30"];

    // Test each period
    for (const period of periods) {
      await createMortgagePage.fixedRatePeriodSelect.selectOption(period);
      await expect(createMortgagePage.fixedRatePeriodSelect).toHaveValue(
        period
      );
    }

    // Calculate with 15-year period
    await createMortgagePage.fixedRatePeriodSelect.selectOption("15");
    await createMortgagePage.fillRequiredFields("Test Bank", "Test Mortgage");
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
  });

  test("should show portfolio selection modal", async ({ page }) => {
    // Calculate mortgage first
    await createMortgagePage.fillRequiredFields("Test Bank", "Test Mortgage");
    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    // Click "Add to Portfolio"
    await createMortgagePage.addToPortfolio();

    // Verify modal appears
    await expect(
      page.getByRole("heading", { name: "Add to Portfolio" })
    ).toBeVisible();
    await expect(
      page.getByText("Select which portfolio to add this mortgage to")
    ).toBeVisible();
  });

  test("should display helpful hints", async ({ page }) => {
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

  test("should calculate with high-value mortgage", async ({ page }) => {
    await createMortgagePage.fillMortgageForm({
      amount: 1000000,
      interestRate: 4.0,
      monthlyPayment: 5000,
      bank: "Premium Bank",
      name: "High Value Mortgage",
    });

    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();
    await createMortgagePage.expectCurrencyFormatting();
  });

  test("should handle past start dates", async ({ page }) => {
    const pastDate = await createMortgagePage.getPastDate(2);

    await createMortgagePage.fillMortgageForm({
      startDate: pastDate,
      bank: "Test Bank",
      name: "Past Date Mortgage",
    });

    await createMortgagePage.calculateMortgage();
    await createMortgagePage.waitForCalculation();

    await createMortgagePage.expectCalculationResults();

    // Should show elapsed months
    await expect(createMortgagePage.monthsElapsedResult).toBeVisible();
  });
});
