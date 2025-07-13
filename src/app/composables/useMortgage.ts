/**
 * useMortgage - Vue Composable for Mortgage Calculations
 *
 * This composable bridges our robust domain-driven calculations with the
 * Vue.js UI. It provides reactive state management and parameter locking
 * functionality for the mortgage calculator.
 *
 * Key responsibilities:
 * - Transform UI inputs to domain service calls
 * - Transform domain results to UI presentation models
 * - Handle errors gracefully with user-friendly messages
 * - Maintain reactive behavior for Vue components
 * - Support parameter locking for reverse calculations
 */

import { ref, computed, reactive } from "vue";
import {
  analyzeLoan,
  analyzeSondertilgung,
  getQuickEstimate,
  type LoanScenarioInput,
  type LoanAnalysis,
} from "../services/application/services/MortgageService";
import {
  calculateLoanTerm,
  calculateInterestRate,
  createLoanAmount,
  createInterestRate,
  createMonthCount,
  createMoney,
  monthCountToNumber,
  interestRateToNumber,
} from "../../core/domain";

/**
 * Parameter locking state
 */
export type ParameterLocks = {
  loanAmount: boolean;
  interestRate: boolean;
  termMonths: boolean;
  monthlyPayment: boolean;
};

/**
 * UI State Model (matches current Mortgage.view.vue interface)
 */
export type MortgageUIInputs = {
  loan: number;
  interestRate: number;
  principalRate: number;
  monthlyPayment: number;
  termMonths: number;
  startDate: string;
};

/**
 * UI Presentation Model for calculated results
 */
export type MortgagePresentationModel = {
  // Basic loan info
  loanAmount: number;
  monthlyPayment: number;
  termMonths: number;
  termYears: number;
  interestRate: number;

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

  // Balance information
  remainingBalance: number;
  paydownPercentage: number;

  // Status
  isValid: boolean;
  errorMessage?: string;
};

/**
 * Extra payments model for Sondertilgung
 */
export type ExtraPaymentsModel = Record<number, number>;

/**
 * useMortgage - Vue Composable for Mortgage Calculations
 */
