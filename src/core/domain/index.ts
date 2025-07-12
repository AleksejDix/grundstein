/**
 * Domain Layer - Public API
 *
 * Clean export structure following functional programming and DDD principles
 */

// Primitives (Brand utility and string literal types)
export * from "./primitives/Brand";

// GermanSondertilgungRules exports
export {
  type GermanSondertilgungRules,
  type GermanSondertilgungValidationError,
  type SondertilgungPercentage,
  createGermanSondertilgungRules,
  getAvailablePercentages,
  validateSondertilgungPayment,
  calculateSondertilgungFees,
  supportsUnlimitedSondertilgung,
  getRecommendedStrategy,
} from "./primitives/GermanSondertilgungRules";

// Value Objects (Branded types with business validation)
export * from "./value-objects/Money";

// Percentage exports
export {
  type Percentage,
  type PercentageValidationError,
  createPercentage,
  fromDecimal as percentageFromDecimal,
  toDecimal as percentageToDecimal,
  addPercentage,
  subtractPercentage,
  multiplyPercentage,
  formatPercentage,
  comparePercentage,
  isEqualPercentage,
  ZERO_PERCENT,
  FIFTY_PERCENT,
  HUNDRED_PERCENT,
} from "./value-objects/Percentage";

// LoanAmount exports
export {
  type LoanAmount,
  type LoanAmountValidationError,
  createLoanAmount,
  toMoney as loanAmountToMoney,
  toNumber as loanAmountToNumber,
  formatLoanAmount,
} from "./value-objects/LoanAmount";

// InterestRate exports
export {
  type InterestRate,
  type InterestRateValidationError,
  createInterestRate,
  toPercentage as interestRateToPercentage,
  toNumber as interestRateToNumber,
  formatInterestRate,
  isValidInterestRateRange,
  compareInterestRate,
  toMonthlyRate,
  fromMonthlyRate,
  addBasisPoints,
} from "./value-objects/InterestRate";

// MonthCount exports
export {
  type MonthCount,
  type MonthCountValidationError,
  createMonthCount,
  toPositiveInteger as monthCountToPositiveInteger,
  toNumber as monthCountToNumber,
  addMonths,
  subtractMonths,
  formatMonthCount,
  toYears,
  fromYears,
  isEqualMonthCount,
} from "./value-objects/MonthCount";

// YearCount exports
export {
  type YearCount,
  type YearCountValidationError,
  createYearCount,
  toPositiveInteger as yearCountToPositiveInteger,
  toNumber as yearCountToNumber,
  toMonths as yearCountToMonths,
  formatYearCount,
  isEqualYearCount,
} from "./value-objects/YearCount";

// PaymentMonth exports
export {
  type PaymentMonth,
  type PaymentMonthValidationError,
  createPaymentMonth,
  toPositiveInteger as paymentMonthToPositiveInteger,
  toNumber as paymentMonthToNumber,
  addMonths as paymentMonthAddMonths,
  formatPaymentMonth,
  isValidPaymentMonthRange,
  comparePaymentMonth,
} from "./value-objects/PaymentMonth";

// PositiveInteger exports (avoiding toNumber conflict)
export {
  type PositiveInteger,
  type PositiveIntegerValidationError,
  createPositiveInteger,
  toNumber as positiveIntegerToNumber,
  formatPositiveInteger,
  addPositiveInteger,
  subtractPositiveInteger,
  multiplyPositiveInteger,
  comparePositiveInteger,
  isEqualPositiveInteger,
} from "./value-objects/PositiveInteger";

// PositiveDecimal exports
export {
  type PositiveDecimal,
  type PositiveDecimalValidationError,
  createPositiveDecimal,
  toNumber as positiveDecimalToNumber,
  formatPositiveDecimal,
  addPositiveDecimal,
  subtractPositiveDecimal,
  multiplyPositiveDecimal,
  comparePositiveDecimal,
  isEqualPositiveDecimal,
} from "./value-objects/PositiveDecimal";
export * from "./value-objects/LoanToValueRatio";

// Aggregates (Complex business entities)
export * from "./types/LoanConfiguration";
export * from "./types/MonthlyPayment";
export * from "./types/ExtraPayment";
// Remove ExtraPaymentRules - using SondertilgungPlan directly

// SondertilgungPlan exports
export {
  type SondertilgungPlan,
  type SondertilgungValidationError,
  type SondertilgungLimit,
  type YearlyPaymentSummary,
  createSondertilgungPlan,
  createPercentageLimit,
  createUnlimitedLimit,
  getYearlyPaymentSummaries,
  canAddPayment,
  getRemainingYearlyLimit,
  addPaymentToPlan,
  removePaymentFromPlan,
  getTotalExtraPayments,
  formatSondertilgungLimit,
  formatSondertilgungPlan,
} from "./types/SondertilgungPlan";
// FixedRatePeriod exports
export {
  type FixedRatePeriod,
  type FixedRatePeriodValidationError,
  type FixedRateType,
  createFixedRatePeriod,
  createStandardGermanPeriod,
  getPeriodYears,
  getInitialRate,
  getRateType,
  getStartDate,
  getEndDate,
  isCurrentlyActive,
  getRemainingYears,
  isTypicalPeriod,
  formatFixedRatePeriod,
  getDaysUntilExpiry,
  isExpiringSoon,
  compareByEndDate,
  getTypicalPeriods,
  isValidPeriodLength,
  getMinimumPeriodYears,
  getMaximumPeriodYears,
} from "./types/FixedRatePeriod";
export * from "./types/PropertyValuation";
export * from "./types/PaymentHistory";

// Entities (removed portfolio-related)

// Calculations
export * from "./calculations/LoanCalculations";
export * from "./calculations/SondertilgungCalculations";
export * from "./calculations/AmortizationEngine";
