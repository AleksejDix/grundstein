/**
 * LoanToValueRatio (LTV) domain type
 *
 * Critical metric for German mortgage underwriting and risk assessment:
 * - Determines loan approval and interest rates
 * - Affects mortgage insurance requirements
 * - Key factor in refinancing decisions
 * - Regulatory compliance (German banking regulations)
 *
 * German market specifics:
 * - Standard maximum LTV: 80% for residential properties
 * - Premium locations may allow up to 90%
 * - Investment properties typically max 70%
 * - LTV affects interest rate pricing significantly
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { Percentage } from "./Percentage";
import {
  createPercentage,
  toPercentageValue,
  formatPercentage,
} from "./Percentage";
import { toEuros } from "./Money";
import type { LoanAmount } from "./LoanAmount";
import { toNumber as loanAmountToNumber } from "./LoanAmount";
import type {
  PropertyValuation,
} from "../types/PropertyValuation";
import {
  getCurrentValue,
  getPropertyType,
  getPropertyLocation,
  isAcceptableForMortgage,
} from "../types/PropertyValuation";

// Branded LoanToValueRatio type
export type LoanToValueRatio = Branded<
  {
    readonly currentLTV: Percentage;
    readonly originalLTV: Percentage;
    readonly loanAmount: LoanAmount;
    readonly propertyValuation: PropertyValuation;
    readonly riskCategory: LTVRiskCategory;
    readonly calculationDate: Date;
  },
  "LoanToValueRatio"
>;

// Risk categories based on LTV ranges
export type LTVRiskCategory =
  | "VeryLow" // 0-60%
  | "Low" // 60-70%
  | "Medium" // 70-80%
  | "High" // 80-90%
  | "VeryHigh"; // 90%+

export type LoanToValueValidationError =
  | "InvalidLoanAmount"
  | "InvalidPropertyValuation"
  | "PropertyValuationNotAcceptable"
  | "LTVTooHigh"
  | "InvalidCalculationDate"
  | "PropertyValueTooLow";

// Business constants for German mortgage market
const MAX_STANDARD_LTV = 80; // 80% standard maximum
const MAX_PREMIUM_LOCATION_LTV = 90; // 90% for premium locations
const MAX_INVESTMENT_PROPERTY_LTV = 70; // 70% for investment properties
const MIN_PROPERTY_VALUE_FOR_MORTGAGE = 50000; // €50,000 minimum

/**
 * Smart constructor for LoanToValueRatio type
 */
export function createLoanToValueRatio(
  loanAmount: LoanAmount,
  propertyValuation: PropertyValuation,
  originalLoanAmount?: LoanAmount,
  calculationDate: Date = new Date()
): Result<LoanToValueRatio, LoanToValueValidationError> {
  // Validate property valuation is acceptable for mortgage
  if (!isAcceptableForMortgage(propertyValuation)) {
    return { success: false, error: "PropertyValuationNotAcceptable" };
  }

  // Validate minimum property value
  const propertyValue = toEuros(getCurrentValue(propertyValuation));
  if (propertyValue < MIN_PROPERTY_VALUE_FOR_MORTGAGE) {
    return { success: false, error: "PropertyValueTooLow" };
  }

  // Calculate current LTV
  const currentLoanValue = loanAmountToNumber(loanAmount);
  const currentLTVPercent = (currentLoanValue / propertyValue) * 100;

  // Calculate original LTV (use current if not provided)
  const originalLoanValue = originalLoanAmount
    ? loanAmountToNumber(originalLoanAmount)
    : currentLoanValue;
  const originalLTVPercent = (originalLoanValue / propertyValue) * 100;

  // Validate LTV is not unreasonably high
  const maxAllowedLTV = getMaxAllowedLTV(propertyValuation);
  if (currentLTVPercent > maxAllowedLTV + 10) {
    // Allow 10% buffer for validation
    return { success: false, error: "LTVTooHigh" };
  }

  // Create percentage objects
  const currentLTVResult = createPercentage(currentLTVPercent);
  const originalLTVResult = createPercentage(originalLTVPercent);

  if (!currentLTVResult.success || !originalLTVResult.success) {
    return { success: false, error: "InvalidLoanAmount" };
  }

  // Determine risk category
  const riskCategory = determineRiskCategory(currentLTVPercent);

  return {
    success: true,
    data: {
      currentLTV: currentLTVResult.data,
      originalLTV: originalLTVResult.data,
      loanAmount,
      propertyValuation,
      riskCategory,
      calculationDate: new Date(calculationDate),
    } as LoanToValueRatio,
  };
}

