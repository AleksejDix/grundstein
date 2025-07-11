/**
 * PropertyValuation domain type
 *
 * Essential for German mortgage calculations, particularly for:
 * - Loan-to-Value (LTV) ratio calculations
 * - Refinancing decisions
 * - Risk assessment
 * - Equity tracking
 *
 * German mortgage regulations and risk assessments heavily depend on property values
 */

import type { Branded } from "./Brand";
import { Result } from "./Brand";
import type { Money } from "./Money";
import { createMoney, toEuros, formatMoney, compareMoney } from "./Money";

// Branded PropertyValuation type
export type PropertyValuation = Branded<
  {
    readonly currentValue: Money;
    readonly originalPurchasePrice: Money;
    readonly valuationDate: Date;
    readonly valuationMethod: ValuationMethod;
    readonly propertyType: PropertyType;
    readonly location: PropertyLocation;
    readonly valuerCertification?: string;
    readonly notes?: string;
  },
  "PropertyValuation"
>;

// Valuation methods accepted in German market
export type ValuationMethod =
  | "BankAppraisal" // Bank-commissioned appraisal (most authoritative)
  | "IndependentAppraisal" // Independent certified appraiser
  | "OnlineEstimate" // Automated valuation model (less reliable)
  | "ComparativeMarketAnalysis" // Real estate agent CMA
  | "SelfAssessment" // Owner's estimate (least reliable)
  | "InsuranceValuation"; // Insurance company valuation

// Property types common in German market
export type PropertyType =
  | "Eigenheim" // Single family home
  | "Eigentumswohnung" // Condominium
  | "Reihenhaus" // Row house
  | "Doppelhaushälfte" // Semi-detached house
  | "Mehrfamilienhaus" // Multi-family house
  | "Baugrundstück" // Building plot
  | "Gewerbeimmobilie"; // Commercial property

// Location classification for German properties
export type PropertyLocation = {
  readonly city: string;
  readonly state: string; // German Bundesland
  readonly postalCode: string;
  readonly locationQuality: LocationQuality;
};

export type LocationQuality =
  | "Premium" // Top locations (Munich, Hamburg, etc.)
  | "Good" // Good urban locations
  | "Average" // Standard residential areas
  | "Below Average" // Less desirable areas
  | "Rural"; // Rural locations

export type PropertyValuationValidationError =
  | "InvalidCurrentValue"
  | "InvalidPurchasePrice"
  | "InvalidValuationDate"
  | "FutureValuationDate"
  | "ValuationTooOld"
  | "ValueDecreaseTooSevere"
  | "InvalidLocation"
  | "UnsupportedValuationMethod";

// Business constants
const MAX_VALUATION_AGE_MONTHS = 24; // 2 years max for mortgage purposes
const MAX_REASONABLE_VALUE_DECREASE_PERCENT = 50; // 50% max decrease considered reasonable
const MIN_PROPERTY_VALUE = 10000; // €10,000 minimum property value
const MAX_PROPERTY_VALUE = 50000000; // €50M maximum property value

/**
 * Smart constructor for PropertyValuation type
 */
export function createPropertyValuation(
  currentValue: number,
  originalPurchasePrice: number,
  valuationDate: Date,
  valuationMethod: ValuationMethod,
  propertyType: PropertyType,
  location: PropertyLocation,
  valuerCertification?: string,
  notes?: string
): Result<PropertyValuation, PropertyValuationValidationError> {
  // Validate current value
  if (currentValue < MIN_PROPERTY_VALUE || currentValue > MAX_PROPERTY_VALUE) {
    return { success: false, error: "InvalidCurrentValue" };
  }

  // Validate purchase price
  if (
    originalPurchasePrice < MIN_PROPERTY_VALUE ||
    originalPurchasePrice > MAX_PROPERTY_VALUE
  ) {
    return { success: false, error: "InvalidPurchasePrice" };
  }

  // Create Money objects
  const currentValueResult = createMoney(currentValue);
  const purchasePriceResult = createMoney(originalPurchasePrice);

  if (!currentValueResult.success || !purchasePriceResult.success) {
    return { success: false, error: "InvalidCurrentValue" };
  }

  // Validate valuation date
  const now = new Date();
  if (valuationDate > now) {
    return { success: false, error: "FutureValuationDate" };
  }

  // Check if valuation is too old for mortgage purposes
  const maxAge = new Date();
  maxAge.setMonth(maxAge.getMonth() - MAX_VALUATION_AGE_MONTHS);
  if (valuationDate < maxAge) {
    return { success: false, error: "ValuationTooOld" };
  }

  // Validate that value decrease is reasonable
  if (currentValue < originalPurchasePrice) {
    const decreasePercent =
      ((originalPurchasePrice - currentValue) / originalPurchasePrice) * 100;
    if (decreasePercent > MAX_REASONABLE_VALUE_DECREASE_PERCENT) {
      return { success: false, error: "ValueDecreaseTooSevere" };
    }
  }

  // Validate location
  if (
    !location.city.trim() ||
    !location.state.trim() ||
    !location.postalCode.trim()
  ) {
    return { success: false, error: "InvalidLocation" };
  }

  // Validate postal code format (German postal codes are 5 digits)
  if (!/^\d{5}$/.test(location.postalCode)) {
    return { success: false, error: "InvalidLocation" };
  }

  return {
    success: true,
    data: {
      currentValue: currentValueResult.data,
      originalPurchasePrice: purchasePriceResult.data,
      valuationDate: new Date(valuationDate),
      valuationMethod,
      propertyType,
      location: { ...location }, // Shallow copy for immutability
      valuerCertification,
      notes,
    } as PropertyValuation,
  };
}

