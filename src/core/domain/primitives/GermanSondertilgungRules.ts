/**
 * German-specific Sondertilgung Business Rules
 *
 * Implements business rules specific to German mortgage market:
 * - Bank-specific Sondertilgung limits (5%, 10%, 20%, 50%, unlimited)
 * - Timing restrictions and grace periods
 * - Fee calculations for excess payments
 * - Regional banking variations
 * - Consumer protection compliance
 */

import type { Branded } from "./Brand";
import { Result } from "./Brand";
import type { Percentage } from "../value-objects/Percentage";
import { createPercentage, toPercentageValue } from "../value-objects/Percentage";
import type { Money } from "../value-objects/Money";
import { createMoney, toEuros } from "../value-objects/Money";
import type { LoanAmount } from "../value-objects/LoanAmount";
import { toNumber as loanAmountToNumber } from "../value-objects/LoanAmount";
import type { ExtraPayment } from "../types/ExtraPayment";
import { getAmountAsEuros } from "../types/ExtraPayment";
import type { FixedRatePeriod } from "../types/FixedRatePeriod";
import { isCurrentlyActive, getRemainingYears } from "../types/FixedRatePeriod";

// Branded German Sondertilgung rules type
export type GermanSondertilgungRules = Branded<
  {
    readonly bankType: GermanBankType;
    readonly allowedPercentages: readonly SondertilgungPercentage[];
    readonly minimumAmount: Money;
    readonly maximumAmount?: Money;
    readonly timingRestrictions: TimingRestrictions;
    readonly feeStructure: FeeStructure;
    readonly specialConditions: SpecialConditions;
  },
  "GermanSondertilgungRules"
>;

// Common Sondertilgung percentages in German market
export type SondertilgungPercentage = 5 | 10 | 15 | 20 | 50 | 100; // 100 = unlimited

// German bank types with different Sondertilgung policies
export type GermanBankType =
  | "Sparkasse" // Local savings banks
  | "Volksbank" // Cooperative banks
  | "Privatbank" // Private banks (Deutsche Bank, Commerzbank, etc.)
  | "Bausparkasse" // Building societies
  | "Hypothekenbank" // Mortgage banks
  | "OnlineBank" // Online-only banks
  | "Genossenschaftsbank"; // Cooperative banks

// Timing restrictions for Sondertilgung
export type TimingRestrictions = {
  readonly gracePeriodMonths: number; // No Sondertilgung allowed in first X months
  readonly noticeRequiredDays: number; // Days notice required before payment
  readonly allowedPaymentDates: PaymentDateRestriction;
  readonly blackoutPeriods: readonly BlackoutPeriod[]; // Periods when no Sondertilgung allowed
};

export type PaymentDateRestriction =
  | "AnyTime" // Can pay anytime
  | "MonthEnd" // Only at month end
  | "QuarterEnd" // Only at quarter end
  | "YearEnd"; // Only at year end

export type BlackoutPeriod = {
  readonly startMonth: number;
  readonly endMonth: number;
  readonly reason: string;
};

// Fee structure for Sondertilgung
export type FeeStructure = {
  readonly feeType: SondertilgungFeeType;
  readonly baseFee?: Money; // Fixed fee per payment
  readonly percentageFee?: Percentage; // Percentage of payment amount
  readonly excessFeePercentage?: Percentage; // Extra fee for payments above allowed limit
  readonly minimumFee?: Money; // Minimum fee regardless of amount
  readonly maximumFee?: Money; // Maximum fee cap
};

export type SondertilgungFeeType =
  | "None" // No fees
  | "Fixed" // Fixed fee per payment
  | "Percentage" // Percentage of payment amount
  | "Tiered" // Different rates for different amounts
  | "ExcessOnly"; // Fee only for amounts above allowed limit

// Special conditions and exceptions
export type SpecialConditions = {
  readonly hardshipWaiver: boolean; // Waive restrictions in financial hardship
  readonly inheritanceException: boolean; // Special rules for inheritance payments
  readonly bonusPaymentAllowance: boolean; // Allow bonus/13th salary payments
  readonly refinancingGracePeriod: boolean; // Special rules during refinancing
  readonly firstTimeHomeBuyerBenefits: boolean; // Enhanced limits for first-time buyers
};

