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
 * Portfolio Repository Interface
 */
export interface IPortfolioRepository {
  save(portfolio: MortgagePortfolio): Promise<Result<void, RepositoryError>>;
  findById(
    id: PortfolioId
  ): Promise<Result<MortgagePortfolio, RepositoryError>>;
  findAll(): Promise<Result<MortgagePortfolio[], RepositoryError>>;
  delete(id: PortfolioId): Promise<Result<void, RepositoryError>>;
}

/**
 * LocalStorage implementation of Portfolio Repository
 */
export class LocalStoragePortfolioRepository implements IPortfolioRepository {
  private readonly storageKey = "mortgage-portfolios";

  async save(
    portfolio: MortgagePortfolio
  ): Promise<Result<void, RepositoryError>> {
    try {
      const portfolios = await this.getAllPortfolios();

      // Update existing or add new
      const existingIndex = portfolios.findIndex((p) => p.id === portfolio.id);
      if (existingIndex >= 0) {
        portfolios[existingIndex] = portfolio;
      } else {
        portfolios.push(portfolio);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(portfolios));
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: "StorageError" };
    }
  }

  async findById(
    id: PortfolioId
  ): Promise<Result<MortgagePortfolio, RepositoryError>> {
    try {
      const portfolios = await this.getAllPortfolios();
      const portfolio = portfolios.find((p) => p.id === id);

      if (!portfolio) {
        return { success: false, error: "NotFound" };
      }

      return { success: true, data: portfolio };
    } catch (error) {
      return { success: false, error: "StorageError" };
    }
  }

  async findAll(): Promise<Result<MortgagePortfolio[], RepositoryError>> {
    try {
      const portfolios = await this.getAllPortfolios();
      return { success: true, data: portfolios };
    } catch (error) {
      return { success: false, error: "StorageError" };
    }
  }

  async delete(id: PortfolioId): Promise<Result<void, RepositoryError>> {
    try {
      const portfolios = await this.getAllPortfolios();
      const filteredPortfolios = portfolios.filter((p) => p.id !== id);

      localStorage.setItem(this.storageKey, JSON.stringify(filteredPortfolios));
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: "StorageError" };
    }
  }

  private async getAllPortfolios(): Promise<MortgagePortfolio[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Validate and transform dates
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        mortgages: p.mortgages.map((m: any) => ({
          ...m,
          startDate: new Date(m.startDate),
        })),
      }));
    } catch (error) {
      throw new Error("Failed to parse portfolio data");
    }
  }
}

/**
 * Default repository instance
 */
export const portfolioRepository = new LocalStoragePortfolioRepository();