/**
 * Get current property value
 */
export function getCurrentValue(valuation: PropertyValuation): Money {
  return (valuation as any).currentValue;
}

/**
 * Get original purchase price
 */
export function getOriginalPurchasePrice(valuation: PropertyValuation): Money {
  return (valuation as any).originalPurchasePrice;
}

/**
 * Get valuation date
 */
export function getValuationDate(valuation: PropertyValuation): Date {
  return new Date((valuation as any).valuationDate);
}

/**
 * Get valuation method
 */
export function getValuationMethod(
  valuation: PropertyValuation
): ValuationMethod {
  return (valuation as any).valuationMethod;
}

/**
 * Get property type
 */
export function getPropertyType(valuation: PropertyValuation): PropertyType {
  return (valuation as any).propertyType;
}

/**
 * Get property location
 */
export function getPropertyLocation(
  valuation: PropertyValuation
): PropertyLocation {
  return { ...(valuation as any).location }; // Return copy for immutability
}

/**
 * Calculate appreciation/depreciation amount since purchase
 * Returns the difference as a signed number in euros (can be negative for depreciation)
 */
export function calculateValueChange(valuation: PropertyValuation): number {
  const currentValue = toEuros(getCurrentValue(valuation));
  const purchasePrice = toEuros(getOriginalPurchasePrice(valuation));

  return currentValue - purchasePrice;
}

/**
 * Calculate appreciation/depreciation percentage since purchase
 */
export function calculateValueChangePercentage(
  valuation: PropertyValuation
): number {
  const currentValue = toEuros(getCurrentValue(valuation));
  const purchasePrice = toEuros(getOriginalPurchasePrice(valuation));

  if (purchasePrice === 0) return 0;

  return ((currentValue - purchasePrice) / purchasePrice) * 100;
}

/**
 * Check if property has appreciated in value
 */
export function hasAppreciated(valuation: PropertyValuation): boolean {
  const currentValue = getCurrentValue(valuation);
  const purchasePrice = getOriginalPurchasePrice(valuation);

  return compareMoney(currentValue, purchasePrice) > 0;
}

/**
 * Check if property has depreciated in value
 */
export function hasDepreciated(valuation: PropertyValuation): boolean {
  const currentValue = getCurrentValue(valuation);
  const purchasePrice = getOriginalPurchasePrice(valuation);

  return compareMoney(currentValue, purchasePrice) < 0;
}

/**
 * Calculate annual appreciation rate
 */
