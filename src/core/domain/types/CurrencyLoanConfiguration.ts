/**
 * Currency-aware Loan Configuration
 *
 * Extends LoanConfiguration to support multiple currencies
 * Ensures type safety between EUR and CHF mortgages
 */

import type { EUR, CHF, CurrencyCode } from "../value-objects/Currency";
import type { InterestRate } from "../value-objects/InterestRate";
import type { MonthCount } from "../value-objects/MonthCount";

// EUR-specific loan configuration
export type EURLoanConfiguration = {
  readonly amount: EUR;
  readonly annualRate: InterestRate;
  readonly termInMonths: MonthCount;
  readonly monthlyPayment: EUR;
  readonly currency: "EUR";
};

// CHF-specific loan configuration
export type CHFLoanConfiguration = {
  readonly amount: CHF;
  readonly annualRate: InterestRate;
  readonly termInMonths: MonthCount;
  readonly monthlyPayment: CHF;
  readonly currency: "CHF";
};

// Union type for all supported loan configurations
export type CurrencyLoanConfiguration =
  | EURLoanConfiguration
  | CHFLoanConfiguration;

// Type guard functions
export function isEURLoan(
  config: CurrencyLoanConfiguration,
): config is EURLoanConfiguration {
  return config.currency === "EUR";
}

export function isCHFLoan(
  config: CurrencyLoanConfiguration,
): config is CHFLoanConfiguration {
  return config.currency === "CHF";
}

// Helper to get currency code from configuration
export function getLoanCurrency(
  config: CurrencyLoanConfiguration,
): CurrencyCode {
  return config.currency;
}

// Calculate total interest with proper currency types
export function calculateTotalInterestEUR(config: EURLoanConfiguration): EUR {
  const totalPayments =
    (config.monthlyPayment as number) * (config.termInMonths as number);
  const totalInterest = totalPayments - (config.amount as number);
  return totalInterest as EUR;
}

export function calculateTotalInterestCHF(config: CHFLoanConfiguration): CHF {
  const totalPayments =
    (config.monthlyPayment as number) * (config.termInMonths as number);
  const totalInterest = totalPayments - (config.amount as number);
  return totalInterest as CHF;
}
