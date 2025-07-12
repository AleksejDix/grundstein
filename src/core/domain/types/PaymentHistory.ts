/**
 * PaymentHistory domain type
 *
 * Tracks actual payments made vs. scheduled payments for German mortgages:
 * - Essential for current balance calculations
 * - Supports payment timing analysis
 * - Handles partial payments and overpayments
 * - Critical for refinancing and loan modification scenarios
 * - Supports German banking payment standards
 */

import type { Branded } from "../primitives/Brand";
import { Result } from "../primitives/Brand";
import type { Money } from "../value-objects/Money";
import {
  createMoney,
  toEuros,
  formatMoney,
  ZERO_MONEY,
} from "../value-objects/Money";
import type { PaymentMonth } from "../value-objects/PaymentMonth";
import {
  createPaymentMonth,
  toNumber as paymentMonthToNumber,
  formatPaymentMonth,
} from "../value-objects/PaymentMonth";
import type { MonthlyPayment } from "./MonthlyPayment";

// Branded PaymentHistory type
export type PaymentHistory = Branded<
  {
    readonly loanId: string;
    readonly payments: readonly PaymentRecord[];
    readonly startDate: Date;
    readonly lastUpdated: Date;
  },
  "PaymentHistory"
>;

// Individual payment record
export type PaymentRecord = {
  readonly paymentMonth: PaymentMonth;
  readonly scheduledPayment: MonthlyPayment;
  readonly actualPayment: Money;
  readonly paymentDate: Date;
  readonly paymentStatus: PaymentStatus;
  readonly paymentMethod: PaymentMethod;
  readonly extraPayment?: Money;
  readonly notes?: string;
};

// Payment status for German banking standards
export type PaymentStatus =
  | "Scheduled" // Payment is scheduled but not yet made
  | "OnTime" // Payment made on or before due date
  | "Late" // Payment made after due date
  | "Partial" // Only partial payment made
  | "Overpaid" // More than scheduled amount paid
  | "Missed" // Payment not made
  | "Reversed"; // Payment was reversed/bounced

// Payment methods common in Germany
export type PaymentMethod =
  | "SEPA_DirectDebit" // SEPA Lastschrift (most common)
  | "BankTransfer" // Überweisung
  | "OnlineBanking" // Online banking transfer
  | "Standing_Order" // Dauerauftrag
  | "Cash" // Bar (rare for mortgages)
  | "Check"; // Scheck (very rare)

export type PaymentHistoryValidationError =
  | "InvalidLoanId"
  | "InvalidStartDate"
  | "DuplicatePaymentMonth"
  | "InvalidPaymentRecord"
  | "PaymentOutOfSequence"
  | "FuturePaymentDate"
  | "NegativePaymentAmount";

// Business constants
const MAX_LATE_DAYS = 90; // Maximum days late before serious delinquency
const MIN_PARTIAL_PAYMENT_PERCENT = 10; // Minimum 10% for partial payment

/**
 * Smart constructor for PaymentHistory type
 */
export function createPaymentHistory(
  loanId: string,
  startDate: Date,
  initialPayments: PaymentRecord[] = [],
): Result<PaymentHistory, PaymentHistoryValidationError> {
  // Validate loan ID
  if (!loanId.trim()) {
    return { success: false, error: "InvalidLoanId" };
  }

  // Validate start date
  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  if (startDate < tenYearsAgo || startDate > now) {
    return { success: false, error: "InvalidStartDate" };
  }

  // Validate and sort payments
  const validationResult = validatePaymentRecords(initialPayments);
  if (!validationResult.success) {
    return validationResult;
  }

  const sortedPayments = [...initialPayments].sort(
    (a, b) =>
      paymentMonthToNumber(a.paymentMonth) -
      paymentMonthToNumber(b.paymentMonth),
  );

  return {
    success: true,
    data: {
      loanId: loanId.trim(),
      payments: sortedPayments,
      startDate: new Date(startDate),
      lastUpdated: new Date(),
    } as unknown as PaymentHistory,
  };
}

/**
 * Create a payment record
 */
