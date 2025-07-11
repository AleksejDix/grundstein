/**
 * Mortgage Store
 *
 * Manages available mortgages in the application using Pinia.
 * Provides demo mortgages for navigation and state management.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export type MortgageListItem = {
  id: string;
  displayName: string;
  description: string;
  propertyType: "Wohnung" | "Haus" | "Gewerbe";
  location: string;
  loanAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  startDate: Date;
  status: "active" | "completed" | "delinquent";
};

export const useMortgageStore = defineStore("mortgage", () => {
  // State
  const mortgages = ref<MortgageListItem[]>([
    {
      id: "demo-berlin-apartment",
      displayName: "Berlin Mitte Wohnung",
      description: "Eigentumswohnung in Berlin Mitte • 50m²",
      propertyType: "Wohnung",
      location: "Berlin Mitte",
      loanAmount: 50000,
      currentBalance: 32635,
      monthlyPayment: 375,
      startDate: new Date(2021, 4, 1), // May 1, 2021
      status: "active",
    },
    {
      id: "demo-munich-house",
      displayName: "München Schwabing Haus",
      description: "Reihenhaus in München Schwabing • 120m²",
      propertyType: "Haus",
      location: "München Schwabing",
      loanAmount: 450000,
      currentBalance: 398750,
      monthlyPayment: 1650,
      startDate: new Date(2020, 2, 15), // March 15, 2020
      status: "active",
    },
    {
      id: "demo-hamburg-condo",
      displayName: "Hamburg Hafencity Wohnung",
      description: "Luxuswohnung in Hamburg Hafencity • 85m²",
      propertyType: "Wohnung",
      location: "Hamburg Hafencity",
      loanAmount: 320000,
      currentBalance: 298500,
      monthlyPayment: 1125,
      startDate: new Date(2022, 8, 1), // September 1, 2022
      status: "active",
    },
    {
      id: "demo-cologne-completed",
      displayName: "Köln Ehrenfeld Wohnung",
      description: "Kleine Wohnung in Köln Ehrenfeld • 38m²",
      propertyType: "Wohnung",
      location: "Köln Ehrenfeld",
      loanAmount: 125000,
      currentBalance: 0,
      monthlyPayment: 0,
      startDate: new Date(2015, 0, 1), // January 1, 2015
      status: "completed",
    },
  ]);

  const selectedMortgageId = ref<string | null>(null);

  // Getters
  const activeMortgages = computed(() =>
    mortgages.value.filter((m) => m.status === "active")
  );

  const completedMortgages = computed(() =>
    mortgages.value.filter((m) => m.status === "completed")
  );

  const totalActiveMortgages = computed(() => activeMortgages.value.length);

  const totalActiveBalance = computed(() =>
    activeMortgages.value.reduce((sum, m) => sum + m.currentBalance, 0)
  );

  const totalMonthlyPayments = computed(() =>
    activeMortgages.value.reduce((sum, m) => sum + m.monthlyPayment, 0)
  );

  const selectedMortgage = computed(() =>
    selectedMortgageId.value
      ? mortgages.value.find((m) => m.id === selectedMortgageId.value)
      : null
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
    if (mortgage.status === "completed") return 100;
    return Math.round(
      ((mortgage.loanAmount - mortgage.currentBalance) / mortgage.loanAmount) *
        100
    );
  }

  function getMortgageStatusColor(status: MortgageListItem["status"]): string {
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

  function getMortgageStatusLabel(status: MortgageListItem["status"]): string {
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
  };
});
