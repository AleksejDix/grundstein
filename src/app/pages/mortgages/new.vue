<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8">
        <RouterLink
          to="/"
          class="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Mortgages
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create New Mortgage</h1>
        <p class="text-lg text-gray-600">
          Enter your mortgage details to add it to your portfolio
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="createMortgage" class="space-y-6">
          <!-- Display Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              v-model="mortgageForm.displayName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Berlin Apartment"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              v-model="mortgageForm.description"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Eigentumswohnung in Berlin Mitte • 50m²"
              required
            />
          </div>

          <!-- Property Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              v-model="mortgageForm.propertyType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Wohnung">Wohnung</option>
              <option value="Haus">Haus</option>
              <option value="Gewerbe">Gewerbe</option>
            </select>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              v-model="mortgageForm.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Berlin Mitte"
              required
            />
          </div>

          <!-- Loan Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Loan Amount (€)
            </label>
            <input
              v-model.number="mortgageForm.loanAmount"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
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
              placeholder="0.8"
              required
            />
          </div>

          <!-- Monthly Payment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Monthly Payment (€)
            </label>
            <input
              v-model.number="mortgageForm.monthlyPayment"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="375"
              required
            />
          </div>

          <!-- Loan Term -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (Years)
            </label>
            <input
              v-model.number="mortgageForm.loanTermYears"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
              required
            />
          </div>

          <!-- Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              v-model="mortgageForm.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Mortgage
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMortgageStore } from "../../stores/mortgageStore";

const router = useRouter();
const mortgageStore = useMortgageStore();

// Form state
const mortgageForm = ref({
  displayName: "",
  description: "",
  propertyType: "Wohnung" as "Wohnung" | "Haus" | "Gewerbe",
  location: "",
  loanAmount: 50000,
  interestRate: 0.8,
  monthlyPayment: 375,
  loanTermYears: 30,
  startDate: "2021-05-01",
});

// Create mortgage
function createMortgage() {
  const id = mortgageStore.addMortgage({
    displayName: mortgageForm.value.displayName,
    description: mortgageForm.value.description,
    propertyType: mortgageForm.value.propertyType,
    location: mortgageForm.value.location,
    loanAmount: mortgageForm.value.loanAmount,
    interestRate: mortgageForm.value.interestRate,
    monthlyPayment: mortgageForm.value.monthlyPayment,
    loanTermYears: mortgageForm.value.loanTermYears,
    startDate: new Date(mortgageForm.value.startDate),
    sondertilgungen: [],
  });
  
  // Navigate to the new mortgage detail page
  router.push(`/mortgages/${id}`);
}
</script>