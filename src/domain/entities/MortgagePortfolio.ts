/**
 * MortgagePortfolio - Domain Entity
 *
 * Represents a collection of mortgages for portfolio management
 * Focused on German mortgage market requirements
 */

import { Result } from "../types/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { Money } from "../types/Money";

// Portfolio entity ID type
export type PortfolioId = string;

// Mortgage entry in portfolio
export type MortgageEntry = {
  readonly id: string;
  readonly name: string;
  readonly configuration: LoanConfiguration;
  readonly bank: string;
  readonly startDate: Date;
  readonly notes?: string;
  readonly isActive: boolean;
};

// Portfolio aggregate
export type MortgagePortfolio = {
  readonly id: PortfolioId;
  readonly name: string;
  readonly owner: string;
  readonly mortgages: readonly MortgageEntry[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

// Portfolio summary for dashboard
export type PortfolioSummary = {
  readonly totalPrincipal: Money;
  readonly totalMonthlyPayment: Money;
  readonly averageInterestRate: number;
  readonly activeMortgages: number;
  readonly totalMortgages: number;
};

// Validation errors
export type PortfolioValidationError =
  | "InvalidPortfolioName"
  | "DuplicateMortgageId"
  | "InvalidMortgageEntry"
  | "EmptyPortfolio";

/**
 * Create a new mortgage portfolio
 */
export function createMortgagePortfolio(
  id: PortfolioId,
  name: string,
  owner: string
): Result<MortgagePortfolio, PortfolioValidationError> {
  if (!name.trim()) {
    return { success: false, error: "InvalidPortfolioName" };
  }

  const now = new Date();

  return {
    success: true,
    data: {
      id,
      name: name.trim(),
      owner: owner.trim(),
      mortgages: [],
      createdAt: now,
      updatedAt: now,
    },
  };
}

/**
 * Add mortgage to portfolio
 */
export function addMortgageToPortfolio(
  portfolio: MortgagePortfolio,
  mortgage: MortgageEntry
): Result<MortgagePortfolio, PortfolioValidationError> {
  // Check for duplicate IDs
  if (portfolio.mortgages.some((m) => m.id === mortgage.id)) {
    return { success: false, error: "DuplicateMortgageId" };
  }

  return {
    success: true,
    data: {
      ...portfolio,
      mortgages: [...portfolio.mortgages, mortgage],
      updatedAt: new Date(),
    },
  };
}

/**
 * Remove mortgage from portfolio
 */
export function removeMortgageFromPortfolio(
  portfolio: MortgagePortfolio,
  mortgageId: string
): Result<MortgagePortfolio, PortfolioValidationError> {
  const updatedMortgages = portfolio.mortgages.filter(
    (m) => m.id !== mortgageId
  );

  return {
    success: true,
    data: {
      ...portfolio,
      mortgages: updatedMortgages,
      updatedAt: new Date(),
    },
  };
}

/**
 * Update mortgage in portfolio
 */
export function updateMortgageInPortfolio(
  portfolio: MortgagePortfolio,
  mortgageId: string,
  updates: Partial<Omit<MortgageEntry, "id">>
): Result<MortgagePortfolio, PortfolioValidationError> {
  const mortgageIndex = portfolio.mortgages.findIndex(
    (m) => m.id === mortgageId
  );

  if (mortgageIndex === -1) {
    return { success: false, error: "InvalidMortgageEntry" };
  }

  const updatedMortgages = [...portfolio.mortgages];
  updatedMortgages[mortgageIndex] = {
    ...updatedMortgages[mortgageIndex],
    ...updates,
  };

  return {
    success: true,
    data: {
      ...portfolio,
      mortgages: updatedMortgages,
      updatedAt: new Date(),
    },
  };
}