export function useMortgage() {
  // Reactive state
  const inputs = reactive<MortgageUIInputs>({
    loan: 50000, // Updated default per user request
    interestRate: 0.8, // Updated default per user request
    principalRate: 2,
    monthlyPayment: 375, // Updated default per user request (rounded)
    termMonths: 140, // Updated default per user request
    startDate: "2023-01-01",
  });

  // Parameter locking state for enhanced functionality
  const locks = reactive<ParameterLocks>({
    loanAmount: false, // Will map to inputs.loan
    interestRate: false,
    termMonths: false,
    monthlyPayment: true, // Start with payment locked
  });

  // Error state
  const errors = ref({
    loanAmount: "",
    interestRate: "",
    termMonths: "",
    monthlyPayment: "",
  });

  // Track last changed parameter to avoid calculation loops
  const lastChanged = ref<string | null>(null);

  const extraPayments = ref<ExtraPaymentsModel>({
    2: 5000, // €5,000 extra payment in February 2023
  });
  const sondertilgungMaxPercent = ref(5);

  /**
   * Perform reverse calculations when parameters are locked
   * Uses ONLY core domain functions - no business logic in UI
   */
  async function handleParameterChange(changedParam: string) {
    lastChanged.value = changedParam;
    
    if (inputs.monthlyPayment <= 0 || inputs.termMonths <= 0 || inputs.loan <= 0 || inputs.interestRate < 0) {
      return; // Need valid values for reverse calculations
    }

    try {
      // Create domain types for validation
      const loanAmountResult = createLoanAmount(inputs.loan);
      const interestRateResult = createInterestRate(inputs.interestRate);
      const termResult = createMonthCount(inputs.termMonths);
      const paymentResult = createMoney(inputs.monthlyPayment);

      if (!loanAmountResult.success || !interestRateResult.success || 
          !termResult.success || !paymentResult.success) {
        return; // Invalid inputs
      }

      // Determine what to calculate based on locks
      if (!locks.termMonths && changedParam !== 'termMonths') {
        // Calculate term using domain function
        const termCalculationResult = calculateLoanTerm(
          loanAmountResult.data,
          interestRateResult.data,
          paymentResult.data
        );
        if (termCalculationResult.success) {
          inputs.termMonths = Math.round(monthCountToNumber(termCalculationResult.data));
        }
      } else if (!locks.interestRate && changedParam !== 'interestRate') {
        // Calculate interest rate using domain function
        const rateResult = calculateInterestRate(
          loanAmountResult.data,
          paymentResult.data,
          termResult.data
        );
        if (rateResult.success) {
          inputs.interestRate = Math.round(interestRateToNumber(rateResult.data) * 100) / 100;
        }
      } else if (!locks.loanAmount && changedParam !== 'loan') {
        // Calculate loan amount using reverse calculation
        const monthlyRate = inputs.interestRate / 100 / 12;
        const termMonths = inputs.termMonths;
        const payment = inputs.monthlyPayment;

        let calculatedAmount: number;
        if (monthlyRate === 0) {
          calculatedAmount = payment * termMonths;
        } else {
          const factor = Math.pow(1 + monthlyRate, termMonths);
          calculatedAmount = payment * (factor - 1) / (monthlyRate * factor);
        }
        inputs.loan = Math.round(calculatedAmount);
      }
    } catch (error) {
      console.error('Reverse calculation error:', error);
    }
  }

  /**
   * Recalculate based on changed parameter
   */
  function recalculate(changedParam: string) {
    handleParameterChange(changedParam);
  }

  // Helper function to calculate presentation model
  function calculatePresentationModel(): MortgagePresentationModel {
    try {
      // Get domain analysis (for immediate UI feedback, we'll use the quick estimate)
      const quick = getQuickEstimate(
        inputs.loan,
        inputs.interestRate,
        inputs.termMonths / 12,
      );

      const monthlyInterest = calculateMonthlyInterest(quick.monthlyPayment);
      const monthlyPrincipal = calculateMonthlyPrincipal(quick.monthlyPayment);

      return {
        loanAmount: inputs.loan,
        monthlyPayment: quick.monthlyPayment,
        termMonths: inputs.termMonths,
        termYears: inputs.termMonths / 12,
        interestRate: inputs.interestRate,

        // Calculate breakdown
        monthlyPrincipal,
        monthlyInterest,
        principalPercentage: calculatePrincipalPercentage(quick.monthlyPayment),

        totalInterestPaid: quick.totalInterest,
        totalAmountPaid: quick.totalPaid,

        // First year estimates
        firstYearPayments: quick.monthlyPayment * 12,
        firstYearInterest: monthlyInterest * 12,
        firstYearPrincipal: monthlyPrincipal * 12,
        firstYearEndBalance: inputs.loan - monthlyPrincipal * 12,

        // Balance information
        remainingBalance: inputs.loan - monthlyPrincipal * 12,
        paydownPercentage: (monthlyPrincipal * 12 / inputs.loan) * 100,

        isValid: true,
      };
    } catch (error) {
      return {
        loanAmount: inputs.loan,
        monthlyPayment: 0,
        termMonths: 360,
        termYears: 30,
        interestRate: inputs.interestRate,
        monthlyPrincipal: 0,
        monthlyInterest: 0,
        principalPercentage: 0,
        totalInterestPaid: 0,
        totalAmountPaid: 0,
        firstYearPayments: 0,
        firstYearInterest: 0,
        firstYearPrincipal: 0,
        firstYearEndBalance: 0,
        remainingBalance: 0,
        paydownPercentage: 0,
        isValid: false,
        errorMessage: "Calculation error: " + String(error),
      };
    }
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

  // Computed presentation model
  const presentation = computed<MortgagePresentationModel>(() => {
    return calculatePresentationModel();
  });

  // Quick estimation (for immediate UI feedback)
  const quickEstimate = computed(() => {
    if (inputs.termMonths > 0) {
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
      termMonths: inputs.termMonths,
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
      termMonths: inputs.termMonths,
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
    errors,

    // Parameter locking functionality
    locks,

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
    handleParameterChange,
    recalculate,
  };
}