/**
 * Get current LTV percentage
 */
export function getCurrentLTV(ltv: LoanToValueRatio): number {
  return toPercentageValue((ltv as any).currentLTV);
}

/**
 * Get original LTV percentage
 */
export function getOriginalLTV(ltv: LoanToValueRatio): number {
  return toPercentageValue((ltv as any).originalLTV);
}

/**
 * Get loan amount
 */
export function getLoanAmount(ltv: LoanToValueRatio): LoanAmount {
  return (ltv as any).loanAmount;
}

/**
 * Get property valuation
 */
export function getPropertyValuation(ltv: LoanToValueRatio): PropertyValuation {
  return (ltv as any).propertyValuation;
}

/**
 * Get risk category
 */
export function getRiskCategory(ltv: LoanToValueRatio): LTVRiskCategory {
  return (ltv as any).riskCategory;
}

/**
 * Get calculation date
 */
export function getCalculationDate(ltv: LoanToValueRatio): Date {
  return new Date((ltv as any).calculationDate);
}

/**
 * Calculate LTV improvement since original loan
 */
export function calculateLTVImprovement(ltv: LoanToValueRatio): number {
  const originalLTV = getOriginalLTV(ltv);
  const currentLTV = getCurrentLTV(ltv);

  return originalLTV - currentLTV; // Positive means improvement
}

/**
 * Check if LTV has improved since original loan
 */
export function hasLTVImproved(ltv: LoanToValueRatio): boolean {
  return calculateLTVImprovement(ltv) > 0;
}

/**
 * Determine risk category based on LTV percentage
 */
function determineRiskCategory(ltvPercent: number): LTVRiskCategory {
  if (ltvPercent <= 60) return "VeryLow";
  if (ltvPercent <= 70) return "Low";
  if (ltvPercent <= 80) return "Medium";
  if (ltvPercent <= 90) return "High";
  return "VeryHigh";
}

/**
 * Get maximum allowed LTV for property type and location
 */
function getMaxAllowedLTV(propertyValuation: PropertyValuation): number {
  const propertyType = getPropertyType(propertyValuation);
  const location = getPropertyLocation(propertyValuation);

  // Investment properties have lower LTV limits
  if (
    propertyType === "Gewerbeimmobilie" ||
    propertyType === "Mehrfamilienhaus"
  ) {
    return MAX_INVESTMENT_PROPERTY_LTV;
  }

  // Premium locations may get higher LTV
  if (location.locationQuality === "Premium") {
    return MAX_PREMIUM_LOCATION_LTV;
  }

  return MAX_STANDARD_LTV;
}

/**
 * Check if LTV is acceptable for mortgage approval
 */
export function isLTVAcceptableForMortgage(ltv: LoanToValueRatio): boolean {
  const currentLTV = getCurrentLTV(ltv);
  const maxAllowed = getMaxAllowedLTV(getPropertyValuation(ltv));

  return currentLTV <= maxAllowed;
}

/**
 * Check if LTV qualifies for best interest rates
 */
export function qualifiesForBestRates(ltv: LoanToValueRatio): boolean {
  const currentLTV = getCurrentLTV(ltv);
  return currentLTV <= 60; // Very low risk category
}

/**
 * Calculate equity amount
 */
export function calculateEquity(ltv: LoanToValueRatio): number {
  const propertyValue = toEuros(getCurrentValue(getPropertyValuation(ltv)));
  const loanValue = loanAmountToNumber(getLoanAmount(ltv));

  return Math.max(0, propertyValue - loanValue);
}

/**
 * Calculate equity percentage
 */
export function calculateEquityPercentage(ltv: LoanToValueRatio): number {
  return 100 - getCurrentLTV(ltv);
}

/**
 * Get estimated interest rate premium based on LTV
 */
export function getInterestRatePremium(ltv: LoanToValueRatio): number {
  const currentLTV = getCurrentLTV(ltv);
  const riskCategory = getRiskCategory(ltv);

  switch (riskCategory) {
    case "VeryLow":
      return 0; // No premium for very low LTV
    case "Low":
      return 0.1; // 0.1% premium
    case "Medium":
      return 0.25; // 0.25% premium
    case "High":
      return 0.5; // 0.5% premium
    case "VeryHigh":
      return 1.0; // 1.0% premium
    default:
      return 0.5;
  }
}

/**
 * Check if mortgage insurance is required
 */
export function requiresMortgageInsurance(ltv: LoanToValueRatio): boolean {
  const currentLTV = getCurrentLTV(ltv);
  return currentLTV > 80; // Typically required above 80% LTV in Germany
}

