/**
 * PortfolioApplicationService - Application Layer
 *
 * Orchestrates portfolio operations between UI and domain
 * Handles Swiss and German market specific requirements
 */

import { Result } from "../../domain/types/Brand";
import type {
  MortgagePortfolio,
  PortfolioId,
  MortgageEntry,
  PortfolioSummary,
  PortfolioValidationError,
} from "../../domain/entities/MortgagePortfolio";
import {
  createMortgagePortfolio,
  addMortgageToPortfolio,
  removeMortgageFromPortfolio,
  updateMortgageInPortfolio,
} from "../../domain/entities/MortgagePortfolio";
import {
  calculatePortfolioSummary,
  analyzePortfolioOptimization,
  calculatePortfolioCashFlow,
} from "../../domain/services/PortfolioService";
import type {
  IPortfolioRepository,
  RepositoryError,
} from "../../infrastructure/persistence/PortfolioRepository";
import { portfolioRepository } from "../../infrastructure/persistence/PortfolioRepository";
import { createLoanConfigurationFromInput } from "../../domain/types/LoanConfiguration";
import type { LoanScenarioInput } from "./MortgageService";

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
export class PortfolioApplicationService {
  constructor(private repository: IPortfolioRepository = portfolioRepository) {}

  /**
   * Create a new mortgage portfolio
   */
  async createPortfolio(
    input: CreatePortfolioInput
  ): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
    // Generate unique ID
    const portfolioId = this.generatePortfolioId();

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
    const saveResult = await this.repository.save(portfolioResult.data);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return portfolioResult;
  }

  /**
   * Get portfolio with summary
   */
  async getPortfolioWithSummary(
    portfolioId: PortfolioId
  ): Promise<Result<PortfolioWithSummary, PortfolioApplicationError>> {
    const portfolioResult = await this.repository.findById(portfolioId);
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
          refinancingOpportunities:
            optimization.refinancingOpportunities.length,
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
  async addMortgage(
    portfolioId: PortfolioId,
    input: AddMortgageInput
  ): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
    // Get existing portfolio
    const portfolioResult = await this.repository.findById(portfolioId);
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
      id: this.generateMortgageId(),
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
    const saveResult = await this.repository.save(updatedPortfolioResult.data);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return updatedPortfolioResult;
  }

  /**
   * Remove mortgage from portfolio
   */
  async removeMortgage(
    portfolioId: PortfolioId,
    mortgageId: string
  ): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
    const portfolioResult = await this.repository.findById(portfolioId);
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

    const saveResult = await this.repository.save(updatedPortfolioResult.data);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return updatedPortfolioResult;
  }

  /**
   * Get all portfolios
   */
  async getAllPortfolios(): Promise<
    Result<MortgagePortfolio[], PortfolioApplicationError>
  > {
    return await this.repository.findAll();
  }

  /**
   * Get portfolio cash flow projection
   */
  async getPortfolioCashFlow(
    portfolioId: PortfolioId,
    months: number = 360 // 30 years default
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
    const portfolioResult = await this.repository.findById(portfolioId);
    if (!portfolioResult.success) {
      return { success: false, error: portfolioResult.error };
    }

    const cashFlow = calculatePortfolioCashFlow(portfolioResult.data, months);

    return { success: true, data: cashFlow };
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(
    portfolioId: PortfolioId
  ): Promise<Result<void, PortfolioApplicationError>> {
    const deleteResult = await this.repository.delete(portfolioId);
    return deleteResult;
  }

  private generatePortfolioId(): PortfolioId {
    return `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMortgageId(): string {
    return `mortgage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Default service instance
 */
export const portfolioApplicationService = new PortfolioApplicationService();
