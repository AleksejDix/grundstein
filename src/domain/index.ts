/**
 * Domain Layer - Public API
 *
 * Export all domain types, entities, and services for use by application layer
 */

// Value Objects
export * from "./types/Brand";
export * from "./types/Money";
export * from "./types/Percentage";
export * from "./types/LoanAmount";
export * from "./types/InterestRate";
export * from "./types/MonthCount";
export * from "./types/YearCount";
export * from "./types/PaymentMonth";
export * from "./types/PositiveInteger";
export * from "./types/PositiveDecimal";

// Domain Types
export * from "./types/LoanConfiguration";
export * from "./types/MonthlyPayment";
export * from "./types/ExtraPayment";
export * from "./types/SondertilgungPlan";
export * from "./types/FixedRatePeriod";
export * from "./types/PropertyValuation";
export * from "./types/LoanToValueRatio";
export * from "./types/PaymentHistory";
export * from "./types/GermanSondertilgungRules";

// Entities
export * from "./entities/MortgagePortfolio";

// Domain Services
export * from "./services/PortfolioService";

// Calculations
export * from "./calculations/LoanCalculations";
export * from "./calculations/SondertilgungCalculations";
export * from "./calculations/AmortizationEngine";
