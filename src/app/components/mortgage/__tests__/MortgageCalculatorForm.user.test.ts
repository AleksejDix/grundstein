/**
 * User-focused Browser Tests for EnhancedMortgageCalculatorForm
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can do - clicking, typing, seeing results.
 */

import { render } from "vitest-browser-vue";
import { expect, test } from "vitest";
import EnhancedMortgageCalculatorForm from "../EnhancedMortgageCalculatorForm.vue";

test("shows mortgage calculator heading", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  await expect
    .element(screen.getByText("Mortgage Calculator"))
    .toBeInTheDocument();
});

test("shows loan amount input field", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  const loanAmountInput = screen.getByLabelText(/loan amount/i);
  await expect.element(loanAmountInput).toBeInTheDocument();
});

test("allows user to type in loan amount", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  const loanAmountInput = screen.getByLabelText(/loan amount/i);
  await loanAmountInput.fill("300000");

  await expect.element(loanAmountInput).toHaveValue(300000);
});

test("shows German market terminology", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // User should see German mortgage terms
  await expect.element(screen.getByText(/darlehenssumme/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/zinssatz/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/laufzeit/i)).toBeInTheDocument();
});

test("shows interactive features info", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // Instead of a calculate button, we have interactive features
  await expect
    .element(screen.getByText("🔒 Interactive Features"))
    .toBeInTheDocument();
  
  await expect
    .element(screen.getByText(/Real-time Updates/))
    .toBeInTheDocument();
});

test("user can fill in complete form", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // User fills in loan amount
  const loanAmountInput = screen.getByLabelText(/loan amount.*darlehenssumme/i);
  await loanAmountInput.fill("300000");
  await expect.element(loanAmountInput).toHaveValue(300000);

  // User fills in interest rate
  const interestRateInput = screen.getByLabelText(
    /annual interest rate.*zinssatz/i,
  );
  await interestRateInput.fill("3.5");
  await expect.element(interestRateInput).toHaveValue(3.5);

  // User fills in loan term in months
  const loanTermInput = screen.getByLabelText(/loan term.*laufzeit/i);
  await loanTermInput.fill("360"); // 30 years = 360 months
  await expect.element(loanTermInput).toHaveValue(360);
});

test("shows real-time results section", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // The results section is shown when calculations are valid
  // It contains the payment breakdown and financial summary components
  await expect.element(screen.getByText("Monatliche Rate aufgeschlüsselt")).toBeInTheDocument();
  
  // Should show financial summary
  await expect.element(screen.getByText("Jahresübersicht (Erstes Jahr)")).toBeInTheDocument();
});
