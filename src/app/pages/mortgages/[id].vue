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
        
        <div v-if="mortgage">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ mortgage.displayName }}</h1>
          <p class="text-lg text-gray-600">{{ mortgage.description }}</p>
        </div>
        <div v-else>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgage Not Found</h1>
          <p class="text-lg text-gray-600">The requested mortgage could not be found.</p>
        </div>
      </div>

      <div v-if="mortgage" class="grid gap-6 lg:grid-cols-2">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Loan Details</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Loan Amount:</span>
              <span class="font-medium">{{ mortgageStore.formatCurrency(mortgage.loanAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Interest Rate:</span>
              <span class="font-medium">{{ mortgageStore.formatInterestRate(mortgage.interestRate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Loan Term:</span>
              <span class="font-medium">{{ mortgage.loanTermYears }} years</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Monthly Payment:</span>
              <span class="font-medium">{{ mortgageStore.formatCurrency(mortgage.monthlyPayment) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Start Date:</span>
              <span class="font-medium">{{ mortgage.startDate.toLocaleDateString('de-DE') }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Current Balance:</span>
              <span class="font-medium">{{ mortgageStore.formatCurrency(mortgageStore.calculateCurrentBalance(mortgage)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span :class="mortgageStore.getMortgageStatusColor(mortgage)">
                {{ mortgageStore.getMortgageStatusLabel(mortgage) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
          
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-500 mb-2">
              <span>Loan Progress</span>
              <span>{{ mortgageStore.getMortgageProgress(mortgage) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-blue-600 h-3 rounded-full transition-all duration-300"
                :style="{ width: `${mortgageStore.getMortgageProgress(mortgage)}%` }"
              ></div>
            </div>
          </div>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Amount Paid:</span>
              <span class="font-medium">
                {{ mortgageStore.formatCurrency(mortgage.loanAmount - mortgageStore.calculateCurrentBalance(mortgage)) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Remaining:</span>
              <span class="font-medium">
                {{ mortgageStore.formatCurrency(mortgageStore.calculateCurrentBalance(mortgage)) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Sondertilgungen:</span>
              <span class="font-medium">
                {{ mortgageStore.formatCurrency(mortgageStore.getTotalSondertilgungen(mortgage)) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sondertilgungen -->
        <div v-if="mortgage.sondertilgungen.length > 0" class="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Sondertilgungen</h2>
          
          <div class="space-y-3">
            <div 
              v-for="(payment, index) in mortgage.sondertilgungen" 
              :key="index"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div class="font-medium">{{ mortgageStore.formatCurrency(payment.amount) }}</div>
                <div class="text-sm text-gray-600">{{ payment.date.toLocaleDateString('de-DE') }}</div>
                <div v-if="payment.description" class="text-sm text-gray-500">{{ payment.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="text-center py-12 bg-white rounded-lg shadow">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Mortgage Not Found
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          The mortgage with ID "{{ route.params.id }}" could not be found.
        </p>
        
        <RouterLink
          to="/"
          class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Back to Mortgages
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useMortgageStore } from "../../stores/mortgageStore";

const route = useRoute();
const mortgageStore = useMortgageStore();

// Get mortgage by ID from route params
const mortgage = computed(() => {
  const id = route.params.id as string;
  return mortgageStore.getMortgageById(id);
});
</script>