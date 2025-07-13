/**
 * User-focused Browser Tests for PaymentBreakdown Component
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can see and understand - payment breakdowns and German terminology.
 */

import { render } from "vitest-browser-vue";
import { expect, test } from "vitest";
import PaymentBreakdown from "../PaymentBreakdown.vue";

const mockBreakdown = {
  totalPayment: 1441.76,
  principalPayment: 958.43,
  interestPayment: 483.33,
  principalPercentage: 66.5,
  interestPercentage: 33.5,
};

test("user sees monthly payment breakdown", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  await expect
    .element(screen.getByText("Total Monthly Payment"))
    .toBeInTheDocument();
});

test("user sees total monthly payment amount", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  await expect
    .element(screen.getByText("Total Monthly Payment"))
    .toBeInTheDocument();

  // User should see the payment amount in German currency format
  await expect.element(screen.getByText(/1\.441,76/)).toBeInTheDocument();
});

test("user sees principal payment (Tilgung) section", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  // User sees both English and German terms
  await expect.element(screen.getByText("Principal")).toBeInTheDocument();
  await expect.element(screen.getByText("(Tilgung)")).toBeInTheDocument();

  // User should see principal amount - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("principal-payment"))
    .toBeInTheDocument();

  // Verify the amount is correct
  await expect
    .element(screen.getByTestId("principal-payment"))
    .toHaveTextContent(/958,43/);
});

test("user sees interest payment (Zinsen) section", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  // User sees both English and German terms
  await expect.element(screen.getByText("Interest")).toBeInTheDocument();
  await expect.element(screen.getByText("(Zinsen)")).toBeInTheDocument();

  // User should see interest amount - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("interest-payment"))
    .toBeInTheDocument();

  // Verify the amount is correct
  await expect
    .element(screen.getByTestId("interest-payment"))
    .toHaveTextContent(/483,33/);
});

test("user sees visual progress bar showing payment distribution", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  // Check that visual elements exist with percentages
  await expect
    .element(screen.getByTestId("principal-percentage"))
    .toBeInTheDocument();

  await expect
    .element(screen.getByTestId("interest-percentage"))
    .toBeInTheDocument();
});

test("user can understand investment terminology", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  // Key investment terms should be visible to the user
  await expect
    .element(screen.getByText("Total Monthly Payment"))
    .toBeInTheDocument();

  await expect.element(screen.getByText("Principal")).toBeInTheDocument();
  await expect.element(screen.getByText("Interest")).toBeInTheDocument();

  // German translations are still shown for reference
  await expect.element(screen.getByText("(Tilgung)")).toBeInTheDocument();
  await expect.element(screen.getByText("(Zinsen)")).toBeInTheDocument();
});

test("user sees percentages for understanding payment split", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  });

  // User should see percentage information - use test ids to avoid duplicates
  await expect
    .element(screen.getByTestId("principal-percentage"))
    .toBeInTheDocument();

  await expect
    .element(screen.getByTestId("principal-percentage"))
    .toHaveTextContent(/66,5/);

  await expect
    .element(screen.getByTestId("interest-percentage"))
    .toBeInTheDocument();

  await expect
    .element(screen.getByTestId("interest-percentage"))
    .toHaveTextContent(/33,5/);
});
