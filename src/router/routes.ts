/**
 * Simple route helpers for the mortgage calculator
 */

export const routes = {
  overview: () => ({ name: "overview" }),
  create: () => ({ name: "create" }),
} as const;