/**
 * Mortgage Store
 *
 * Manages available mortgages in the application using Pinia.
 * Provides demo mortgages for navigation and state management.
 */

import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  createLoanConfiguration,
  createLoanAmount,
  createInterestRate,
  createYearCount,
  yearCountToMonths,
  createMonthCount,
  createMoney,
  type LoanConfiguration,
  calculateMonthlyPayment,
  formatInterestRate as domainFormatInterestRate,
} from "../../core/domain";

export type SondertilgungEntry = {
  date: Date;
  amount: number;
  description?: string;
};

export type MortgageListItem = {
  id: string;
  displayName: string;
  description: string;
  propertyType: "Wohnung" | "Haus" | "Gewerbe";
  location: string;
  loanAmount: number;
  interestRate: number; // Annual interest rate as percentage
  monthlyPayment: number;
  startDate: Date;
  loanTermYears: number;
  sondertilgungen: SondertilgungEntry[];
};

export const useMortgageStore = defineStore(
  "mortgage",
  () => {
    // State
    const mortgages = ref<MortgageListItem[]>([
      {
        id: "felsenkellweg33d",
        displayName: "Felsenkellweg 33",
        description: "Eigentumswohnung in Hameln • 88m²",
        propertyType: "Wohnung",
        location: "Hameln",
        loanAmount: 50000,
        interestRate: 0.8,
        monthlyPayment: 375,
        startDate: new Date(2021, 4, 1), // May 1, 2021
        loanTermYears: 30,
        sondertilgungen: [
          {
            date: new Date(2021, 11, 31), // December 31, 2021
            amount: 2500,
            description: "Jahresende Sondertilgung",
          },
        ],
      },
    ]);

    const selectedMortgageId = ref<string | null>(null);

    // Helper functions
    function getTotalSondertilgungen(mortgage: MortgageListItem): number {
      return mortgage.sondertilgungen.reduce(
        (sum, entry) => sum + entry.amount,
        0,
      );
    }

    // Convert store data to domain types
    function createLoanConfigurationFromMortgage(mortgage: MortgageListItem): LoanConfiguration | null {
      const loanAmountResult = createLoanAmount(mortgage.loanAmount);
      const interestRateResult = createInterestRate(mortgage.interestRate);
      const termResult = createYearCount(mortgage.loanTermYears);
      const monthlyPaymentResult = createMoney(mortgage.monthlyPayment);
      
      if (!loanAmountResult.success || !interestRateResult.success || !termResult.success || !monthlyPaymentResult.success) {
        return null;
      }
      
      const termInMonths = yearCountToMonths(termResult.data);
      const termInMonthsResult = createMonthCount(termInMonths);
      if (!termInMonthsResult.success) {
        return null;
      }
      
      const configResult = createLoanConfiguration(
        loanAmountResult.data,
        interestRateResult.data,
        termInMonthsResult.data,
        monthlyPaymentResult.data
      );
      
      return configResult.success ? configResult.data : null;
    }

    // Calculate correct monthly payment using domain functions
    function calculateCorrectMonthlyPayment(mortgage: MortgageListItem): number {
      const config = createLoanConfigurationFromMortgage(mortgage);
      if (!config) return mortgage.monthlyPayment;
      
      const paymentResult = calculateMonthlyPayment(config);
      if (paymentResult.success) {
        return paymentResult.data.principal + paymentResult.data.interest;
      }
      
      return mortgage.monthlyPayment;
    }

    // Calculated values using domain layer
    function calculateCurrentBalance(mortgage: MortgageListItem): number {
      const config = createLoanConfigurationFromMortgage(mortgage);
      if (!config) return mortgage.loanAmount;
      
      // For now, use simple elapsed time calculation
      // TODO: Use proper amortization schedule from domain
      const monthsElapsed = Math.floor(
        (new Date().getTime() - mortgage.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );
      
      const regularPayments = Math.min(monthsElapsed, mortgage.loanTermYears * 12) * mortgage.monthlyPayment;
      const totalSondertilgungen = getTotalSondertilgungen(mortgage);
      const totalPaid = regularPayments + totalSondertilgungen;
      
      return Math.max(0, mortgage.loanAmount - totalPaid);
    }

    function calculateStatus(mortgage: MortgageListItem): "active" | "completed" | "delinquent" {
      const currentBalance = calculateCurrentBalance(mortgage);
      return currentBalance <= 0 ? "completed" : "active";
    }

    // Getters
    const activeMortgages = computed(() =>
      mortgages.value.filter((m) => calculateStatus(m) === "active"),
    );

    const completedMortgages = computed(() =>
      mortgages.value.filter((m) => calculateStatus(m) === "completed"),
    );

    const totalActiveMortgages = computed(() => activeMortgages.value.length);

    const totalActiveBalance = computed(() =>
      activeMortgages.value.reduce((sum, m) => sum + calculateCurrentBalance(m), 0),
    );

    const totalMonthlyPayments = computed(() =>
      activeMortgages.value.reduce((sum, m) => sum + m.monthlyPayment, 0),
    );

    const selectedMortgage = computed(() =>
      selectedMortgageId.value
        ? mortgages.value.find((m) => m.id === selectedMortgageId.value)
        : null,
    );

    // Actions
    function getMortgageById(id: string): MortgageListItem | undefined {
      return mortgages.value.find((m) => m.id === id);
    }

    function setSelectedMortgage(id: string | null) {
      selectedMortgageId.value = id;
    }

    function addMortgage(mortgage: Omit<MortgageListItem, "id">) {
      const id = `mortgage-${Date.now()}`;
      mortgages.value.push({
        ...mortgage,
        id,
      });
      return id;
    }

    function updateMortgage(id: string, updates: Partial<MortgageListItem>) {
      const index = mortgages.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        mortgages.value[index] = { ...mortgages.value[index], ...updates };
      }
    }

    function deleteMortgage(id: string) {
      const index = mortgages.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        mortgages.value.splice(index, 1);
        if (selectedMortgageId.value === id) {
          selectedMortgageId.value = null;
        }
      }
    }

    // Utility functions
    function formatCurrency(amount: number): string {
      return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    }

    function getMortgageProgress(mortgage: MortgageListItem): number {
      const currentBalance = calculateCurrentBalance(mortgage);
      if (currentBalance <= 0) return 100;
      return Math.round(
        ((mortgage.loanAmount - currentBalance) / mortgage.loanAmount) * 100,
      );
    }

    function getMortgageStatusColor(mortgage: MortgageListItem): string {
      const status = calculateStatus(mortgage);
      switch (status) {
        case "active":
          return "text-green-600";
        case "completed":
          return "text-blue-600";
        case "delinquent":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    }

    function getMortgageStatusLabel(mortgage: MortgageListItem): string {
      const status = calculateStatus(mortgage);
      switch (status) {
        case "active":
          return "Aktiv";
        case "completed":
          return "Abbezahlt";
        case "delinquent":
          return "Rückständig";
        default:
          return "Unbekannt";
      }
    }

    // Sondertilgung functions
    function addSondertilgung(
      mortgageId: string,
      entry: Omit<SondertilgungEntry, "date"> & { date: Date },
    ) {
      const mortgage = mortgages.value.find((m) => m.id === mortgageId);
      if (mortgage) {
        mortgage.sondertilgungen.push(entry);
        // Sort by date, newest first
        mortgage.sondertilgungen.sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        );
      }
    }

    function removeSondertilgung(mortgageId: string, entryIndex: number) {
      const mortgage = mortgages.value.find((m) => m.id === mortgageId);
      if (
        mortgage &&
        entryIndex >= 0 &&
        entryIndex < mortgage.sondertilgungen.length
      ) {
        mortgage.sondertilgungen.splice(entryIndex, 1);
      }
    }

    function formatInterestRate(rate: number): string {
      const interestRateResult = createInterestRate(rate);
      if (interestRateResult.success) {
        return domainFormatInterestRate(interestRateResult.data);
      }
      // Fallback for invalid rates
      return new Intl.NumberFormat("de-DE", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(rate / 100);
    }

    return {
      // State
      mortgages,
      selectedMortgageId,

      // Getters
      activeMortgages,
      completedMortgages,
      totalActiveMortgages,
      totalActiveBalance,
      totalMonthlyPayments,
      selectedMortgage,

      // Actions
      getMortgageById,
      setSelectedMortgage,
      addMortgage,
      updateMortgage,
      deleteMortgage,

      // Utilities
      formatCurrency,
      getMortgageProgress,
      getMortgageStatusColor,
      getMortgageStatusLabel,

      // Calculated values
      calculateCurrentBalance,
      calculateStatus,
      calculateCorrectMonthlyPayment,
      getTotalSondertilgungen,
      createLoanConfigurationFromMortgage,

      // Sondertilgung utilities
      addSondertilgung,
      removeSondertilgung,
      formatInterestRate,
    };
  },
  {
    persist: {
      key: "mortgage-store",
      storage: localStorage,
      pick: ["mortgages", "selectedMortgageId"],
      serializer: {
        serialize: (value: any) => {
          // Custom serializer to handle Date objects
          return JSON.stringify(value, (key, val) => {
            if (val instanceof Date) {
              return { __type: "Date", value: val.toISOString() };
            }
            return val;
          });
        },
        deserialize: (value: string) => {
          // Custom deserializer to restore Date objects
          return JSON.parse(value, (key, val) => {
            if (val && typeof val === "object" && val.__type === "Date") {
              return new Date(val.value);
            }
            return val;
          });
        },
      },
    },
  },
);
