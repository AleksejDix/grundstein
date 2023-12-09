import type { Mortgage } from "../types";

export const annuityFactor = (mortgage: Mortgage) => {
  const c = (1 + mortgage.annualInterestRate) ** mortgage.termInYears;
  const annuityFactor = (c * mortgage.annualInterestRate) / (c - 1);
  return annuityFactor;
};
