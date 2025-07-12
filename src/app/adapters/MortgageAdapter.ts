/**
 * Mortgage Presentation Adapter
 *
 * This adapter bridges our robust domain-driven MortgageService with the
 * existing Vue.js UI. It transforms between UI reactive state and domain
 * objects while maintaining the same user experience.
 *
 * Key responsibilities:
 * - Transform UI inputs to domain service calls
 * - Transform domain results to UI presentation models
 * - Handle errors gracefully with user-friendly messages
 * - Maintain reactive behavior for Vue components
 */

import { ref, computed, reactive } from "vue";
import {
  analyzeLoan,
  analyzeSondertilgung,
  getQuickEstimate,
  type LoanScenarioInput,
  type LoanAnalysis,
} from "../services/application/services/MortgageService";

/**
 * UI State Model (matches current Mortgage.view.vue interface)
 */
export type MortgageUIInputs = {
  loan: number;
  interestRate: number;
  principalRate: number;
  monthlyPayment: number | undefined;
  termMonths: number | undefined;
  startDate: string;
};

/**
 * UI Presentation Model for calculated results
 */
export type MortgagePresentationModel = {
  // Basic loan info
  monthlyPayment: number;
  termMonths: number;
  termYears: number;

  // Payment breakdown
  monthlyPrincipal: number;
  monthlyInterest: number;
  principalPercentage: number;

  // Totals
  totalInterestPaid: number;
  totalAmountPaid: number;

  // First year summary
  firstYearPayments: number;
  firstYearInterest: number;
  firstYearPrincipal: number;
  firstYearEndBalance: number;

  // Status
  isValid: boolean;
  errorMessage?: string;
};

/**
 * Extra payments model for Sondertilgung
 */
export type ExtraPaymentsModel = Record<number, number>;

/**
 * Mortgage Presentation Adapter Composable
 */
