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
  getAvailablePercentages as germanSondertilgungGetAvailablePercentages,
  validatePercentage,
  formatRules,
  getDefaultRules,
  isStandardPercentage
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
  HUNDRED_PERCENT
} from "./value-objects/Percentage";

// LoanAmount exports
export {
  type LoanAmount,
  type LoanAmountValidationError,
  createLoanAmount,
  toMoney as loanAmountToMoney,
  toNumber as loanAmountToNumber,
  formatLoanAmount,
  compareLoanAmounts,
  isValidLoanAmount,
  addLoanAmounts,
  subtractLoanAmounts
} from "./value-objects/LoanAmount";

// InterestRate exports
export {
  type InterestRate,
  type InterestRateValidationError,
  createInterestRate,
  toPercentage as interestRateToPercentage,
  toNumber as interestRateToNumber,
  formatInterestRate,
  isValidInterestRate,
  compareInterestRates,
  getMonthlyRate,
  getQuarterlyRate,
  getAnnualRate
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
  isValidMonthCount
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
  isValidYearCount
} from "./value-objects/YearCount";

// PaymentMonth exports
export {
  type PaymentMonth,
  type PaymentMonthValidationError,
  createPaymentMonth,
  toPositiveInteger as paymentMonthToPositiveInteger,
  toNumber as paymentMonthToNumber,
  addMonths as paymentMonthAddMonths,
  subtractMonths as paymentMonthSubtractMonths,
  formatPaymentMonth,
  toDate,
  fromDate,
  isValidPaymentMonth,
  comparePaymentMonths,
  isInRange
} from "./value-objects/PaymentMonth";

export * from "./value-objects/PositiveInteger";
export * from "./value-objects/PositiveDecimal";
export * from "./value-objects/LoanToValueRatio";

// Aggregates (Complex business entities)
export * from "./types/LoanConfiguration";
export * from "./types/MonthlyPayment";
export * from "./types/ExtraPayment";
// ExtraPaymentRules exports (avoiding conflicts with SondertilgungPlan)
export {
  type ExtraPaymentLimit,
  type SondertilgungLimit,
  type ExtraPaymentRules,
  type ExtraPaymentPercentage,
  type ExtraPaymentValidationError,
  createPercentageLimit as createExtraPaymentPercentageLimit,
  createUnlimitedLimit as createExtraPaymentUnlimitedLimit,
  createFixedAmountLimit,
  createExtraPaymentRules,
  validateExtraPayment,
  isUnlimited,
  getMaxAmount,
  formatLimit
} from "./types/ExtraPaymentRules";

// SondertilgungPlan exports
export {
  type SondertilgungPlan,
  type SondertilgungValidationError,
  type ExtraPaymentSchedule,
  createSondertilgungPlan,
  createPercentageLimit,
  createUnlimitedLimit,
  addExtraPayment,
  removeExtraPayment,
  getExtraPaymentsForYear,
  getTotalExtraPayments,
  validateAgainstLimit,
  formatSondertilgungPlan
} from "./types/SondertilgungPlan";
// FixedRatePeriod exports
export {
  type FixedRatePeriod,
  type FixedRatePeriodValidationError,
  type FixedRatePeriodYear,
  createFixedRatePeriod,
  getStartDate as fixedRatePeriodGetStartDate,
  getEndDate,
  isActive,
  getRemainingMonths,
  formatFixedRatePeriod,
  compareFixedRatePeriods,
  extendFixedRatePeriod
} from "./types/FixedRatePeriod";
export * from "./types/PropertyValuation";
export * from "./types/PaymentHistory";

// Entities (removed portfolio-related)

// Calculations
export * from "./calculations/LoanCalculations";
export * from "./calculations/SondertilgungCalculations";
export * from "./calculations/AmortizationEngine";
