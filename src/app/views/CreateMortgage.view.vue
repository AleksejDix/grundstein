<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8">
        <RouterLink
          :to="routes.overview()"
          class="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Overview
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Mortgage</h1>
        <p class="text-lg text-gray-600">
          Enter your mortgage details to calculate payments and see amortization schedule
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="calculateMortgage" class="space-y-6">
          <!-- Loan Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount (€)
            </label>
            <input
              v-model.number="mortgageForm.amount"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="300000"
              required
            />
          </div>

          <!-- Interest Rate -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              v-model.number="mortgageForm.interestRate"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3.5"
              required
            />
          </div>

          <!-- Term -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (Years)
            </label>
            <input
              v-model.number="mortgageForm.termYears"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
              required
            />
          </div>

          <!-- Market -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Market
            </label>
            <select
              v-model="mortgageForm.market"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="DE">Germany (DE)</option>
              <option value="CH">Switzerland (CH)</option>
            </select>
          </div>

          <!-- Bank -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Bank/Lender
            </label>
            <input
              v-model="mortgageForm.bank"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deutsche Bank"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Calculate Mortgage
          </button>
        </form>

        <!-- Results -->
        <div v-if="results" class="mt-8 pt-8 border-t border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Results</h2>
          
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Monthly Payment:</span>
              <span class="font-medium">€{{ results.monthlyPayment }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Interest:</span>
              <span class="font-medium">€{{ results.totalInterest }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Amount:</span>
              <span class="font-medium">€{{ results.totalAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { routes } from "../../router/routes";

// Form state
const mortgageForm = ref({
  amount: 300000,
  interestRate: 3.5,
  termYears: 30,
  market: "DE" as "DE" | "CH",
  bank: "",
});

// Results
const results = ref<{
  monthlyPayment: string;
  totalInterest: string;
  totalAmount: string;
} | null>(null);

// Calculate mortgage
function calculateMortgage() {
  const principal = mortgageForm.value.amount;
  const monthlyRate = mortgageForm.value.interestRate / 100 / 12;
  const totalMonths = mortgageForm.value.termYears * 12;

  // Monthly payment calculation
  const monthlyPayment = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const totalAmount = monthlyPayment * totalMonths;
  const totalInterest = totalAmount - principal;

  results.value = {
    monthlyPayment: monthlyPayment.toFixed(2),
    totalInterest: totalInterest.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}
</script>