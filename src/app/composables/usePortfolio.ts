/**
 * PortfolioApplicationService - Application Layer
 *
 * Orchestrates portfolio operations between UI and domain
 * Handles Swiss and German market specific requirements
 */

import {
  Result,
  type MortgagePortfolio,
  type PortfolioId,
  type MortgageEntry,
  type PortfolioSummary,
  type PortfolioValidationError,
  createMortgagePortfolio,
  addMortgageToPortfolio,
  removeMortgageFromPortfolio,
  calculatePortfolioSummary,
  analyzePortfolioOptimization,
  calculatePortfolioCashFlow,
  createLoanConfigurationFromInput,
} from "../../core/domain";

// Re-export types for convenient imports
export type { MortgagePortfolio, PortfolioId, MortgageEntry, PortfolioSummary };

import type {
  PortfolioRepository,
  RepositoryError,
} from "../../core/infrastructure/persistence/PortfolioRepository";
import { portfolioRepository } from "../../core/infrastructure/persistence/PortfolioRepository";
import type { LoanScenarioInput } from "../services/application/services/MortgageService";

export type PortfolioApplicationError =
  | PortfolioValidationError
  | RepositoryError
  | "InvalidInput"
  | "PortfolioNotFound";

/**
 * Input for creating a new portfolio
 */
export type CreatePortfolioInput = {
  name: string;
  owner: string;
};

/**
 * Input for adding mortgage to portfolio
 */
export type AddMortgageInput = {
  name: string;
  market: "DE" | "CH";
  bank: string;
  startDate: string; // ISO date string
  notes?: string;
  loanData: LoanScenarioInput;
};

/**
 * Portfolio with UI-friendly summary data
 */
export type PortfolioWithSummary = {
  portfolio: MortgagePortfolio;
  summary: PortfolioSummary;
  optimization: {
    refinancingOpportunities: number;
    consolidationOpportunities: number;
    highRiskMortgages: number;
  };
};

/**
 * Portfolio Application Service
 */
// Helper functions for ID generation
const generatePortfolioId = (): PortfolioId =>
  `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateMortgageId = (): string =>
  `mortgage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Portfolio Application Functions
 */

/**
 * Create a new mortgage portfolio
 */
export async function createPortfolio(
  input: CreatePortfolioInput,
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
  // Generate unique ID
  const portfolioId = generatePortfolioId();

  // Create domain entity
  const portfolioResult = createMortgagePortfolio(
    portfolioId,
    input.name,
    input.owner
  );

  if (!portfolioResult.success) {
    return portfolioResult;
  }

  // Persist
  const saveResult = await repository.save(portfolioResult.data);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  return portfolioResult;
}

/**
 * Get portfolio with summary
 */
