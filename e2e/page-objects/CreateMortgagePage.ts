import { Page, expect } from "@playwright/test";

export class CreateMortgagePage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/mortgages/create");
  }

  // Form elements
  get loanAmountInput() {
    return this.page.locator('input[placeholder="300,000"]');
  }

  get interestRateInput() {
    return this.page.locator('input[placeholder="3.5"]');
  }

  get fixedRatePeriodSelect() {
    return this.page.locator("select").first();
  }

  get monthlyPaymentInput() {
    return this.page.locator('input[placeholder="400"]');
  }

  get marketSelect() {
    return this.page.locator("select").nth(1);
  }

  get bankInput() {
    return this.page.locator('input[placeholder="e.g., Deutsche Bank"]');
  }

  get startDateInput() {
    return this.page.locator('input[type="date"]');
  }

  get mortgageNameInput() {
    return this.page.locator(
      'input[placeholder="e.g., Primary Home Mortgage"]'
    );
  }

  // Buttons
  get calculateButton() {
    return this.page.locator("button", { hasText: "Calculate Mortgage" });
  }

  get resetButton() {
    return this.page.locator("button", { hasText: "Reset" });
  }

  get addToPortfolioButton() {
    return this.page.getByRole("button", { name: "Add to Portfolio" });
  }

  get saveDraftButton() {
    return this.page.getByRole("button", { name: "Save as Draft" });
  }

  // Results section
  get monthlyPaymentResult() {
    return this.page.getByText("Monthly Payment").first();
  }

  get totalCostResult() {
    return this.page.getByText("Total Cost").first();
  }

  get currentBalanceResult() {
    return this.page.getByText("Current Balance").first();
  }

  get monthsElapsedResult() {
    return this.page.getByText("Months Elapsed").first();
  }

  get remainingMonthsResult() {
    return this.page.getByText("Remaining Months").first();
  }

  get payoffDateResult() {
    return this.page.getByText("Payoff Date").first();
  }

  get loadingIndicator() {
    return this.page.getByText("Calculating...");
  }

  get initialStateMessage() {
    return this.page.getByText(
      "Fill in the mortgage details to see calculations"
    );
  }

  // Actions
  async fillMortgageForm(data: {
    amount?: number;
    interestRate?: number;
    fixedRatePeriod?: number;
    monthlyPayment?: number;
    market?: "DE" | "CH";
    bank?: string;
    startDate?: string;
    name?: string;
  }) {
    if (data.amount !== undefined) {
      await this.loanAmountInput.fill(data.amount.toString());
    }
    if (data.interestRate !== undefined) {
      await this.interestRateInput.fill(data.interestRate.toString());
    }
    if (data.fixedRatePeriod !== undefined) {
      await this.fixedRatePeriodSelect.selectOption(
        data.fixedRatePeriod.toString()
      );
    }
    if (data.monthlyPayment !== undefined) {
      await this.monthlyPaymentInput.fill(data.monthlyPayment.toString());
    }
    if (data.market !== undefined) {
      await this.marketSelect.selectOption(data.market);
    }
    if (data.bank !== undefined) {
      await this.bankInput.fill(data.bank);
    }
    if (data.startDate !== undefined) {
      await this.startDateInput.fill(data.startDate);
    }
    if (data.name !== undefined) {
      await this.mortgageNameInput.fill(data.name);
    }
  }

  async fillRequiredFields(bank = "Test Bank", name = "Test Mortgage") {
    await this.bankInput.fill(bank);
    await this.mortgageNameInput.fill(name);
  }

  async calculateMortgage() {
    await this.calculateButton.click();
  }

  async waitForCalculation() {
    await expect(this.loadingIndicator).toBeVisible();
    await expect(this.loadingIndicator).not.toBeVisible();
  }

  async resetForm() {
    await this.resetButton.click();
  }

  async addToPortfolio() {
    await this.addToPortfolioButton.click();
  }

  async saveDraft() {
    await this.saveDraftButton.click();
  }

  // Validations
  async expectPageToBeLoaded() {
    await expect(this.page.getByText("Create Your Mortgage")).toBeVisible();
    await expect(
      this.page.getByText(
        "Configure your mortgage parameters and see detailed calculations"
      )
    ).toBeVisible();
  }

  async expectFormFieldsToBeVisible() {
    await expect(this.loanAmountInput).toBeVisible();
    await expect(this.interestRateInput).toBeVisible();
    await expect(this.fixedRatePeriodSelect).toBeVisible();
    await expect(this.monthlyPaymentInput).toBeVisible();
    await expect(this.marketSelect).toBeVisible();
    await expect(this.bankInput).toBeVisible();
    await expect(this.startDateInput).toBeVisible();
    await expect(this.mortgageNameInput).toBeVisible();
  }

  async expectDefaultValues() {
    await expect(this.loanAmountInput).toHaveValue("300000");
    await expect(this.interestRateInput).toHaveValue("3.5");
    await expect(this.fixedRatePeriodSelect).toHaveValue("10");
    await expect(this.monthlyPaymentInput).toHaveValue("1500");
    await expect(this.marketSelect).toHaveValue("DE");

    const today = new Date().toISOString().split("T")[0];
    await expect(this.startDateInput).toHaveValue(today);
  }

  async expectCalculationResults() {
    await expect(this.monthlyPaymentResult).toBeVisible();
    await expect(this.totalCostResult).toBeVisible();
    await expect(this.currentBalanceResult).toBeVisible();
    await expect(this.monthsElapsedResult).toBeVisible();
    await expect(this.remainingMonthsResult).toBeVisible();
    await expect(this.payoffDateResult).toBeVisible();
  }

  async expectActionButtons() {
    await expect(this.addToPortfolioButton).toBeVisible();
    await expect(this.saveDraftButton).toBeVisible();
  }

  async expectInitialState() {
    await expect(this.initialStateMessage).toBeVisible();
  }

  async expectCurrencyFormatting() {
    const currencyElements = this.page.locator("text=/€[0-9,]+\\.[0-9]{2}/");
    await expect(currencyElements.first()).toBeVisible();
  }

  // Helper methods
  async expectValidationAlert(message: string) {
    return new Promise<void>((resolve) => {
      this.page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain(message);
        await dialog.accept();
        resolve();
      });
    });
  }

  async getPastDate(yearsAgo: number): Promise<string> {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - yearsAgo);
    return pastDate.toISOString().split("T")[0];
  }
}