export type GermanSondertilgungValidationError =
  | "ExceedsAllowedPercentage"
  | "BelowMinimumAmount"
  | "AboveMaximumAmount"
  | "WithinGracePeriod"
  | "InsufficientNotice"
  | "InvalidPaymentDate"
  | "DuringBlackoutPeriod"
  | "ExcessiveFeeAmount"
  | "NotAllowedForBankType";

// Helper functions to safely create constants
function safeCreatePercentage(value: number): Percentage {
  const result = createPercentage(value);
  if (!result.success) {
    throw new Error(`Failed to create percentage constant: ${value}`);
  }
  return result.data;
}

function safeCreateMoney(value: number): Money {
  const result = createMoney(value);
  if (!result.success) {
    throw new Error(`Failed to create money constant: ${value}`);
  }
  return result.data;
}

// Pre-defined rule sets for common German bank types
const GERMAN_BANK_RULES: Record<
  GermanBankType,
  Partial<GermanSondertilgungRules>
> = {
  Sparkasse: {
    allowedPercentages: [5, 10] as const,
    timingRestrictions: {
      gracePeriodMonths: 12,
      noticeRequiredDays: 30,
      allowedPaymentDates: "MonthEnd",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Percentage",
      percentageFee: safeCreatePercentage(1.0), // 1% fee typical for Sparkasse
    },
  },

  Privatbank: {
    allowedPercentages: [5, 10, 20] as const,
    timingRestrictions: {
      gracePeriodMonths: 6,
      noticeRequiredDays: 14,
      allowedPaymentDates: "AnyTime",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Fixed",
      baseFee: safeCreateMoney(250), // €250 typical private bank fee
    },
  },

  OnlineBank: {
    allowedPercentages: [10, 20, 50] as const,
    timingRestrictions: {
      gracePeriodMonths: 3,
      noticeRequiredDays: 7,
      allowedPaymentDates: "AnyTime",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "None",
    },
  },

  Bausparkasse: {
    allowedPercentages: [5] as const,
    timingRestrictions: {
      gracePeriodMonths: 24, // Longer grace period for Bausparkasse
      noticeRequiredDays: 60,
      allowedPaymentDates: "YearEnd",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Tiered",
      percentageFee: safeCreatePercentage(0.5),
      excessFeePercentage: safeCreatePercentage(2.0),
    },
  },

  // Default rules for other bank types
  Volksbank: {
    allowedPercentages: [5, 10] as const,
    timingRestrictions: {
      gracePeriodMonths: 12,
      noticeRequiredDays: 30,
      allowedPaymentDates: "MonthEnd",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Percentage",
      percentageFee: safeCreatePercentage(1.0),
    },
  },

  Hypothekenbank: {
    allowedPercentages: [10, 20] as const,
    timingRestrictions: {
      gracePeriodMonths: 6,
      noticeRequiredDays: 30,
      allowedPaymentDates: "QuarterEnd",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Fixed",
      baseFee: safeCreateMoney(500),
    },
  },

  Genossenschaftsbank: {
    allowedPercentages: [5, 10] as const,
    timingRestrictions: {
      gracePeriodMonths: 12,
      noticeRequiredDays: 30,
      allowedPaymentDates: "MonthEnd",
      blackoutPeriods: [],
    },
    feeStructure: {
      feeType: "Percentage",
      percentageFee: safeCreatePercentage(0.75),
    },
  },
};

/**
 * Create German Sondertilgung rules for a specific bank type
 */
export function createGermanSondertilgungRules(
  bankType: GermanBankType,
  customOverrides?: Partial<GermanSondertilgungRules>
): Result<GermanSondertilgungRules, GermanSondertilgungValidationError> {
  const baseRules = GERMAN_BANK_RULES[bankType];

  // Set default minimum amount (€1000 typical minimum)
  const minAmountResult = createMoney(1000);
  if (!minAmountResult.success) {
    return { success: false, error: "BelowMinimumAmount" };
  }

  // Create default special conditions
  const defaultSpecialConditions: SpecialConditions = {
    hardshipWaiver: true,
    inheritanceException: true,
    bonusPaymentAllowance: true,
    refinancingGracePeriod: false,
    firstTimeHomeBuyerBenefits: false,
  };

  const rules: GermanSondertilgungRules = {
    bankType,
    allowedPercentages: baseRules.allowedPercentages || [5, 10],
    minimumAmount: minAmountResult.data,
    maximumAmount: undefined,
    timingRestrictions: baseRules.timingRestrictions || {
      gracePeriodMonths: 12,
      noticeRequiredDays: 30,
      allowedPaymentDates: "MonthEnd",
      blackoutPeriods: [],
    },
    feeStructure: baseRules.feeStructure || {
      feeType: "None",
    },
    specialConditions: defaultSpecialConditions,
    ...customOverrides,
  } as GermanSondertilgungRules;

  return { success: true, data: rules };
}

