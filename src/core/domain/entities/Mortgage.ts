/**
 * Mortgage Entity
 * 
 * Represents a mortgage loan with identity and lifecycle.
 * This is a functional entity - no classes, pure functions only.
 */

import { Result } from "../primitives/Brand";
import type { LoanConfiguration } from "../types/LoanConfiguration";
import type { ExtraPaymentPlan } from "../types/ExtraPaymentPlan";
import type { CurrencyCode } from "../value-objects/Currency";

// Entity identity
export type MortgageId = string & { readonly __brand: "MortgageId" };

// Mortgage status
export type MortgageStatus = "draft" | "active" | "completed" | "refinanced";

// The Mortgage entity
export type Mortgage = {
  readonly id: MortgageId;                    // Branded - ensures uniqueness
  readonly name: string;                      // Plain - no rules needed
  readonly propertyAddress?: string;          // Plain - just text
  readonly bankName: string;                  // Plain - just text
  readonly currency: CurrencyCode;            // Which currency (EUR/CHF)
  readonly configuration: LoanConfiguration;  // Domain type - complex rules
  readonly status: MortgageStatus;            // Union type - already safe
  readonly startDate: Date;                   // Standard type - clear meaning
  readonly extraPaymentPlan?: ExtraPaymentPlan; // Domain type - has rules
  readonly createdAt: Date;                   // Standard type
  readonly updatedAt: Date;                   // Standard type
  readonly metadata?: {                       // Plain object - no rules
    readonly accountNumber?: string;
    readonly contactPerson?: string;
    readonly notes?: string;
    readonly market?: "DE" | "CH" | "AT";   // Which market/country
  };
};

// Factory functions
export function createMortgageId(id: string): Result<MortgageId, string> {
  if (!id || id.trim().length === 0) {
    return Result.error("Mortgage ID cannot be empty");
  }
  return Result.ok(id as MortgageId);
}

export function generateMortgageId(): MortgageId {
  return `mortgage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as MortgageId;
}

// Create a new mortgage
export function createMortgage(
  params: {
    id?: MortgageId;
    name: string;
    propertyAddress?: string;
    bankName: string;
    currency: CurrencyCode;
    configuration: LoanConfiguration;
    startDate: Date;
    extraPaymentPlan?: ExtraPaymentPlan;
    metadata?: Mortgage["metadata"];
  }
): Result<Mortgage, string> {
  // Validation
  if (!params.name || params.name.trim().length === 0) {
    return Result.error("Mortgage name cannot be empty");
  }
  
  if (!params.bankName || params.bankName.trim().length === 0) {
    return Result.error("Bank name cannot be empty");
  }
  
  if (params.startDate > new Date()) {
    return Result.error("Start date cannot be in the future");
  }
  
  const now = new Date();
  const mortgage: Mortgage = {
    id: params.id || generateMortgageId(),
    name: params.name.trim(),
    propertyAddress: params.propertyAddress?.trim(),
    bankName: params.bankName.trim(),
    currency: params.currency,
    configuration: params.configuration,
    status: "draft",
    startDate: params.startDate,
    extraPaymentPlan: params.extraPaymentPlan,
    createdAt: now,
    updatedAt: now,
    metadata: params.metadata,
  };
  
  return Result.ok(mortgage);
}

// Update mortgage details
export function updateMortgage(
  mortgage: Mortgage,
  updates: Partial<{
    name: string;
    propertyAddress: string;
    bankName: string;
    configuration: LoanConfiguration;
    extraPaymentPlan: ExtraPaymentPlan;
    metadata: Mortgage["metadata"];
  }>
): Result<Mortgage, string> {
  // Validation
  if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
    return Result.error("Mortgage name cannot be empty");
  }
  
  if (updates.bankName !== undefined && (!updates.bankName || updates.bankName.trim().length === 0)) {
    return Result.error("Bank name cannot be empty");
  }
  
  const updated: Mortgage = {
    ...mortgage,
    name: updates.name !== undefined ? updates.name.trim() : mortgage.name,
    propertyAddress: updates.propertyAddress !== undefined ? updates.propertyAddress.trim() : mortgage.propertyAddress,
    bankName: updates.bankName !== undefined ? updates.bankName.trim() : mortgage.bankName,
    configuration: updates.configuration !== undefined ? updates.configuration : mortgage.configuration,
    extraPaymentPlan: updates.extraPaymentPlan !== undefined ? updates.extraPaymentPlan : mortgage.extraPaymentPlan,
    metadata: updates.metadata !== undefined ? updates.metadata : mortgage.metadata,
    updatedAt: new Date(),
  };
  
  return Result.ok(updated);
}

// Status transitions
export function activateMortgage(mortgage: Mortgage): Result<Mortgage, string> {
  if (mortgage.status !== "draft") {
    return Result.error("Can only activate mortgages in draft status");
  }
  
  return Result.ok({
    ...mortgage,
    status: "active",
    updatedAt: new Date(),
  });
}

export function completeMortgage(mortgage: Mortgage): Result<Mortgage, string> {
  if (mortgage.status !== "active") {
    return Result.error("Can only complete active mortgages");
  }
  
  return Result.ok({
    ...mortgage,
    status: "completed",
    updatedAt: new Date(),
  });
}

export function refinanceMortgage(mortgage: Mortgage, newMortgageId: MortgageId): Result<Mortgage, string> {
  if (mortgage.status !== "active") {
    return Result.error("Can only refinance active mortgages");
  }
  
  return Result.ok({
    ...mortgage,
    status: "refinanced",
    updatedAt: new Date(),
    metadata: {
      ...mortgage.metadata,
      refinancedTo: newMortgageId,
    },
  });
}

// Queries
export function isActive(mortgage: Mortgage): boolean {
  return mortgage.status === "active";
}

export function isCompleted(mortgage: Mortgage): boolean {
  return mortgage.status === "completed";
}

export function canMakePayments(mortgage: Mortgage): boolean {
  return mortgage.status === "active";
}

export function canAddExtraPayments(mortgage: Mortgage): boolean {
  return mortgage.status === "active" && mortgage.extraPaymentPlan !== undefined;
}

// Calculate age of mortgage
export function getMortgageAgeInMonths(mortgage: Mortgage, asOfDate: Date = new Date()): number {
  const diffMs = asOfDate.getTime() - mortgage.startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
}

// Format for display
export function getMortgageDisplayName(mortgage: Mortgage): string {
  if (mortgage.propertyAddress) {
    return `${mortgage.name} - ${mortgage.propertyAddress}`;
  }
  return mortgage.name;
}

// Type guards
export function isMortgage(value: unknown): value is Mortgage {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "configuration" in value &&
    "status" in value
  );
}