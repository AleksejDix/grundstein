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

import { ref, computed, reactive, watch } from "vue";
import {
  MortgageService,
  type LoanScenarioInput,
  type LoanAnalysis,
} from "../../application/services/MortgageService";

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
 * Mortgage Presentation Adapter Class
 */
export class MortgageAdapter {
  private mortgageService = new MortgageService();

  // Reactive state
  public readonly inputs = reactive<MortgageUIInputs>({
    loan: 100000,
    interestRate: 5.6,
    principalRate: 2,
    monthlyPayment: undefined,
    termMonths: undefined,
    startDate: "2023-01-01",
  });

  public readonly extraPayments = ref<ExtraPaymentsModel>({
    2: 17000, // €5,000 extra payment in February 2023
  });
  public readonly sondertilgungMaxPercent = ref(5);

  // Computed presentation model
  public readonly presentation = computed<MortgagePresentationModel>(() => {
    return this.calculatePresentationModel();
  });

  // Quick estimation (for immediate UI feedback)
  public readonly quickEstimate = computed(() => {
    if (this.inputs.termMonths) {
      return this.mortgageService.getQuickEstimate(
        this.inputs.loan,
        this.inputs.interestRate,
        this.inputs.termMonths / 12
      );
    }
    return null;
  });

  /**
   * Calculate the complete presentation model from current inputs
   */
  private calculatePresentationModel(): MortgagePresentationModel {
    try {
      // Determine term specification
      let termInput: LoanScenarioInput;

      if (this.inputs.termMonths) {
        termInput = {
          loanAmount: this.inputs.loan,
          interestRate: this.inputs.interestRate,
          termMonths: this.inputs.termMonths,
          monthlyPayment: this.inputs.monthlyPayment,
        };
      } else {
        // Calculate term from principal rate (German style)
        const estimatedTermYears = this.estimateTermFromPrincipalRate();
        termInput = {
          loanAmount: this.inputs.loan,
          interestRate: this.inputs.interestRate,
          termYears: estimatedTermYears,
          monthlyPayment: this.inputs.monthlyPayment,
        };
      }

      // Get domain analysis (this is now asynchronous, but we'll handle it)
      // For immediate UI feedback, we'll use the quick estimate
      const quick = this.mortgageService.getQuickEstimate(
        this.inputs.loan,
        this.inputs.interestRate,
        (this.inputs.termMonths || 360) / 12
      );

      return {
        monthlyPayment: quick.monthlyPayment,
        termMonths: this.inputs.termMonths || 360,
        termYears: (this.inputs.termMonths || 360) / 12,

        // Calculate breakdown (simplified for now)
        monthlyPrincipal: this.calculateMonthlyPrincipal(quick.monthlyPayment),
        monthlyInterest: this.calculateMonthlyInterest(quick.monthlyPayment),
        principalPercentage: this.calculatePrincipalPercentage(
          quick.monthlyPayment
        ),

        totalInterestPaid: quick.totalInterest,
        totalAmountPaid: quick.totalPaid,

        // First year estimates
        firstYearPayments: quick.monthlyPayment * 12,
        firstYearInterest:
          this.calculateMonthlyInterest(quick.monthlyPayment) * 12,
        firstYearPrincipal:
          this.calculateMonthlyPrincipal(quick.monthlyPayment) * 12,
        firstYearEndBalance:
          this.inputs.loan -
          this.calculateMonthlyPrincipal(quick.monthlyPayment) * 12,

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
  private estimateTermFromPrincipalRate(): number {
    // This is a simplified estimation - German mortgages often specify
    // an annual principal repayment rate
    const annualPrincipalAmount =
      this.inputs.loan * (this.inputs.principalRate / 100);
    const estimatedYears = Math.min(
      40,
      Math.max(5, this.inputs.loan / annualPrincipalAmount)
    );
    return Math.round(estimatedYears);
  }

  /**
   * Calculate monthly principal payment
   */
  private calculateMonthlyPrincipal(monthlyPayment: number): number {
    const monthlyInterestRate = this.inputs.interestRate / 100 / 12;
    const monthlyInterest = this.inputs.loan * monthlyInterestRate;
    return Math.max(0, monthlyPayment - monthlyInterest);
  }

  /**
   * Calculate monthly interest payment
   */
  private calculateMonthlyInterest(monthlyPayment: number): number {
    const monthlyInterestRate = this.inputs.interestRate / 100 / 12;
    return this.inputs.loan * monthlyInterestRate;
  }

  /**
   * Calculate principal percentage of payment
   */
  private calculatePrincipalPercentage(monthlyPayment: number): number {
    if (monthlyPayment === 0) return 0;
    const principal = this.calculateMonthlyPrincipal(monthlyPayment);
    return (principal / monthlyPayment) * 100;
  }

  /**
   * Update monthly payment (maintains existing UI behavior)
   */
  public setMonthlyPayment(newMonthlyPayment: number) {
    this.inputs.monthlyPayment = newMonthlyPayment;

    // Auto-calculate term if not locked (matching existing behavior)
    if (newMonthlyPayment > 0) {
      this.inputs.termMonths = this.calculateTermFromPayment(newMonthlyPayment);
      this.inputs.principalRate =
        this.calculatePrincipalRateFromPayment(newMonthlyPayment);
    }
  }

  /**
   * Update term in months (maintains existing UI behavior)
   */
  public setTermMonths(newTermMonths: number) {
    this.inputs.termMonths = newTermMonths;

    // Auto-calculate payment if not locked
    const quick = this.mortgageService.getQuickEstimate(
      this.inputs.loan,
      this.inputs.interestRate,
      newTermMonths / 12
    );
    this.inputs.monthlyPayment = quick.monthlyPayment;
  }

  /**
   * Calculate term from payment (reverse calculation)
   */
  private calculateTermFromPayment(monthlyPayment: number): number {
    const monthlyRate = this.inputs.interestRate / 100 / 12;

    if (monthlyRate === 0) {
      return Math.ceil(this.inputs.loan / monthlyPayment);
    }

    if (monthlyPayment <= this.inputs.loan * monthlyRate) {
      return 360; // Payment too low
    }

    const numerator = Math.log(
      monthlyPayment / (monthlyPayment - this.inputs.loan * monthlyRate)
    );
    const denominator = Math.log(1 + monthlyRate);
    const termInMonths = numerator / denominator;

    return Math.min(480, Math.max(12, Math.ceil(termInMonths)));
  }

  /**
   * Calculate principal rate from payment (German mortgage style)
   */
  private calculatePrincipalRateFromPayment(monthlyPayment: number): number {
    const annualPayment = monthlyPayment * 12;
    const annualInterest = this.inputs.loan * (this.inputs.interestRate / 100);
    const annualPrincipal = annualPayment - annualInterest;

    return Math.max(0, (annualPrincipal / this.inputs.loan) * 100);
  }

  /**
   * Analyze Sondertilgung impact (async)
   */
  public async analyzeSondertilgung() {
    if (Object.keys(this.extraPayments.value).length === 0) {
      return null;
    }

    const baseLoan: LoanScenarioInput = {
      loanAmount: this.inputs.loan,
      interestRate: this.inputs.interestRate,
      termMonths: this.inputs.termMonths || 360,
    };

    const extraPaymentsArray = Object.entries(this.extraPayments.value).map(
      ([month, amount]) => ({
        month: Number(month),
        amount,
      })
    );

    const result = await this.mortgageService.analyzeSondertilgung(
      baseLoan,
      extraPaymentsArray
    );

    if (result.success) {
      return {
        totalInterestSaved: result.data.impact.totalInterestSaved,
        termReductionMonths: result.data.impact.termReductionMonths,
        totalExtraPayments: result.data.impact.totalExtraPayments,
        effectiveReturnRate: result.data.impact.effectiveReturnRate,
        isWorthwhile: result.data.impact.isWorthwhile,
      };
    }

    return null;
  }

  /**
   * Get domain analysis (for detailed calculations)
   */
  public async getDomainAnalysis(): Promise<LoanAnalysis | null> {
    const termInput: LoanScenarioInput = {
      loanAmount: this.inputs.loan,
      interestRate: this.inputs.interestRate,
      termMonths: this.inputs.termMonths || 360,
    };

    const result = await this.mortgageService.analyzeLoan(termInput);

    if (result.success) {
      return result.data;
    }

    console.error("Domain analysis failed:", result.error);
    return null;
  }

  /**
   * Format currency for German locale
   */
  public formatEuros(amount: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }

  /**
   * Format percentage for German locale
   */
  public formatPercentage(percentage: number): string {
    return new Intl.NumberFormat("de-DE", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(percentage / 100);
  }
}

/**
 * Create and export a singleton adapter instance
 */
export const mortgageAdapter = new MortgageAdapter();