/**
 * Validate Sondertilgung payment against German rules
 */
export function validateSondertilgungPayment(
  rules: GermanSondertilgungRules,
  payment: ExtraPayment,
  originalLoanAmount: LoanAmount,
  existingPayments: ExtraPayment[],
  fixedRatePeriod?: FixedRatePeriod,
  paymentDate: Date = new Date()
): Result<void, GermanSondertilgungValidationError> {
  const rulesData = rules as any;

  // Check minimum amount
  const paymentAmount = getAmountAsEuros(payment);
  const minAmount = toEuros(rulesData.minimumAmount);

  if (paymentAmount < minAmount) {
    return { success: false, error: "BelowMinimumAmount" };
  }

  // Check maximum amount if set
  if (rulesData.maximumAmount) {
    const maxAmount = toEuros(rulesData.maximumAmount);
    if (paymentAmount > maxAmount) {
      return { success: false, error: "AboveMaximumAmount" };
    }
  }

  // Check yearly percentage limits
  const yearlyAmountResult = calculateYearlyAmount(payment, existingPayments);
  if (!yearlyAmountResult.success) {
    return { success: false, error: "ExceedsAllowedPercentage" };
  }

  const yearlyAmount = yearlyAmountResult.data;
  const loanAmount = loanAmountToNumber(originalLoanAmount);
  const yearlyPercentage = (yearlyAmount / loanAmount) * 100;

  const maxAllowedPercentage = Math.max(...rulesData.allowedPercentages);
  if (yearlyPercentage > maxAllowedPercentage) {
    return { success: false, error: "ExceedsAllowedPercentage" };
  }

  // Check grace period
  if (fixedRatePeriod) {
    const graceResult = validateGracePeriod(
      rules,
      fixedRatePeriod,
      paymentDate
    );
    if (!graceResult.success) {
      return graceResult;
    }
  }

  // Check timing restrictions
  const timingResult = validateTimingRestrictions(rules, paymentDate);
  if (!timingResult.success) {
    return timingResult;
  }

  return { success: true, data: undefined };
}

/**
 * Calculate Sondertilgung fees according to German rules
 */
export function calculateSondertilgungFees(
  rules: GermanSondertilgungRules,
  payment: ExtraPayment,
  originalLoanAmount: LoanAmount,
  existingYearlyPayments: ExtraPayment[]
): Result<Money, GermanSondertilgungValidationError> {
  const rulesData = rules as any;
  const feeStructure = rulesData.feeStructure as FeeStructure;
  const paymentAmount = getAmountAsEuros(payment);

  let totalFee = 0;

  switch (feeStructure.feeType) {
    case "None":
      break;

    case "Fixed":
      if (feeStructure.baseFee) {
        totalFee = toEuros(feeStructure.baseFee);
      }
      break;

    case "Percentage":
      if (feeStructure.percentageFee) {
        const percentage = toPercentageValue(feeStructure.percentageFee);
        totalFee = paymentAmount * (percentage / 100);
      }
      break;

    case "ExcessOnly": {
      // Calculate fee only on excess above allowed limit
      const excessResult = calculateExcessAmount(
        payment,
        existingYearlyPayments,
        originalLoanAmount,
        rulesData.allowedPercentages
      );

      if (excessResult.success && excessResult.data > 0) {
        if (feeStructure.excessFeePercentage) {
          const excessPercentage = toPercentageValue(
            feeStructure.excessFeePercentage
          );
          totalFee = excessResult.data * (excessPercentage / 100);
        }
      }
      break;
    }

    case "Tiered": {
      // Combine base percentage fee with excess fee
      if (feeStructure.percentageFee) {
        const basePercentage = toPercentageValue(feeStructure.percentageFee);
        totalFee = paymentAmount * (basePercentage / 100);
      }

      // Add excess fee if applicable
      const tieredExcessResult = calculateExcessAmount(
        payment,
        existingYearlyPayments,
        originalLoanAmount,
        rulesData.allowedPercentages
      );

      if (
        tieredExcessResult.success &&
        tieredExcessResult.data > 0 &&
        feeStructure.excessFeePercentage
      ) {
        const excessPercentage = toPercentageValue(
          feeStructure.excessFeePercentage
        );
        totalFee += tieredExcessResult.data * (excessPercentage / 100);
      }
      break;
    }
  }

  // Apply minimum fee
  if (feeStructure.minimumFee) {
    totalFee = Math.max(totalFee, toEuros(feeStructure.minimumFee));
  }

  // Apply maximum fee
  if (feeStructure.maximumFee) {
    totalFee = Math.min(totalFee, toEuros(feeStructure.maximumFee));
  }

  const feeResult = createMoney(totalFee);
  if (!feeResult.success) {
    return { success: false, error: "ExcessiveFeeAmount" };
  }

  return feeResult;
}

