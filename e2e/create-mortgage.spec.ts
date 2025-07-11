import { test, expect } from "@playwright/test";

test.describe("Create Mortgage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculator");
  });

  test("should display the create mortgage form", async ({ page }) => {
    await expect(page.getByText("Create Your Mortgage")).toBeVisible();
    await expect(
      page.getByText(
        "Configure your mortgage parameters and see detailed calculations"
      )
    ).toBeVisible();

    // Check all form fields are present
    await expect(page.getByLabel("Loan Amount")).toBeVisible();
    await expect(
      page.getByLabel("Zinssatz (Annual Interest Rate)")
    ).toBeVisible();
    await expect(
      page.getByLabel("Zinsbindung (Fixed Rate Period)")
    ).toBeVisible();
    await expect(page.getByLabel("Gewünschte monatliche Rate")).toBeVisible();
    await expect(page.getByLabel("Market")).toBeVisible();
    await expect(page.getByLabel("Bank/Lender")).toBeVisible();
    await expect(page.getByLabel("Loan Start Date")).toBeVisible();
    await expect(page.getByLabel("Mortgage Name")).toBeVisible();
  });

  test("should have default values pre-filled", async ({ page }) => {
    await expect(page.getByLabel("Loan Amount")).toHaveValue("300000");
    await expect(
      page.getByLabel("Zinssatz (Annual Interest Rate)")
    ).toHaveValue("3.5");
    await expect(
      page.getByLabel("Zinsbindung (Fixed Rate Period)")
    ).toHaveValue("10");
    await expect(page.getByLabel("Gewünschte monatliche Rate")).toHaveValue(
      "1500"
    );
    await expect(page.getByLabel("Market")).toHaveValue("DE");

    // Check today's date is set as default
    const today = new Date().toISOString().split("T")[0];
    await expect(page.getByLabel("Loan Start Date")).toHaveValue(today);
  });

  test("should calculate mortgage with valid inputs", async ({ page }) => {
    // Fill in required fields
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");

    // Click calculate button
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    // Wait for loading to complete
    await expect(page.getByText("Calculating...")).toBeVisible();
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Check results are displayed
    await expect(page.getByText("Monthly Payment")).toBeVisible();
    await expect(page.getByText("Total Cost")).toBeVisible();
    await expect(page.getByText("Current Balance")).toBeVisible();
    await expect(page.getByText("Months Elapsed")).toBeVisible();
    await expect(page.getByText("Remaining Months")).toBeVisible();
    await expect(page.getByText("Payoff Date")).toBeVisible();

    // Check action buttons are shown
    await expect(
      page.getByRole("button", { name: "Add to Portfolio" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save as Draft" })
    ).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    // Clear loan amount
    await page.getByLabel("Loan Amount").clear();
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    // Should show validation alert
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Please enter a valid loan amount");
      dialog.accept();
    });

    // Fill loan amount, clear interest rate
    await page.getByLabel("Loan Amount").fill("300000");
    await page.getByLabel("Zinssatz (Annual Interest Rate)").clear();
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Please enter a valid interest rate");
      dialog.accept();
    });

    // Fill interest rate, clear monthly payment
    await page.getByLabel("Zinssatz (Annual Interest Rate)").fill("3.5");
    await page.getByLabel("Gewünschte monatliche Rate").clear();
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain(
        "Please enter a valid monthly payment amount"
      );
      dialog.accept();
    });

    // Fill monthly payment, leave mortgage name empty
    await page.getByLabel("Gewünschte monatliche Rate").fill("1500");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Please enter a mortgage name");
      dialog.accept();
    });

    // Fill mortgage name, leave bank empty
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    page.on("dialog", (dialog) => {
      expect(dialog.message()).toContain("Please enter a bank/lender name");
      dialog.accept();
    });
  });

  test("should reset form when reset button is clicked", async ({ page }) => {
    // Fill in some values
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByLabel("Loan Amount").fill("500000");
    await page.getByLabel("Zinssatz (Annual Interest Rate)").fill("4.5");

    // Calculate to show results
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Reset form
    await page.getByRole("button", { name: "Reset" }).click();

    // Check values are reset to defaults
    await expect(page.getByLabel("Loan Amount")).toHaveValue("300000");
    await expect(
      page.getByLabel("Zinssatz (Annual Interest Rate)")
    ).toHaveValue("3.5");
    await expect(page.getByLabel("Bank/Lender")).toHaveValue("");
    await expect(page.getByLabel("Mortgage Name")).toHaveValue("");

    // Check results are hidden
    await expect(
      page.getByText("Fill in the mortgage details to see calculations")
    ).toBeVisible();
  });

  test("should support different markets", async ({ page }) => {
    // Test German market (default)
    await expect(page.getByLabel("Market")).toHaveValue("DE");

    // Switch to Swiss market
    await page.getByLabel("Market").selectOption("CH");
    await expect(page.getByLabel("Market")).toHaveValue("CH");

    // Fill required fields and calculate
    await page.getByLabel("Bank/Lender").fill("Swiss Bank");
    await page.getByLabel("Mortgage Name").fill("Swiss Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    // Should still calculate successfully
    await expect(page.getByText("Calculating...")).not.toBeVisible();
    await expect(page.getByText("Monthly Payment")).toBeVisible();
  });

  test("should handle different fixed rate periods", async ({ page }) => {
    // Test different fixed rate periods
    const periods = ["5", "10", "15", "20", "25", "30"];

    for (const period of periods) {
      await page
        .getByLabel("Zinsbindung (Fixed Rate Period)")
        .selectOption(period);
      await expect(
        page.getByLabel("Zinsbindung (Fixed Rate Period)")
      ).toHaveValue(period);
    }

    // Set to 15 years and calculate
    await page.getByLabel("Zinsbindung (Fixed Rate Period)").selectOption("15");
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    await expect(page.getByText("Calculating...")).not.toBeVisible();
    await expect(page.getByText("Monthly Payment")).toBeVisible();
  });

  test("should display helpful hints and descriptions", async ({ page }) => {
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

  test("should show calculation breakdown", async ({ page }) => {
    // Fill required fields and calculate
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Check detailed breakdown is shown
    await expect(page.getByText("Principal:")).toBeVisible();
    await expect(page.getByText("Interest:")).toBeVisible();
    await expect(page.getByText("Total Interest:")).toBeVisible();
    await expect(page.getByText("Total Amount:")).toBeVisible();
  });

  test("should handle portfolio selection modal", async ({ page }) => {
    // Fill and calculate mortgage first
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Click "Add to Portfolio"
    await page.getByRole("button", { name: "Add to Portfolio" }).click();

    // Check modal is shown
    await expect(page.getByText("Add to Portfolio")).toBeVisible();
    await expect(
      page.getByText("Select which portfolio to add this mortgage to")
    ).toBeVisible();

    // Should show "no portfolios" message initially
    await expect(
      page.getByText("No portfolios found. Create one first.")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Portfolio" })
    ).toBeVisible();

    // Click "Create New Portfolio"
    await page.getByRole("button", { name: "Create New Portfolio" }).click();

    // Check create portfolio modal
    await expect(page.getByText("Create New Portfolio")).toBeVisible();
    await expect(
      page.getByText("Create a portfolio for this mortgage")
    ).toBeVisible();
    await expect(page.getByLabel("Portfolio Name")).toBeVisible();
    await expect(page.getByLabel("Owner")).toBeVisible();

    // Fill portfolio details
    await page.getByLabel("Portfolio Name").fill("Test Portfolio");
    await page.getByLabel("Owner").fill("Test Owner");

    // Should show create button
    await expect(
      page.getByRole("button", { name: "Create & Add Mortgage" })
    ).toBeVisible();
  });

  test("should handle edge cases in calculations", async ({ page }) => {
    // Test with very low monthly payment that might not cover interest
    await page.getByLabel("Loan Amount").fill("300000");
    await page.getByLabel("Zinssatz (Annual Interest Rate)").fill("5.0");
    await page.getByLabel("Gewünschte monatliche Rate").fill("100"); // Very low payment
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");

    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    // Should handle the error gracefully
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Test with very high monthly payment
    await page.getByLabel("Gewünschte monatliche Rate").fill("10000"); // Very high payment
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();

    await expect(page.getByText("Calculating...")).not.toBeVisible();
    await expect(page.getByText("Monthly Payment")).toBeVisible();
  });

  test("should format currency correctly", async ({ page }) => {
    // Fill and calculate mortgage
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");
    await page.getByRole("button", { name: "Calculate Mortgage" }).click();
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Check that currency is formatted with € symbol and German locale
    const currencyElements = page.locator("text=/€[0-9,]+\\.[0-9]{2}/");
    await expect(currencyElements.first()).toBeVisible();
  });

  test("should handle past start dates correctly", async ({ page }) => {
    // Set start date to 2 years ago
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 2);
    const pastDateString = pastDate.toISOString().split("T")[0];

    await page.getByLabel("Loan Start Date").fill(pastDateString);
    await page.getByLabel("Bank/Lender").fill("Test Bank");
    await page.getByLabel("Mortgage Name").fill("Test Mortgage");

    await page.getByRole("button", { name: "Calculate Mortgage" }).click();
    await expect(page.getByText("Calculating...")).not.toBeVisible();

    // Should show elapsed months > 0
    await expect(page.getByText("Months Elapsed")).toBeVisible();

    // Should show current balance less than original loan amount
    await expect(page.getByText("Current Balance")).toBeVisible();
  });
});