export function calculateAnnualAppreciationRate(
  valuation: PropertyValuation
): number {
  const valuationDate = getValuationDate(valuation);
  const now = new Date();
  const yearsElapsed =
    (now.getTime() - valuationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  if (yearsElapsed <= 0) return 0;

  const currentValue = toEuros(getCurrentValue(valuation));
  const purchasePrice = toEuros(getOriginalPurchasePrice(valuation));

  if (purchasePrice === 0) return 0;

  // Compound annual growth rate formula: (End Value / Start Value)^(1/years) - 1
  return (Math.pow(currentValue / purchasePrice, 1 / yearsElapsed) - 1) * 100;
}

/**
 * Check if valuation is current enough for mortgage purposes
 */
export function isCurrentEnoughForMortgage(
  valuation: PropertyValuation,
  currentDate: Date = new Date()
): boolean {
  const valuationDate = getValuationDate(valuation);
  const monthsOld =
    (currentDate.getTime() - valuationDate.getTime()) /
    (30.44 * 24 * 60 * 60 * 1000);

  return monthsOld <= MAX_VALUATION_AGE_MONTHS;
}

/**
 * Get valuation reliability score based on method
 */
export function getReliabilityScore(valuation: PropertyValuation): number {
  const method = getValuationMethod(valuation);

  switch (method) {
    case "BankAppraisal":
      return 95;
    case "IndependentAppraisal":
      return 90;
    case "InsuranceValuation":
      return 80;
    case "ComparativeMarketAnalysis":
      return 70;
    case "OnlineEstimate":
      return 60;
    case "SelfAssessment":
      return 40;
    default:
      return 50;
  }
}

/**
 * Check if valuation method is acceptable for mortgage underwriting
 */
export function isAcceptableForMortgage(valuation: PropertyValuation): boolean {
  const acceptableMethods: ValuationMethod[] = [
    "BankAppraisal",
    "IndependentAppraisal",
    "InsuranceValuation",
  ];

  return acceptableMethods.includes(getValuationMethod(valuation));
}

/**
 * Format property valuation for display
 */
export function formatPropertyValuation(valuation: PropertyValuation): string {
  const currentValue = formatMoney(getCurrentValue(valuation));
  const propertyType = getPropertyType(valuation);
  const location = getPropertyLocation(valuation);
  const method = getValuationMethod(valuation);

  return `${propertyType} in ${location.city}: ${currentValue} (${method})`;
}

/**
 * Create a conservative property valuation (reduces value by safety margin)
 */
export function createConservativeValuation(
  valuation: PropertyValuation,
  conservatismPercent: number = 10
): Result<PropertyValuation, PropertyValuationValidationError> {
  const currentValue = toEuros(getCurrentValue(valuation));
  const conservativeValue = currentValue * (1 - conservatismPercent / 100);

  return createPropertyValuation(
    conservativeValue,
    toEuros(getOriginalPurchasePrice(valuation)),
    getValuationDate(valuation),
    getValuationMethod(valuation),
    getPropertyType(valuation),
    getPropertyLocation(valuation),
    (valuation as any).valuerCertification,
    `Conservative estimate (${conservatismPercent}% reduction applied). ${
      (valuation as any).notes || ""
    }`
  );
}

/**
 * Compare two property valuations by current value
 */
export function compareByValue(
  a: PropertyValuation,
  b: PropertyValuation
): number {
  return compareMoney(getCurrentValue(a), getCurrentValue(b));
}

/**
 * Compare two property valuations by valuation date
 */
export function compareByDate(
  a: PropertyValuation,
  b: PropertyValuation
): number {
  const dateA = getValuationDate(a);
  const dateB = getValuationDate(b);

  return dateA.getTime() - dateB.getTime();
}

/**
 * Get German property market location quality description
 */
export function getLocationQualityDescription(
  quality: LocationQuality
): string {
  switch (quality) {
    case "Premium":
      return "Erstklassige Lage (Top-Städte)";
    case "Good":
      return "Gute Wohnlage";
    case "Average":
      return "Normale Wohnlage";
    case "Below Average":
      return "Einfache Lage";
    case "Rural":
      return "Ländliche Lage";
    default:
      return "Unbekannte Lage";
  }
}

/**
 * Validate German postal code
 */
export function isValidGermanPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode);
}

/**
 * Get minimum and maximum property values
 */
export function getMinimumPropertyValue(): number {
  return MIN_PROPERTY_VALUE;
}

export function getMaximumPropertyValue(): number {
  return MAX_PROPERTY_VALUE;
}

/**
 * Get maximum valuation age for mortgage purposes
 */
export function getMaxValuationAgeMonths(): number {
  return MAX_VALUATION_AGE_MONTHS;
}

/**
 * Check if two valuations are for the same property
 */
export function isSameProperty(
  a: PropertyValuation,
  b: PropertyValuation
): boolean {
  const locationA = getPropertyLocation(a);
  const locationB = getPropertyLocation(b);

  return (
    locationA.postalCode === locationB.postalCode &&
    locationA.city === locationB.city &&
    getPropertyType(a) === getPropertyType(b)
  );
}