/**
 * Get available Sondertilgung percentages for bank type
 */
export function getAvailablePercentages(
  rules: GermanSondertilgungRules
): readonly SondertilgungPercentage[] {
  return (rules as any).allowedPercentages;
}

/**
 * Check if bank type supports unlimited Sondertilgung
 */
export function supportsUnlimitedSondertilgung(
  bankType: GermanBankType
): boolean {
  const rules = GERMAN_BANK_RULES[bankType];
  return rules.allowedPercentages?.includes(100) || false;
}

/**
 * Get recommended Sondertilgung strategy for German market
 */
export function getRecommendedStrategy(
  rules: GermanSondertilgungRules,
  originalLoanAmount: LoanAmount,
  availableAmount: Money,
  fixedRatePeriod?: FixedRatePeriod
): {
  recommendedPercentage: SondertilgungPercentage;
  optimalTiming: string;
  expectedSavings: number;
  riskAssessment: string;
} {
  const rulesData = rules as any;
  const availableAmountEuros = toEuros(availableAmount);
  const loanAmountEuros = loanAmountToNumber(originalLoanAmount);
  const maxAvailablePercentage = Math.max(...rulesData.allowedPercentages);

  // Calculate what percentage the available amount represents
  const availablePercentage = (availableAmountEuros / loanAmountEuros) * 100;

  // Recommend the highest allowed percentage that doesn't exceed available amount
  let recommendedPercentage: SondertilgungPercentage = 5;
  for (const percentage of rulesData.allowedPercentages) {
    if (
      percentage <= availablePercentage &&
      percentage <= maxAvailablePercentage
    ) {
      recommendedPercentage = percentage;
    }
  }

  // Determine optimal timing
  let optimalTiming = "Sofort";
  if (fixedRatePeriod && isCurrentlyActive(fixedRatePeriod)) {
    const remainingYears = getRemainingYears(fixedRatePeriod);
    if (remainingYears > 5) {
      optimalTiming = "Während der Zinsbindung";
    } else {
      optimalTiming = "Vor Zinsbindungsende";
    }
  }

  // Simple savings estimation (this would be more complex in reality)
  const recommendedAmount = loanAmountEuros * (recommendedPercentage / 100);
  const estimatedSavings = recommendedAmount * 0.03 * 10; // Rough 3% over 10 years

  // Risk assessment
  let riskAssessment = "Niedrig";
  if (recommendedPercentage >= 20) {
    riskAssessment = "Mittel - Liquidität beachten";
  }
  if (recommendedPercentage >= 50) {
    riskAssessment = "Hoch - Finanzielle Flexibilität prüfen";
  }

  return {
    recommendedPercentage,
    optimalTiming,
    expectedSavings: Math.round(estimatedSavings),
    riskAssessment,
  };
}

/**
 * Helper functions
 */
