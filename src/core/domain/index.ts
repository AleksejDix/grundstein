/**
 * Domain Layer - Public API
 *
 * Clean export structure following functional programming and DDD principles
 */

// Primitives (Brand utility and string literal types)
export * from "./primitives/Brand";
export * from "./primitives/GermanSondertilgungRules";

// Value Objects (Branded types with business validation)
export * from "./value-objects/Money";
export * from "./value-objects/Percentage";
export * from "./value-objects/LoanAmount";
export * from "./value-objects/InterestRate";
export * from "./value-objects/MonthCount";
export * from "./value-objects/YearCount";
export * from "./value-objects/PaymentMonth";
export * from "./value-objects/PositiveInteger";
export * from "./value-objects/PositiveDecimal";
export * from "./value-objects/LoanToValueRatio";

// Aggregates (Complex business entities)
export * from "./types/LoanConfiguration";
export * from "./types/MonthlyPayment";
export * from "./types/ExtraPayment";
export * from "./types/ExtraPaymentRules";
export * from "./types/SondertilgungPlan";
export * from "./types/FixedRatePeriod";
export * from "./types/PropertyValuation";
export * from "./types/PaymentHistory";

// Entities
export * from "./entities/MortgagePortfolio";

// Domain Services
export * from "./services/PortfolioService";

// Calculations
export * from "./calculations/LoanCalculations";
export * from "./calculations/SondertilgungCalculations";
export * from "./calculations/AmortizationEngine";