export function createPaymentRecord(
  paymentMonth: number,
  scheduledPayment: MonthlyPayment,
  actualPaymentAmount: number,
  paymentDate: Date,
  paymentMethod: PaymentMethod = "SEPA_DirectDebit",
  extraPaymentAmount?: number,
  notes?: string,
): Result<PaymentRecord, PaymentHistoryValidationError> {
  // Create payment month
  const paymentMonthResult = createPaymentMonth(paymentMonth);
  if (!paymentMonthResult.success) {
    return { success: false, error: "InvalidPaymentRecord" };
  }

  // Create actual payment amount
  if (actualPaymentAmount < 0) {
    return { success: false, error: "NegativePaymentAmount" };
  }

  const actualPaymentResult = createMoney(actualPaymentAmount);
  if (!actualPaymentResult.success) {
    return { success: false, error: "InvalidPaymentRecord" };
  }

  // Create extra payment if provided
  let extraPayment: Money | undefined;
  if (extraPaymentAmount !== undefined) {
    if (extraPaymentAmount < 0) {
      return { success: false, error: "NegativePaymentAmount" };
    }
    const extraResult = createMoney(extraPaymentAmount);
    if (!extraResult.success) {
      return { success: false, error: "InvalidPaymentRecord" };
    }
    extraPayment = extraResult.data;
  }

  // Validate payment date is not in the future
  const now = new Date();
  if (paymentDate > now) {
    return { success: false, error: "FuturePaymentDate" };
  }

  // Determine payment status
  const scheduledAmount = toEuros(scheduledPayment.total);
  const paymentStatus = determinePaymentStatus(
    actualPaymentAmount,
    scheduledAmount,
  );

  return {
    success: true,
    data: {
      paymentMonth: paymentMonthResult.data,
      scheduledPayment,
      actualPayment: actualPaymentResult.data,
      paymentDate: new Date(paymentDate),
      paymentStatus,
      paymentMethod,
      extraPayment,
      notes,
    },
  };
}

/**
 * Add a payment record to history
 */
export function addPaymentRecord(
  history: PaymentHistory,
  paymentRecord: PaymentRecord,
): Result<PaymentHistory, PaymentHistoryValidationError> {
  // Check for duplicate payment month
  const existingPayment = (history as any).payments.find(
    (p: PaymentRecord) =>
      paymentMonthToNumber(p.paymentMonth) ===
      paymentMonthToNumber(paymentRecord.paymentMonth),
  );

  if (existingPayment) {
    return { success: false, error: "DuplicatePaymentMonth" };
  }

  // Add payment and sort
  const updatedPayments = [...(history as any).payments, paymentRecord].sort(
    (a, b) =>
      paymentMonthToNumber(a.paymentMonth) -
      paymentMonthToNumber(b.paymentMonth),
  );

  return {
    success: true,
    data: {
      ...(history as any),
      payments: updatedPayments,
      lastUpdated: new Date(),
    } as PaymentHistory,
  };
}

/**
 * Update an existing payment record
 */
export function updatePaymentRecord(
  history: PaymentHistory,
  paymentMonth: number,
  updates: Partial<Omit<PaymentRecord, "paymentMonth">>,
): Result<PaymentHistory, PaymentHistoryValidationError> {
  const payments = [...(history as any).payments];
  const paymentIndex = payments.findIndex(
    (p) => paymentMonthToNumber(p.paymentMonth) === paymentMonth,
  );

  if (paymentIndex === -1) {
    return { success: false, error: "InvalidPaymentRecord" };
  }

  // Update the payment record
  payments[paymentIndex] = {
    ...payments[paymentIndex],
    ...updates,
  };

  return {
    success: true,
    data: {
      ...(history as any),
      payments,
      lastUpdated: new Date(),
    } as PaymentHistory,
  };
}

/**
 * Get loan ID
 */
export function getLoanId(history: PaymentHistory): string {
  return (history as any).loanId;
}

/**
 * Get all payment records
 */
export function getPaymentRecords(
  history: PaymentHistory,
): readonly PaymentRecord[] {
  return (history as any).payments;
}

/**
 * Get start date
 */
export function getStartDate(history: PaymentHistory): Date {
  return new Date((history as any).startDate);
}

/**
 * Get last updated date
 */
export function getLastUpdated(history: PaymentHistory): Date {
  return new Date((history as any).lastUpdated);
}

/**
 * Get payment record for specific month
 */
