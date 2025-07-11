import { describe, it, expect } from "vitest";

// Mock functions that should be properly implemented
function calculateCurrentBalance(
  originalLoan: number,
  interestRate: number, // annual percentage
  termMonths: number,
  monthsElapsed: number,
  extraPayments: Record<number, number> = {}
): number {
  // This is the CORRECT way to calculate current balance
  const monthlyRate = interestRate / 100 / 12;

  // Calculate monthly payment using loan formula
  const monthlyPayment =
    (originalLoan * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = originalLoan;

  // Simulate each month
  for (let month = 1; month <= monthsElapsed; month++) {
    // Calculate interest for this month
    const monthlyInterest = balance * monthlyRate;

    // Calculate principal payment
    const principalPayment = monthlyPayment - monthlyInterest;

    // Add any extra payment for this month
    const extraPayment = extraPayments[month] || 0;

    // Update balance
    balance = balance - principalPayment - extraPayment;

    // Don't let balance go negative
    if (balance < 0) balance = 0;
  }

  return balance;
}

function calculateRemainingPayments(
  currentBalance: number,
  interestRate: number,
  originalMonthlyPayment: number
): number {
  if (currentBalance <= 0) return 0;

  const monthlyRate = interestRate / 100 / 12;

  // Calculate remaining payments using loan formula
  const remainingPayments =
    -Math.log(1 - (currentBalance * monthlyRate) / originalMonthlyPayment) /
    Math.log(1 + monthlyRate);

  return Math.ceil(remainingPayments);
}

function calculateRemainingInterest(
  currentBalance: number,
  interestRate: number,
  originalMonthlyPayment: number
): number {
  const remainingPayments = calculateRemainingPayments(
    currentBalance,
    interestRate,
    originalMonthlyPayment
  );
  const totalRemainingPayments = remainingPayments * originalMonthlyPayment;
  return Math.max(0, totalRemainingPayments - currentBalance);
}

describe("Realistic Debt Scenarios", () => {
  it("should correctly calculate current balance for €50k loan after 3 years with extra payments", () => {
    // Scenario: €50k loan, 0.8% interest, 10 years, started May 2021
    // Now May 2024 (36 months elapsed), €2,500 extra paid in first year

    const originalLoan = 50000;
    const interestRate = 0.8; // 0.8% annual
    const termMonths = 120; // 10 years
    const monthsElapsed = 36; // 3 years

    // €2,500 extra in first year (let's say €208 per month for 12 months)
    const extraPayments: Record<number, number> = {};
    for (let month = 1; month <= 12; month++) {
      extraPayments[month] = 208; // €2,500 / 12 ≈ €208
    }

    const currentBalance = calculateCurrentBalance(
      originalLoan,
      interestRate,
      termMonths,
      monthsElapsed,
      extraPayments
    );

    // After 3 years of payments + €2,500 extra, balance should be much lower than €50k
    expect(currentBalance).toBeLessThan(35000); // Should be around €30k-34k
    expect(currentBalance).toBeGreaterThan(25000);

    console.log(`Current balance after 3 years: €${currentBalance.toFixed(2)}`);
  });

  it("should calculate realistic remaining payments for current balance", () => {
    const originalLoan = 50000;
    const interestRate = 0.8;
    const termMonths = 120;
    const monthsElapsed = 36;

    const extraPayments: Record<number, number> = {};
    for (let month = 1; month <= 12; month++) {
      extraPayments[month] = 208;
    }

    const currentBalance = calculateCurrentBalance(
      originalLoan,
      interestRate,
      termMonths,
      monthsElapsed,
      extraPayments
    );

    // Calculate original monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const originalMonthlyPayment =
      (originalLoan * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const remainingPayments = calculateRemainingPayments(
      currentBalance,
      interestRate,
      originalMonthlyPayment
    );

    // Should have fewer than 84 payments left (120 - 36)
    expect(remainingPayments).toBeLessThan(84);
    expect(remainingPayments).toBeGreaterThan(60); // Due to extra payments

    console.log(`Remaining payments: ${remainingPayments}`);
  });

  it("should calculate realistic remaining interest", () => {
    const originalLoan = 50000;
    const interestRate = 0.8;
    const termMonths = 120;
    const monthsElapsed = 36;

    const extraPayments: Record<number, number> = {};
    for (let month = 1; month <= 12; month++) {
      extraPayments[month] = 208;
    }

    const currentBalance = calculateCurrentBalance(
      originalLoan,
      interestRate,
      termMonths,
      monthsElapsed,
      extraPayments
    );

    const monthlyRate = interestRate / 100 / 12;
    const originalMonthlyPayment =
      (originalLoan * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const remainingInterest = calculateRemainingInterest(
      currentBalance,
      interestRate,
      originalMonthlyPayment
    );

    // With 0.8% interest, remaining interest should be relatively low
    expect(remainingInterest).toBeLessThan(2000);
    expect(remainingInterest).toBeGreaterThan(500);

    console.log(`Remaining interest: €${remainingInterest.toFixed(2)}`);
  });

  it("should handle edge case: loan almost paid off", () => {
    const currentBalance = calculateCurrentBalance(50000, 0.8, 120, 110, {}); // Almost finished

    expect(currentBalance).toBeLessThan(5000);

    const monthlyRate = 0.8 / 100 / 12;
    const originalMonthlyPayment =
      (50000 * (monthlyRate * Math.pow(1 + monthlyRate, 120))) /
      (Math.pow(1 + monthlyRate, 120) - 1);

    const remainingPayments = calculateRemainingPayments(
      currentBalance,
      0.8,
      originalMonthlyPayment
    );
    expect(remainingPayments).toBeLessThan(15); // Less than 15 payments left
  });

  it("should handle edge case: loan fully paid off", () => {
    const currentBalance = calculateCurrentBalance(50000, 0.8, 120, 120, {}); // Fully paid

    expect(currentBalance).toBe(0);

    const monthlyRate = 0.8 / 100 / 12;
    const originalMonthlyPayment =
      (50000 * (monthlyRate * Math.pow(1 + monthlyRate, 120))) /
      (Math.pow(1 + monthlyRate, 120) - 1);

    const remainingPayments = calculateRemainingPayments(
      currentBalance,
      0.8,
      originalMonthlyPayment
    );
    expect(remainingPayments).toBe(0);

    const remainingInterest = calculateRemainingInterest(
      currentBalance,
      0.8,
      originalMonthlyPayment
    );
    expect(remainingInterest).toBe(0);
  });

  it("should demonstrate the broken current implementation", () => {
    // This test shows how broken the current implementation is
    const originalLoan = 50000;
    const extraPayments = { 1: 208, 2: 208, 3: 208 }; // Just €624 extra

    // Current broken implementation
    const brokenCurrentBalance = Math.max(
      0,
      originalLoan -
        Object.values(extraPayments).reduce((sum, amount) => sum + amount, 0)
    );

    // This would return €49,376 (€50,000 - €624)
    // But after 3 years of regular payments, the balance should be much lower!

    expect(brokenCurrentBalance).toBe(49376);

    // The correct balance after 36 months should be much lower
    const correctBalance = calculateCurrentBalance(
      originalLoan,
      0.8,
      120,
      36,
      extraPayments
    );
    expect(correctBalance).toBeLessThan(35000);

    console.log(`Broken implementation: €${brokenCurrentBalance}`);
    console.log(`Correct implementation: €${correctBalance.toFixed(2)}`);
    console.log(
      `Difference: €${(brokenCurrentBalance - correctBalance).toFixed(
        2
      )} wrong!`
    );
  });
});
