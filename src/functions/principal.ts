import { getInterest } from "./interest";

// Tilgungszahlung = Annuität – Zinszahlung

export const getPrincipal = ({ k = 0, z = 0, r = 0 }) =>
  r - getInterest({ k, z });

export const calculateYearlyPayment = ({ k = 0, z = 0, n = 1 }) => {
  const c = (1 + z) ** n;
  const f = (c * z) / (c - 1);
  return k * f;
};

export const calculateMonthlyPayment = ({ k = 0, z = 0, n = 1 }) => {
  return calculateYearlyPayment({ k, z, n }) / 12;
};