function calculateYearlyAmount(
  payment: ExtraPayment,
  existingPayments: ExtraPayment[]
): Result<number, GermanSondertilgungValidationError> {
  const paymentYear = Math.ceil((payment as any).month / 12);

  let yearlyTotal = getAmountAsEuros(payment);

  for (const existing of existingPayments) {
    const existingYear = Math.ceil((existing as any).month / 12);
    if (existingYear === paymentYear) {
      yearlyTotal += getAmountAsEuros(existing);
    }
  }

  return { success: true, data: yearlyTotal };
}

function validateGracePeriod(
  rules: GermanSondertilgungRules,
  fixedRatePeriod: FixedRatePeriod,
  paymentDate: Date
): Result<void, GermanSondertilgungValidationError> {
  const rulesData = rules as any;
  const gracePeriodMonths = rulesData.timingRestrictions.gracePeriodMonths;

  // For simplicity, assume grace period starts from fixed rate period start
  // In reality, this would be from loan origination date
  const gracePeriodEndDate = new Date();
  gracePeriodEndDate.setMonth(
    gracePeriodEndDate.getMonth() + gracePeriodMonths
  );

  if (paymentDate < gracePeriodEndDate) {
    return { success: false, error: "WithinGracePeriod" };
  }

  return { success: true, data: undefined };
}

function validateTimingRestrictions(
  rules: GermanSondertilgungRules,
  paymentDate: Date
): Result<void, GermanSondertilgungValidationError> {
  const rulesData = rules as any;
  const restrictions = rulesData.timingRestrictions as TimingRestrictions;

  // Check blackout periods
  const paymentMonth =
    (paymentDate.getFullYear() - 2023) * 12 + paymentDate.getMonth() + 1;

  for (const blackout of restrictions.blackoutPeriods) {
    if (
      paymentMonth >= blackout.startMonth &&
      paymentMonth <= blackout.endMonth
    ) {
      return { success: false, error: "DuringBlackoutPeriod" };
    }
  }

  // Check payment date restrictions
  const day = paymentDate.getDate();
  const month = paymentDate.getMonth();

  switch (restrictions.allowedPaymentDates) {
    case "MonthEnd": {
      // Check if it's the last day of the month
      const lastDay = new Date(
        paymentDate.getFullYear(),
        month + 1,
        0
      ).getDate();
      if (day !== lastDay) {
        return { success: false, error: "InvalidPaymentDate" };
      }
      break;
    }

    case "QuarterEnd": {
      // Check if it's the last day of a quarter
      if (![2, 5, 8, 11].includes(month)) {
        // March, June, September, December
        return { success: false, error: "InvalidPaymentDate" };
      }
      break;
    }

    case "YearEnd": {
      // Check if it's December 31st
      if (month !== 11 || day !== 31) {
        return { success: false, error: "InvalidPaymentDate" };
      }
      break;
    }

    case "AnyTime":
      // No restrictions
      break;
  }

  return { success: true, data: undefined };
}

function calculateExcessAmount(
  payment: ExtraPayment,
  existingYearlyPayments: ExtraPayment[],
  originalLoanAmount: LoanAmount,
  allowedPercentages: readonly SondertilgungPercentage[]
): Result<number, GermanSondertilgungValidationError> {
  const maxAllowedPercentage = Math.max(...allowedPercentages);
  const loanAmount = loanAmountToNumber(originalLoanAmount);
  const maxAllowedAmount = loanAmount * (maxAllowedPercentage / 100);

  const yearlyAmountResult = calculateYearlyAmount(
    payment,
    existingYearlyPayments
  );
  if (!yearlyAmountResult.success) {
    return yearlyAmountResult;
  }

  const excessAmount = Math.max(0, yearlyAmountResult.data - maxAllowedAmount);
  return { success: true, data: excessAmount };
}

/**
 * Format German bank type for display
 */
export function formatGermanBankType(bankType: GermanBankType): string {
  const labels = {
    Sparkasse: "Sparkasse",
    Volksbank: "Volksbank/Raiffeisenbank",
    Privatbank: "Private Geschäftsbank",
    Bausparkasse: "Bausparkasse",
    Hypothekenbank: "Hypothekenbank",
    OnlineBank: "Online-Bank",
    Genossenschaftsbank: "Genossenschaftsbank",
  };

  return labels[bankType] || bankType;
}

/**
 * Get all available German bank types
 */
export function getAvailableGermanBankTypes(): GermanBankType[] {
  return Object.keys(GERMAN_BANK_RULES) as GermanBankType[];
}
