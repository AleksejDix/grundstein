/**
 * User-focused Browser Tests for FinancialSummary Component
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can see and understand - first year financial summary.
 */

import { render } from "vitest-browser-vue";
import { expect, test } from "vitest";
import FinancialSummary from "../FinancialSummary.vue";

const mockSummary = {
  totalPayments: 17301.12,
  totalInterest: 5799.96,
  totalPrincipal: 11501.16,
  remainingBalance: 288498.84,
  paydownPercentage: 3.83,
  originalLoanAmount: 300000,
  effectiveRate: 3.5,
  annualPaydownRate: 3.83,
};

test("user sees paydown progress section", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Paydown Progress"))
    .toBeInTheDocument();
});

test("user sees total payments for the year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Total Payments")).toBeInTheDocument();

  // User should see total payments in German currency format
  await expect.element(screen.getByText(/17\.301,12/)).toBeInTheDocument();

  await expect.element(screen.getByText("12 months")).toBeInTheDocument();
});

test("user sees total interest paid in first year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Interest Paid")).toBeInTheDocument();

  // User should see interest amount
  await expect.element(screen.getByText(/5\.799,96/)).toBeInTheDocument();
});

test("user sees total principal paid in first year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Principal Paid")).toBeInTheDocument();

  // User should see principal amount - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("total-principal"))
    .toBeInTheDocument();

  // Verify the amount is correct
  await expect
    .element(screen.getByTestId("total-principal"))
    .toHaveTextContent(/11\.501,16/);
});

test("user sees remaining balance after first year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Remaining Balance"))
    .toBeInTheDocument();

  // User should see remaining balance
  await expect.element(screen.getByText(/288\.498,84/)).toBeInTheDocument();
});

test("user sees paydown progress visualization", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Paydown Progress"))
    .toBeInTheDocument();

  // User should see progress percentage - use test id to avoid duplicates
  await expect.element(screen.getByTestId("paydown-rate")).toBeInTheDocument();

  // Verify the percentage is correct
  await expect
    .element(screen.getByTestId("paydown-rate"))
    .toHaveTextContent(/3,8/);
});

test("user sees key financial metrics", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Effective Rate")).toBeInTheDocument();

  await expect.element(screen.getByText("Annual Paydown")).toBeInTheDocument();
});

test("user understands investment terminology", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  // All investment terms should be visible to the user
  const investmentTerms = [
    "Total Payments",
    "Interest Paid",
    "Principal Paid",
    "Remaining Balance",
    "Paydown Progress",
    "Effective Rate",
    "Annual Paydown",
  ];

  for (const term of investmentTerms) {
    await expect.element(screen.getByText(term)).toBeInTheDocument();
  }
});

test("user sees progress summary showing loan paydown", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  // User should see how much was paid down vs original loan
  await expect.element(screen.getByText(/300\.000,00/)).toBeInTheDocument();
});

test("user can see effective rate and annual paydown rate", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  // User should see effective rate - use test id to avoid issues
  await expect
    .element(screen.getByTestId("effective-rate"))
    .toHaveTextContent(/3,5/);

  // User should see paydown rate - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("paydown-rate"))
    .toHaveTextContent(/3,8/);
});
