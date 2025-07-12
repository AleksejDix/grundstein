/**
 * User-focused Browser Tests for MortgageCalculatorForm
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can do - clicking, typing, seeing results.
 */

import { render } from "vitest-browser-vue";
import { expect, test } from "vitest";
import MortgageCalculatorForm from "../MortgageCalculatorForm.vue";

test("shows mortgage calculator heading", async () => {
  const screen = render(MortgageCalculatorForm);

  await expect
    .element(screen.getByText("Mortgage Calculator"))
    .toBeInTheDocument();
});

test("shows loan amount input field", async () => {
  const screen = render(MortgageCalculatorForm);

  const loanAmountInput = screen.getByLabelText(/loan amount/i);
  await expect.element(loanAmountInput).toBeInTheDocument();
});

test("allows user to type in loan amount", async () => {
  const screen = render(MortgageCalculatorForm);

  const loanAmountInput = screen.getByLabelText(/loan amount/i);
  await loanAmountInput.fill("300000");

  await expect.element(loanAmountInput).toHaveValue(300000);
});

test("shows German market terminology", async () => {
  const screen = render(MortgageCalculatorForm);

  // User should see German mortgage terms
  await expect.element(screen.getByText(/darlehenssumme/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/zinssatz/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/laufzeit/i)).toBeInTheDocument();
});

test("shows calculate button", async () => {
  const screen = render(MortgageCalculatorForm);

  await expect
    .element(screen.getByRole("button", { name: /calculate monthly payment/i }))
    .toBeInTheDocument();
});

test("user can fill in complete form", async () => {
  const screen = render(MortgageCalculatorForm);

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

  // User fills in loan term years
  const loanTermInput = screen.getByRole("spinbutton").nth(2);
  await loanTermInput.fill("30");
  await expect.element(loanTermInput).toHaveValue(30);
});

test("shows results section with quick preview", async () => {
  const screen = render(MortgageCalculatorForm);

  // Results should be visible in the Quick Preview section
  await expect.element(screen.getByText("Quick Preview")).toBeInTheDocument();
});
