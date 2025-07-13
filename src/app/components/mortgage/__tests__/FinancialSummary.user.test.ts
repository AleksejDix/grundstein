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

test("user sees first year overview heading in German", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Jahresübersicht (Erstes Jahr)"))
    .toBeInTheDocument();
});

test("user sees total payments for the year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Gesamte Zahlungen"))
    .toBeInTheDocument();

  // User should see total payments in German currency format
  await expect.element(screen.getByText(/17\.301,12/)).toBeInTheDocument();

  await expect.element(screen.getByText("12 Monate")).toBeInTheDocument();
});

test("user sees total interest paid in first year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Zinsen gesamt")).toBeInTheDocument();

  // User should see interest amount
  await expect.element(screen.getByText(/5\.799,96/)).toBeInTheDocument();

  // Use a more specific selector to avoid strict mode violation
  const yearLabel = screen.getByText("Jahr 1").first();
  await expect.element(yearLabel).toBeInTheDocument();
});

test("user sees total principal paid in first year", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect.element(screen.getByText("Tilgung gesamt")).toBeInTheDocument();

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

  await expect.element(screen.getByText("Restschuld")).toBeInTheDocument();

  // User should see remaining balance
  await expect.element(screen.getByText(/288\.498,84/)).toBeInTheDocument();

  await expect.element(screen.getByText("Nach Jahr 1")).toBeInTheDocument();
});

test("user sees paydown progress visualization", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  await expect
    .element(screen.getByText("Tilgungsfortschritt"))
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

  await expect
    .element(screen.getByText("Wichtige Kennzahlen"))
    .toBeInTheDocument();

  await expect
    .element(screen.getByText("Effektivzins p.a.:"))
    .toBeInTheDocument();

  await expect
    .element(screen.getByText("Tilgungsrate p.a.:"))
    .toBeInTheDocument();
});

test("user understands German mortgage terminology", async () => {
  const screen = render(FinancialSummary, {
    props: {
      summary: mockSummary,
    },
  });

  // All German terms should be visible to the user
  const germanTerms = [
    "Jahresübersicht (Erstes Jahr)",
    "Gesamte Zahlungen",
    "Zinsen gesamt",
    "Tilgung gesamt",
    "Restschuld",
    "Tilgungsfortschritt",
    "Wichtige Kennzahlen",
    "Effektivzins p.a.",
    "Tilgungsrate p.a.",
  ];

  for (const term of germanTerms) {
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
  await expect.element(screen.getByText(/getilgt/)).toBeInTheDocument();
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