export function getPaymentRecord(
  history: PaymentHistory,
  paymentMonth: number,
): PaymentRecord | undefined {
  return getPaymentRecords(history).find(
    (p) => paymentMonthToNumber(p.paymentMonth) === paymentMonth,
  );
}

/**
 * Calculate total payments made
 */
export function calculateTotalPaymentsMade(history: PaymentHistory): Money {
  const payments = getPaymentRecords(history);
  let total = 0;

  for (const payment of payments) {
    total += toEuros(payment.actualPayment);
    if (payment.extraPayment) {
      total += toEuros(payment.extraPayment);
    }
  }

  const result = createMoney(total);
  return result.success ? result.data : ZERO_MONEY;
}

/**
 * Calculate total scheduled payments
 */
export function calculateTotalScheduledPayments(
  history: PaymentHistory,
): Money {
  const payments = getPaymentRecords(history);
  let total = 0;

  for (const payment of payments) {
    total += toEuros(payment.scheduledPayment.total);
  }

  const result = createMoney(total);
  return result.success ? result.data : ZERO_MONEY;
}

/**
 * Calculate payment variance (actual vs scheduled)
 */
export function calculatePaymentVariance(history: PaymentHistory): number {
  const totalActual = toEuros(calculateTotalPaymentsMade(history));
  const totalScheduled = toEuros(calculateTotalScheduledPayments(history));

  return totalActual - totalScheduled;
}

/**
 * Get payment statistics
 */
export function getPaymentStatistics(history: PaymentHistory): {
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  partialPayments: number;
  overpayments: number;
  averagePaymentAmount: number;
  paymentConsistencyScore: number;
} {
  const payments = getPaymentRecords(history);

  const stats = {
    totalPayments: payments.length,
    onTimePayments: 0,
    latePayments: 0,
    missedPayments: 0,
    partialPayments: 0,
    overpayments: 0,
    averagePaymentAmount: 0,
    paymentConsistencyScore: 0,
  };

  if (payments.length === 0) {
    return stats;
  }

  let totalAmount = 0;

  for (const payment of payments) {
    totalAmount += toEuros(payment.actualPayment);

    switch (payment.paymentStatus) {
      case "OnTime":
        stats.onTimePayments++;
        break;
      case "Late":
        stats.latePayments++;
        break;
      case "Missed":
        stats.missedPayments++;
        break;
      case "Partial":
        stats.partialPayments++;
        break;
      case "Overpaid":
        stats.overpayments++;
        break;
    }
  }

  stats.averagePaymentAmount = totalAmount / payments.length;

  // Calculate consistency score (0-100)
  const positivePayments = stats.onTimePayments + stats.overpayments;
  stats.paymentConsistencyScore = Math.round(
    (positivePayments / payments.length) * 100,
  );

  return stats;
}

/**
 * Get payments by status
 */
export function getPaymentsByStatus(
  history: PaymentHistory,
  status: PaymentStatus,
): PaymentRecord[] {
  return getPaymentRecords(history).filter((p) => p.paymentStatus === status);
}

/**
 * Get payments within date range
 */
export function getPaymentsInDateRange(
  history: PaymentHistory,
  startDate: Date,
  endDate: Date,
): PaymentRecord[] {
  return getPaymentRecords(history).filter(
    (p) => p.paymentDate >= startDate && p.paymentDate <= endDate,
  );
}

/**
 * Check if payment history shows good standing
 */
export function isInGoodStanding(history: PaymentHistory): boolean {
  const stats = getPaymentStatistics(history);

  // Empty payment history is considered good standing
  if (stats.totalPayments === 0) {
    return true;
  }

  // Good standing criteria:
  // - At least 90% payment consistency
  // - No more than 1 missed payment in last 12 months
  // - No more than 2 late payments in last 6 months

  return (
    stats.paymentConsistencyScore >= 90 &&
    stats.missedPayments <= 1 &&
    stats.latePayments <= 2
  );
}

/**
 * Calculate days late for a payment
 */
