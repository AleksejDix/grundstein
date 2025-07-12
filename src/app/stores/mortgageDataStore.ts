/**
 * Mortgage Data Store
 *
 * Raw mortgage data in plain JSON format
 * Ready for database storage - no domain types, no calculations
 */

import { defineStore } from "pinia";
import { ref } from "vue";

// Plain data structure - database ready
// This mirrors the Mortgage entity but with primitive types only
export interface MortgageData {
  id: string;
  name: string;
  propertyAddress?: string;
  bankName: string;
  configuration: {
    loanAmount: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
  };
  status: "draft" | "active" | "completed" | "refinanced";
  startDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  metadata?: {
    accountNumber?: string;
    contactPerson?: string;
    notes?: string;
  };
}

export const useMortgageDataStore = defineStore("mortgage-data", () => {
  // The data - just plain JSON
  const mortgages = ref<MortgageData[]>([]);
  const currentMortgageId = ref<string | null>(null);

  // Simple CRUD operations
  const addMortgage = (data: Omit<MortgageData, "id">) => {
    const id = `mortgage_${Date.now()}`;
    mortgages.value.push({ id, ...data });
    return id;
  };

  const updateMortgage = (
    id: string,
    data: Partial<Omit<MortgageData, "id">>,
  ) => {
    const index = mortgages.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      mortgages.value[index] = { ...mortgages.value[index], ...data };
    }
  };

  const deleteMortgage = (id: string) => {
    mortgages.value = mortgages.value.filter((m) => m.id !== id);
    if (currentMortgageId.value === id) {
      currentMortgageId.value = null;
    }
  };

  const getMortgageById = (id: string) => {
    return mortgages.value.find((m) => m.id === id);
  };

  const setCurrentMortgage = (id: string | null) => {
    currentMortgageId.value = id;
  };

  return {
    // Data
    mortgages,
    currentMortgageId,

    // Actions
    addMortgage,
    updateMortgage,
    deleteMortgage,
    getMortgageById,
    setCurrentMortgage,
  };
});