export async function getPortfolioWithSummary(
  portfolioId: PortfolioId,
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<PortfolioWithSummary, PortfolioApplicationError>> {
  const portfolioResult = await repository.findById(portfolioId);
  if (!portfolioResult.success) {
    return { success: false, error: portfolioResult.error };
  }

  const summaryResult = calculatePortfolioSummary(portfolioResult.data);
  if (!summaryResult.success) {
    return { success: false, error: summaryResult.error };
  }

  const optimization = analyzePortfolioOptimization(portfolioResult.data);

  return {
    success: true,
    data: {
      portfolio: portfolioResult.data,
      summary: summaryResult.data,
      optimization: {
        refinancingOpportunities: optimization.refinancingOpportunities.length,
        consolidationOpportunities:
          optimization.consolidationOpportunities.length,
        highRiskMortgages:
          optimization.riskAnalysis.highInterestMortgages.length,
      },
    },
  };
}

/**
 * Add mortgage to portfolio
 */
export async function addMortgageToPortfolioById(
  portfolioId: PortfolioId,
  input: AddMortgageInput,
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
  // Get existing portfolio
  const portfolioResult = await repository.findById(portfolioId);
  if (!portfolioResult.success) {
    return { success: false, error: portfolioResult.error };
  }

  // Create loan configuration from input
  const loanConfigResult = createLoanConfigurationFromInput(input.loanData);
  if (!loanConfigResult.success) {
    return { success: false, error: "InvalidInput" };
  }

  // Create mortgage entry
  const mortgageEntry: MortgageEntry = {
    id: generateMortgageId(),
    name: input.name,
    configuration: loanConfigResult.data,
    market: input.market,
    bank: input.bank,
    startDate: new Date(input.startDate),
    notes: input.notes,
    isActive: true,
  };

  // Add to portfolio
  const updatedPortfolioResult = addMortgageToPortfolio(
    portfolioResult.data,
    mortgageEntry
  );

  if (!updatedPortfolioResult.success) {
    return updatedPortfolioResult;
  }

  // Persist
  const saveResult = await repository.save(updatedPortfolioResult.data);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  return updatedPortfolioResult;
}

/**
 * Remove mortgage from portfolio
 */
export async function removeMortgageFromPortfolioById(
  portfolioId: PortfolioId,
  mortgageId: string,
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
  const portfolioResult = await repository.findById(portfolioId);
  if (!portfolioResult.success) {
    return { success: false, error: portfolioResult.error };
  }

  const updatedPortfolioResult = removeMortgageFromPortfolio(
    portfolioResult.data,
    mortgageId
  );

  if (!updatedPortfolioResult.success) {
    return updatedPortfolioResult;
  }

  const saveResult = await repository.save(updatedPortfolioResult.data);
  if (!saveResult.success) {
    return { success: false, error: saveResult.error };
  }

  return updatedPortfolioResult;
}

/**
 * Get all portfolios
 */
export async function getAllPortfolios(
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<MortgagePortfolio[], PortfolioApplicationError>> {
  return await repository.findAll();
}

/**
 * Get portfolio cash flow projection
 */
export async function getPortfolioCashFlow(
  portfolioId: PortfolioId,
  months: number = 360, // 30 years default
  repository: PortfolioRepository = portfolioRepository
): Promise<
  Result<
    {
      monthlyPayments: number[];
      cumulativeInterest: number[];
      remainingBalance: number[];
    },
    PortfolioApplicationError
  >
> {
  const portfolioResult = await repository.findById(portfolioId);
  if (!portfolioResult.success) {
    return { success: false, error: portfolioResult.error };
  }

  const cashFlow = calculatePortfolioCashFlow(portfolioResult.data, months);

  return { success: true, data: cashFlow };
}

/**
 * Delete portfolio
 */
export async function deletePortfolio(
  portfolioId: PortfolioId,
  repository: PortfolioRepository = portfolioRepository
): Promise<Result<void, PortfolioApplicationError>> {
  return await repository.delete(portfolioId);
}

/**
 * Additional helper functions for Vue components
 */
export async function getPortfolio(portfolioId: PortfolioId): Promise<Result<PortfolioWithSummary, PortfolioApplicationError>> {
  return getPortfolioWithSummary(portfolioId);
}

export async function updatePortfolio(portfolioId: PortfolioId, updates: Partial<CreatePortfolioInput>): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
  // For now, this is a placeholder - would need to implement update logic
  return { success: false, error: "InvalidInput" };
}

export async function removeMortgage(portfolioId: PortfolioId, mortgageId: string): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
  return removeMortgageFromPortfolioById(portfolioId, mortgageId);
}

/**
 * Functional service object for convenient imports
 */
export const portfolioApplicationService = {
  createPortfolio,
  getPortfolioWithSummary,
  getPortfolio,
  addMortgageToPortfolio: addMortgageToPortfolioById,
  removeMortgageFromPortfolio: removeMortgageFromPortfolioById,
  removeMortgage,
  getAllPortfolios,
  getPortfolioCashFlow,
  deletePortfolio,
  updatePortfolio,
} as const;