/**
 * Calculate amount needed to reach target LTV
 */
export function calculateAmountToReachTargetLTV(
  ltv: LoanToValueRatio,
  targetLTV: number
): number {
  const propertyValue = toEuros(getCurrentValue(getPropertyValuation(ltv)));
  const currentLoanValue = loanAmountToNumber(getLoanAmount(ltv));
  const targetLoanValue = propertyValue * (targetLTV / 100);

  return Math.max(0, currentLoanValue - targetLoanValue);
}

/**
 * Format LTV for display
 */
export function formatLoanToValueRatio(ltv: LoanToValueRatio): string {
  const currentLTV = formatPercentage((ltv as any).currentLTV);
  const riskCategory = getRiskCategory(ltv);

  const riskLabel = {
    VeryLow: "Sehr niedrig",
    Low: "Niedrig",
    Medium: "Mittel",
    High: "Hoch",
    VeryHigh: "Sehr hoch",
  }[riskCategory];

  return `LTV: ${currentLTV} (Risiko: ${riskLabel})`;
}

/**
 * Get risk category description in German
 */
export function getRiskCategoryDescription(category: LTVRiskCategory): string {
  switch (category) {
    case "VeryLow":
      return "Sehr niedrig (≤60%) - Beste Konditionen";
    case "Low":
      return "Niedrig (60-70%) - Gute Konditionen";
    case "Medium":
      return "Mittel (70-80%) - Standard Konditionen";
    case "High":
      return "Hoch (80-90%) - Erhöhte Zinsen";
    case "VeryHigh":
      return "Sehr hoch (>90%) - Hohe Zinsen, schwierige Finanzierung";
    default:
      return "Unbekannt";
  }
}

/**
 * Compare two LTV ratios by current LTV
 */
export function compareByCurrentLTV(
  a: LoanToValueRatio,
  b: LoanToValueRatio
): number {
  return getCurrentLTV(a) - getCurrentLTV(b);
}

/**
 * Check if LTV is in safe range for refinancing
 */
export function isSafeForRefinancing(ltv: LoanToValueRatio): boolean {
  const currentLTV = getCurrentLTV(ltv);
  return currentLTV <= 75; // Conservative threshold for refinancing
}

/**
 * Calculate maximum additional borrowing capacity
 */
export function calculateMaxAdditionalBorrowing(
  ltv: LoanToValueRatio,
  targetLTV: number = 80
): number {
  const propertyValue = toEuros(getCurrentValue(getPropertyValuation(ltv)));
  const currentLoanValue = loanAmountToNumber(getLoanAmount(ltv));
  const maxLoanValue = propertyValue * (targetLTV / 100);

  return Math.max(0, maxLoanValue - currentLoanValue);
}

/**
 * Get standard LTV limits for German market
 */
export function getStandardLTVLimits(): {
  standard: number;
  premium: number;
  investment: number;
} {
  return {
    standard: MAX_STANDARD_LTV,
    premium: MAX_PREMIUM_LOCATION_LTV,
    investment: MAX_INVESTMENT_PROPERTY_LTV,
  };
}

/**
 * Validate if LTV calculation is current enough
 */
export function isCalculationCurrent(
  ltv: LoanToValueRatio,
  maxAgeMonths: number = 6
): boolean {
  const calculationDate = getCalculationDate(ltv);
  const now = new Date();
  const monthsOld =
    (now.getTime() - calculationDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000);

  return monthsOld <= maxAgeMonths;
}

/**
 * Update LTV with new loan amount (for refinancing scenarios)
 */
export function updateWithNewLoanAmount(
  ltv: LoanToValueRatio,
  newLoanAmount: LoanAmount
): Result<LoanToValueRatio, LoanToValueValidationError> {
  return createLoanToValueRatio(
    newLoanAmount,
    getPropertyValuation(ltv),
    getLoanAmount(ltv), // Use current as original
    new Date()
  );
}

/**
 * Update LTV with new property valuation
 */
export function updateWithNewPropertyValuation(
  ltv: LoanToValueRatio,
  newPropertyValuation: PropertyValuation
): Result<LoanToValueRatio, LoanToValueValidationError> {
  return createLoanToValueRatio(
    getLoanAmount(ltv),
    newPropertyValuation,
    getLoanAmount(ltv), // Keep same original loan amount
    new Date()
  );
}

/**
 * Get minimum property value for mortgage
 */
export function getMinimumPropertyValueForMortgage(): number {
  return MIN_PROPERTY_VALUE_FOR_MORTGAGE;
}