export function calculateDaysLate(
  paymentRecord: PaymentRecord,
  dueDate: Date,
): number {
  if (paymentRecord.paymentStatus !== "Late") {
    return 0;
  }

  const diffMs = paymentRecord.paymentDate.getTime() - dueDate.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

/**
 * Determine payment status based on amounts and timing
 */
function determinePaymentStatus(
  actualAmount: number,
  scheduledAmount: number,
): PaymentStatus {
  if (actualAmount === 0) {
    return "Missed";
  }

  const variance = actualAmount - scheduledAmount;
  const percentagePaid = (actualAmount / scheduledAmount) * 100;

  if (percentagePaid < MIN_PARTIAL_PAYMENT_PERCENT) {
    return "Missed";
  }

  if (variance > 0.01) {
    // More than 1 cent overpaid
    return "Overpaid";
  }

  if (percentagePaid < 100) {
    return "Partial";
  }

  return "OnTime"; // Default to on-time, will be updated based on date checking
}

/**
 * Validate payment records for consistency
 */
function validatePaymentRecords(
  payments: PaymentRecord[],
): Result<void, PaymentHistoryValidationError> {
  const monthsSeen = new Set<number>();

  for (const payment of payments) {
    const month = paymentMonthToNumber(payment.paymentMonth);

    if (monthsSeen.has(month)) {
      return { success: false, error: "DuplicatePaymentMonth" };
    }

    monthsSeen.add(month);

    // Validate payment amounts are non-negative
    if (toEuros(payment.actualPayment) < 0) {
      return { success: false, error: "NegativePaymentAmount" };
    }

    if (payment.extraPayment && toEuros(payment.extraPayment) < 0) {
      return { success: false, error: "NegativePaymentAmount" };
    }
  }

  return { success: true, data: undefined };
}

/**
 * Format payment record for display
 */
export function formatPaymentRecord(record: PaymentRecord): string {
  const month = formatPaymentMonth(record.paymentMonth);
  const actualAmount = formatMoney(record.actualPayment);
  const scheduledAmount = formatMoney(record.scheduledPayment.total);
  const status = getPaymentStatusDescription(record.paymentStatus);

  let result = `${month}: ${actualAmount} (geplant: ${scheduledAmount}) - ${status}`;

  if (record.extraPayment && toEuros(record.extraPayment) > 0) {
    const extraAmount = formatMoney(record.extraPayment);
    result += ` + Sondertilgung: ${extraAmount}`;
  }

  return result;
}

/**
 * Get payment status description in German
 */
export function getPaymentStatusDescription(status: PaymentStatus): string {
  switch (status) {
    case "Scheduled":
      return "Geplant";
    case "OnTime":
      return "Pünktlich";
    case "Late":
      return "Verspätet";
    case "Partial":
      return "Teilzahlung";
    case "Overpaid":
      return "Überzahlung";
    case "Missed":
      return "Ausgefallen";
    case "Reversed":
      return "Rückgängig";
    default:
      return "Unbekannt";
  }
}

/**
 * Get payment method description in German
 */
export function getPaymentMethodDescription(method: PaymentMethod): string {
  switch (method) {
    case "SEPA_DirectDebit":
      return "SEPA Lastschrift";
    case "BankTransfer":
      return "Überweisung";
    case "OnlineBanking":
      return "Online Banking";
    case "Standing_Order":
      return "Dauerauftrag";
    case "Cash":
      return "Bar";
    case "Check":
      return "Scheck";
    default:
      return "Unbekannt";
  }
}

/**
 * Export payment history to summary format
 */
export function exportPaymentSummary(history: PaymentHistory): {
  loanId: string;
  totalPayments: number;
  totalAmount: number;
  averagePayment: number;
  consistencyScore: number;
  goodStanding: boolean;
  lastPaymentDate?: Date;
} {
  const payments = getPaymentRecords(history);
  const stats = getPaymentStatistics(history);
  const totalAmount = toEuros(calculateTotalPaymentsMade(history));

  const lastPayment =
    payments.length > 0 ? payments[payments.length - 1] : undefined;

  return {
    loanId: getLoanId(history),
    totalPayments: payments.length,
    totalAmount,
    averagePayment: stats.averagePaymentAmount,
    consistencyScore: stats.paymentConsistencyScore,
    goodStanding: isInGoodStanding(history),
    lastPaymentDate: lastPayment?.paymentDate,
  };
}

/**
 * Get maximum late days allowed
 */
export function getMaxLateDays(): number {
  return MAX_LATE_DAYS;
}

/**
 * Get minimum partial payment percentage
 */
export function getMinPartialPaymentPercent(): number {
  return MIN_PARTIAL_PAYMENT_PERCENT;
}
