/**
 * User-focused Browser Tests for EnhancedMortgageCalculatorForm
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can do - clicking, typing, seeing results.
 */

import { render } from "vitest-browser-vue";
import { expect, test } from "vitest";
import EnhancedMortgageCalculatorForm from "../EnhancedMortgageCalculatorForm.vue";

test("shows investment property calculator heading", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  await expect
    .element(screen.getByText("Investment Property Calculator"))
    .toBeInTheDocument();
});

test("shows property price input field", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  const propertyPriceInput = screen.getByLabelText(/property price/i);
  await expect.element(propertyPriceInput).toBeInTheDocument();
});

test("allows user to type in property price", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  const propertyPriceInput = screen.getByLabelText(/property price/i);
  await propertyPriceInput.fill("300000");

  await expect.element(propertyPriceInput).toHaveValue(300000);
});

test("shows investment property terminology", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // User should see investment property terms
  await expect.element(screen.getByText(/property price/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/interest rate/i)).toBeInTheDocument();
  await expect.element(screen.getByText(/loan term/i)).toBeInTheDocument();
  await expect
    .element(screen.getByText(/monthly payment/i))
    .toBeInTheDocument();
});

test("shows investment metrics section", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // Investment property calculator should show key metrics
  await expect.element(screen.getByText(/monthly cost/i)).toBeInTheDocument();

  await expect.element(screen.getByText(/rental income/i)).toBeInTheDocument();
});

test("user can fill in complete form", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // User fills in property price
  const propertyPriceInput = screen.getByLabelText(/property price/i);
  await propertyPriceInput.fill("300000");
  await expect.element(propertyPriceInput).toHaveValue(300000);

  // User fills in interest rate
  const interestRateInput = screen.getByLabelText(/interest rate/i);
  await interestRateInput.fill("3.5");
  await expect.element(interestRateInput).toHaveValue(3.5);

  // User fills in loan term in months
  const loanTermInput = screen.getByLabelText(/loan term/i);
  await loanTermInput.fill("360"); // 30 years = 360 months
  await expect.element(loanTermInput).toHaveValue(360);
});

test("shows investment analysis results", async () => {
  const screen = render(EnhancedMortgageCalculatorForm);

  // The results section shows investment analysis
  await expect.element(screen.getByText(/total cost/i)).toBeInTheDocument();

  // Should show equity building metrics
  await expect
    .element(screen.getByText(/building equity/i))
    .toBeInTheDocument();

  // Should show ROI information
  await expect.element(screen.getByText(/roi check/i)).toBeInTheDocument();
});
