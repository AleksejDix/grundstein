/**
 * Route Constants and Helper Functions
 *
 * Provides type-safe route navigation with single source of truth for route names.
 * Prevents typos and improves maintainability across the application.
 *
 * Usage:
 * - Simple routes: routes.dashboard.index()
 * - Routes with params: routes.portfolios.show('123')
 * - In templates: :to="routes.portfolios.index()"
 */

// Route Name Constants
export const ROUTE_NAMES = {
  DASHBOARD: {
    INDEX: "dashboard.index",
  },
  PORTFOLIOS: {
    INDEX: "portfolios.index",
    CREATE: "portfolios.create",
    SHOW: "portfolios.show",
    EDIT: "portfolios.edit",
    MORTGAGES: {
      INDEX: "portfolios.mortgages.index",
      CREATE: "portfolios.mortgages.create",
    },
  },
  MORTGAGES: {
    INDEX: "mortgages.index",
    CREATE: "mortgages.create",
    SHOW: "mortgages.show",
    EDIT: "mortgages.edit",
  },
  LEGACY: {
    CALCULATOR: "legacy.calculator",
    MORTGAGE_CALCULATOR: "legacy.mortgage-calculator",
  },
} as const;

// Type-safe Route Helper Functions
export const routes = {
  dashboard: {
    index: () => ({ name: ROUTE_NAMES.DASHBOARD.INDEX }),
  },
  portfolios: {
    index: () => ({ name: ROUTE_NAMES.PORTFOLIOS.INDEX }),
    create: () => ({ name: ROUTE_NAMES.PORTFOLIOS.CREATE }),
    show: (id: string) => ({
      name: ROUTE_NAMES.PORTFOLIOS.SHOW,
      params: { id },
    }),
    edit: (id: string) => ({
      name: ROUTE_NAMES.PORTFOLIOS.EDIT,
      params: { id },
    }),
    mortgages: {
      index: (portfolioId: string) => ({
        name: ROUTE_NAMES.PORTFOLIOS.MORTGAGES.INDEX,
        params: { portfolioId },
      }),
      create: (portfolioId: string) => ({
        name: ROUTE_NAMES.PORTFOLIOS.MORTGAGES.CREATE,
        params: { portfolioId },
      }),
    },
  },
  mortgages: {
    index: () => ({ name: ROUTE_NAMES.MORTGAGES.INDEX }),
    create: () => ({ name: ROUTE_NAMES.MORTGAGES.CREATE }),
    show: (id: string) => ({
      name: ROUTE_NAMES.MORTGAGES.SHOW,
      params: { id },
    }),
    edit: (id: string) => ({
      name: ROUTE_NAMES.MORTGAGES.EDIT,
      params: { id },
    }),
  },
  legacy: {
    calculator: () => ({ name: ROUTE_NAMES.LEGACY.CALCULATOR }),
    mortgageCalculator: () => ({
      name: ROUTE_NAMES.LEGACY.MORTGAGE_CALCULATOR,
    }),
  },
} as const;

// Type definitions for route parameters
export type RouteParams = {
  id?: string;
  portfolioId?: string;
};

// Utility type for route objects
export type RouteObject = {
  name: string;
  params?: RouteParams;
};

/**
 * Examples of usage:
 *
 * // In components:
 * <RouterLink :to="routes.portfolios.index()">All Portfolios</RouterLink>
 * <RouterLink :to="routes.portfolios.show('123')">Portfolio Details</RouterLink>
 * <RouterLink :to="routes.mortgages.show('demo-berlin-apartment')">Demo Mortgage</RouterLink>
 * <RouterLink :to="routes.mortgages.show('456')">Specific Mortgage</RouterLink>
 *
 * // In JavaScript:
 * router.push(routes.portfolios.create())
 * router.push(routes.mortgages.show(mortgageId))
 * router.push(routes.mortgages.show('demo-berlin-apartment')) // Demo mortgage
 *
 * // Access route names directly:
 * const routeName = ROUTE_NAMES.PORTFOLIOS.INDEX
 */
