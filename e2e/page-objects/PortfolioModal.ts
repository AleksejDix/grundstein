import { Page, expect } from "@playwright/test";

export class PortfolioModal {
  constructor(private page: Page) {}

  // Modal elements
  get modal() {
    return this.page.locator('[role="dialog"]');
  }

  get modalTitle() {
    return this.page.getByText("Add to Portfolio");
  }

  get modalSubtitle() {
    return this.page.getByText(
      "Select which portfolio to add this mortgage to"
    );
  }

  get noPortfoliosMessage() {
    return this.page.getByText("No portfolios found. Create one first.");
  }

  get createPortfolioButton() {
    return this.page.getByRole("button", { name: "Create Portfolio" });
  }

  get createNewPortfolioButton() {
    return this.page.getByRole("button", { name: "Create New Portfolio" });
  }

  get cancelButton() {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  // Actions
  async expectModalToBeVisible() {
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalSubtitle).toBeVisible();
  }

  async expectNoPortfoliosState() {
    await expect(this.noPortfoliosMessage).toBeVisible();
    await expect(this.createPortfolioButton).toBeVisible();
  }

  async createNewPortfolio() {
    await this.createNewPortfolioButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async selectPortfolio(portfolioName: string) {
    await this.page.getByText(portfolioName).click();
  }
}

export class CreatePortfolioModal {
  constructor(private page: Page) {}

  // Modal elements
  get modalTitle() {
    return this.page.getByText("Create New Portfolio");
  }

  get modalSubtitle() {
    return this.page.getByText("Create a portfolio for this mortgage");
  }

  get portfolioNameInput() {
    return this.page.getByLabel("Portfolio Name");
  }

  get ownerInput() {
    return this.page.getByLabel("Owner");
  }

  get cancelButton() {
    return this.page.getByRole("button", { name: "Cancel" });
  }

  get createButton() {
    return this.page.getByRole("button", { name: "Create & Add Mortgage" });
  }

  get loadingButton() {
    return this.page.getByRole("button", { name: "Creating..." });
  }

  // Actions
  async expectModalToBeVisible() {
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalSubtitle).toBeVisible();
    await expect(this.portfolioNameInput).toBeVisible();
    await expect(this.ownerInput).toBeVisible();
  }

  async fillPortfolioDetails(name: string, owner: string) {
    await this.portfolioNameInput.fill(name);
    await this.ownerInput.fill(owner);
  }

  async createPortfolio() {
    await this.createButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectCreatingState() {
    await expect(this.loadingButton).toBeVisible();
  }
}
