/**
 * User-focused Browser Tests for PaymentBreakdown Component
 *
 * These tests run in a real browser with Playwright and test actual user interactions.
 * They focus on what users can see and understand - payment breakdowns and German terminology.
 */

import { render } from "vitest-browser-vue"
import { expect, test } from "vitest"
import PaymentBreakdown from "../PaymentBreakdown.vue"

const mockBreakdown = {
  totalPayment: 1441.76,
  principalPayment: 958.43,
  interestPayment: 483.33,
  principalPercentage: 66.5,
  interestPercentage: 33.5,
}

test("user sees monthly payment breakdown heading in German", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  await expect
    .element(screen.getByText("Monatliche Rate aufgeschlüsselt"))
    .toBeInTheDocument()
})

test("user sees total monthly payment amount", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  await expect
    .element(screen.getByText("Gesamte monatliche Rate"))
    .toBeInTheDocument()

  // User should see the payment amount in German currency format
  await expect
    .element(screen.getByText(/1\.441,76/))
    .toBeInTheDocument()
})

test("user sees principal payment (Tilgung) section", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  // Use more specific selector to find Tilgung heading
  const tilgungHeading = screen.getByText("Tilgung").first();
  await expect.element(tilgungHeading).toBeInTheDocument()

  // User should see principal amount - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("principal-payment"))
    .toBeInTheDocument()
    
  // Verify the amount is correct
  await expect
    .element(screen.getByTestId("principal-payment"))
    .toHaveTextContent(/958,43/)
})

test("user sees interest payment (Zinsen) section", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  // Use more specific selector to find Zinsen heading
  const zinsenHeading = screen.getByText("Zinsen").first();
  await expect.element(zinsenHeading).toBeInTheDocument()

  // User should see interest amount - use test id to avoid duplicates
  await expect
    .element(screen.getByTestId("interest-payment"))
    .toBeInTheDocument()
    
  // Verify the amount is correct
  await expect
    .element(screen.getByTestId("interest-payment"))
    .toHaveTextContent(/483,33/)
})

test("user sees visual progress bar showing payment distribution", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  await expect
    .element(screen.getByText("Verteilung der monatlichen Rate"))
    .toBeInTheDocument()

  await expect
    .element(screen.getByText("Tilgung / Zinsen"))
    .toBeInTheDocument()
})

test("user can understand German mortgage terminology", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  // All German terms should be visible to the user
  await expect
    .element(screen.getByText("Monatliche Rate aufgeschlüsselt"))
    .toBeInTheDocument()
    
  await expect
    .element(screen.getByText("Gesamte monatliche Rate"))
    .toBeInTheDocument()
    
  // For terms that appear multiple times, use first() to avoid strict mode violation
  const tilgungElement = screen.getByText("Tilgung").first();
  await expect.element(tilgungElement).toBeInTheDocument()
  
  const zinsenElement = screen.getByText("Zinsen").first();
  await expect.element(zinsenElement).toBeInTheDocument()
  
  await expect
    .element(screen.getByText("Verteilung der monatlichen Rate"))
    .toBeInTheDocument()
})

test("user sees percentages for understanding payment split", async () => {
  const screen = render(PaymentBreakdown, {
    props: {
      breakdown: mockBreakdown,
    },
  })

  // User should see percentage information - use test ids to avoid duplicates
  await expect
    .element(screen.getByTestId("principal-percentage"))
    .toBeInTheDocument()
    
  await expect
    .element(screen.getByTestId("principal-percentage"))
    .toHaveTextContent(/66,5/)
    
  await expect
    .element(screen.getByTestId("interest-percentage"))
    .toBeInTheDocument()
    
  await expect
    .element(screen.getByTestId("interest-percentage"))
    .toHaveTextContent(/33,5/)
})