export function useMortgageAdapter() {
  // Reactive state
  const inputs = reactive<MortgageUIInputs>({
    loan: 100000,
    interestRate: 5.6,
    principalRate: 2,
    monthlyPayment: undefined,
    termMonths: undefined,
    startDate: "2023-01-01",
  });

  const extraPayments = ref<ExtraPaymentsModel>({
    2: 17000, // €5,000 extra payment in February 2023
  });
  const sondertilgungMaxPercent = ref(5);

  // Helper function to calculate presentation model
  function calculatePresentationModel(): MortgagePresentationModel {
    try {
      // Determine term specification
      let _termInput: LoanScenarioInput;

      if (inputs.termMonths) {
        _termInput = {
          loanAmount: inputs.loan,
          interestRate: inputs.interestRate,
          termMonths: inputs.termMonths,
          monthlyPayment: inputs.monthlyPayment,
        };
      } else {
        // Calculate term from principal rate (German style)
        const estimatedTermYears = estimateTermFromPrincipalRate();
        _termInput = {
          loanAmount: inputs.loan,
          interestRate: inputs.interestRate,
          termYears: estimatedTermYears,
          monthlyPayment: inputs.monthlyPayment,
        };
      }

      // Get domain analysis (this is now asynchronous, but we'll handle it)
      // For immediate UI feedback, we'll use the quick estimate
      const quick = getQuickEstimate(
        inputs.loan,
        inputs.interestRate,
        (inputs.termMonths || 360) / 12,
      );

      return {
        monthlyPayment: quick.monthlyPayment,
        termMonths: inputs.termMonths || 360,
        termYears: (inputs.termMonths || 360) / 12,

        // Calculate breakdown (simplified for now)
        monthlyPrincipal: calculateMonthlyPrincipal(quick.monthlyPayment),
        monthlyInterest: calculateMonthlyInterest(quick.monthlyPayment),
        principalPercentage: calculatePrincipalPercentage(quick.monthlyPayment),

        totalInterestPaid: quick.totalInterest,
        totalAmountPaid: quick.totalPaid,

        // First year estimates
        firstYearPayments: quick.monthlyPayment * 12,
        firstYearInterest: calculateMonthlyInterest(quick.monthlyPayment) * 12,
        firstYearPrincipal:
          calculateMonthlyPrincipal(quick.monthlyPayment) * 12,
        firstYearEndBalance:
          inputs.loan - calculateMonthlyPrincipal(quick.monthlyPayment) * 12,

        isValid: true,
      };
    } catch (error) {
      return {
        monthlyPayment: 0,
        termMonths: 360,
        termYears: 30,
        monthlyPrincipal: 0,
        monthlyInterest: 0,
        principalPercentage: 0,
        totalInterestPaid: 0,
        totalAmountPaid: 0,
        firstYearPayments: 0,
        firstYearInterest: 0,
        firstYearPrincipal: 0,
        firstYearEndBalance: 0,
        isValid: false,
        errorMessage: "Calculation error: " + String(error),
      };
    }
  }

  /**
   * Estimate term in years from German-style principal rate
   */
  function estimateTermFromPrincipalRate(): number {
    // This is a simplified estimation - German mortgages often specify
    // an annual principal repayment rate
    const annualPrincipalAmount = inputs.loan * (inputs.principalRate / 100);
    const estimatedYears = Math.min(
      40,
      Math.max(5, inputs.loan / annualPrincipalAmount),
    );
    return Math.round(estimatedYears);
  }

  /**
   * Calculate monthly principal payment
   */
  function calculateMonthlyPrincipal(monthlyPayment: number): number {
    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    const monthlyInterest = inputs.loan * monthlyInterestRate;
    return Math.max(0, monthlyPayment - monthlyInterest);
  }

  /**
   * Calculate monthly interest payment
   */
  function calculateMonthlyInterest(_monthlyPayment: number): number {
    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    return inputs.loan * monthlyInterestRate;
  }

  /**
   * Calculate principal percentage of payment
   */
  function calculatePrincipalPercentage(monthlyPayment: number): number {
    if (monthlyPayment === 0) return 0;
    const principal = calculateMonthlyPrincipal(monthlyPayment);
    return (principal / monthlyPayment) * 100;
  }

  /**
   * Calculate term from payment (reverse calculation)
   */
  function calculateTermFromPayment(monthlyPayment: number): number {
    const monthlyRate = inputs.interestRate / 100 / 12;

    if (monthlyRate === 0) {
      return Math.ceil(inputs.loan / monthlyPayment);
    }

    if (monthlyPayment <= inputs.loan * monthlyRate) {
      return 360; // Payment too low
    }

    const numerator = Math.log(
      monthlyPayment / (monthlyPayment - inputs.loan * monthlyRate),
    );
    const denominator = Math.log(1 + monthlyRate);
    const termInMonths = numerator / denominator;

    return Math.min(480, Math.max(12, Math.ceil(termInMonths)));
  }

  /**
   * Calculate principal rate from payment (German mortgage style)
   */
  function calculatePrincipalRateFromPayment(monthlyPayment: number): number {
    const annualPayment = monthlyPayment * 12;
    const annualInterest = inputs.loan * (inputs.interestRate / 100);
    const annualPrincipal = annualPayment - annualInterest;

    return Math.max(0, (annualPrincipal / inputs.loan) * 100);
  }

  /**
   * Analyze Sondertilgung impact (async)
   */

  // Computed presentation model
  const presentation = computed<MortgagePresentationModel>(() => {
    return calculatePresentationModel();
  });

  // Quick estimation (for immediate UI feedback)
  const quickEstimate = computed(() => {
    if (inputs.termMonths) {
      return getQuickEstimate(
        inputs.loan,
        inputs.interestRate,
        inputs.termMonths / 12,
      );
    }
    return null;
  });

  /**
   * Format currency for German locale
   */
  function formatEuros(amount: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  /**
   * Format percentage for German locale
   */
  function formatPercentage(percentage: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(percentage / 100);
  }

  /**
   * Update monthly payment (maintains existing UI behavior)
   */
  function setMonthlyPayment(newMonthlyPayment: number) {
    inputs.monthlyPayment = newMonthlyPayment;

    // Auto-calculate term if not locked (matching existing behavior)
    if (newMonthlyPayment > 0) {
      inputs.termMonths = calculateTermFromPayment(newMonthlyPayment);
      inputs.principalRate =
        calculatePrincipalRateFromPayment(newMonthlyPayment);
    }
  }

  /**
   * Update term in months (maintains existing UI behavior)
   */
  function setTermMonths(newTermMonths: number) {
    inputs.termMonths = newTermMonths;

    // Auto-calculate payment if not locked
    const quick = getQuickEstimate(
      inputs.loan,
      inputs.interestRate,
      newTermMonths / 12,
    );
    inputs.monthlyPayment = quick.monthlyPayment;
  }

  /**
   * Analyze Sondertilgung impact (async)
   */
  async function analyzeSondertilgungImpact() {
    if (Object.keys(extraPayments.value).length === 0) {
      return null;
    }

    const baseLoan: LoanScenarioInput = {
      loanAmount: inputs.loan,
      interestRate: inputs.interestRate,
      termMonths: inputs.termMonths || 360,
    };

    const extraPaymentsArray = Object.entries(extraPayments.value).map(
      ([month, amount]) => ({
        month: Number(month),
        amount,
      }),
    );

    const result = await analyzeSondertilgung(baseLoan, extraPaymentsArray);

    if (result.success) {
      return {
        totalInterestSaved: result.data.impact.totalInterestSaved,
        termReductionMonths: result.data.impact.termReductionMonths,
        newTermMonths: result.data.withExtraPayments.totals.termInMonths,
        monthlyPayment: result.data.withExtraPayments.monthlyPayment.total,
        totalSavings: result.data.impact.totalInterestSaved,
      };
    }

    console.error("Sondertilgung analysis failed:", result.error);
    return null;
  }

  /**
   * Get domain analysis (for detailed calculations)
   */
  async function getDomainAnalysis(): Promise<LoanAnalysis | null> {
    const termInput: LoanScenarioInput = {
      loanAmount: inputs.loan,
      interestRate: inputs.interestRate,
      termMonths: inputs.termMonths || 360,
    };

    const result = await analyzeLoan(termInput);

    if (result.success) {
      return result.data;
    }

    console.error("Domain analysis failed:", result.error);
    return null;
  }

  // Return API
  return {
    // Reactive state
    inputs,
    extraPayments,
    sondertilgungMaxPercent,

    // Computed properties
    presentation,
    quickEstimate,

    // Methods
    setMonthlyPayment,
    setTermMonths,
    analyzeSondertilgungImpact,
    getDomainAnalysis,
    formatEuros,
    formatPercentage,
  };
}
