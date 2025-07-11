/**
 * PortfolioRepository - Infrastructure Layer
 *
 * Handles persistence for mortgage portfolios
 * Supports localStorage for now, can be extended to database
 */

import type {
  MortgagePortfolio,
  PortfolioId,
} from "../../domain/entities/MortgagePortfolio";
import { Result } from "../../domain/types/Brand";

export type RepositoryError =
  | "NotFound"
  | "SerializationError"
  | "StorageError"
  | "InvalidData";

/**
 * Portfolio Repository Type
 */
export type PortfolioRepository = {
  save(portfolio: MortgagePortfolio): Promise<Result<void, RepositoryError>>;
  findById(
    id: PortfolioId
  ): Promise<Result<MortgagePortfolio, RepositoryError>>;
  findAll(): Promise<Result<MortgagePortfolio[], RepositoryError>>;
  delete(id: PortfolioId): Promise<Result<void, RepositoryError>>;
};

/**
 * Create in-memory portfolio repository
 */
export const createInMemoryPortfolioRepository = (): PortfolioRepository => {
  let portfolios: MortgagePortfolio[] = [];

  return {
    async save(
      portfolio: MortgagePortfolio
    ): Promise<Result<void, RepositoryError>> {
      try {
        portfolios = portfolios
          .filter((p) => p.id !== portfolio.id)
          .concat(portfolio);
        return { success: true, data: undefined };
      } catch {
        return { success: false, error: "StorageError" };
      }
    },

    async findById(
      id: PortfolioId
    ): Promise<Result<MortgagePortfolio, RepositoryError>> {
      try {
        const portfolio = portfolios.find((p) => p.id === id);
        return portfolio
          ? { success: true, data: portfolio }
          : { success: false, error: "NotFound" };
      } catch {
        return { success: false, error: "StorageError" };
      }
    },

    async findAll(): Promise<Result<MortgagePortfolio[], RepositoryError>> {
      try {
        return { success: true, data: [...portfolios] };
      } catch {
        return { success: false, error: "StorageError" };
      }
    },

    async delete(id: PortfolioId): Promise<Result<void, RepositoryError>> {
      try {
        portfolios = portfolios.filter((p) => p.id !== id);
        return { success: true, data: undefined };
      } catch {
        return { success: false, error: "StorageError" };
      }
    },
  };
};

/**
 * Default repository instance
 */
export const portfolioRepository = createInMemoryPortfolioRepository();
