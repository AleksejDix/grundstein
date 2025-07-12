<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgages</h1>
      <p class="text-lg text-gray-600 mb-8">
        Manage your mortgages and track your path to being debt-free
      </p>

      <div class="mb-6">
        <RouterLink
          to="/mortgages/new"
          class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Create New Mortgage
        </RouterLink>
      </div>

      <!-- Mortgage List -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="mortgage in mortgageStore.mortgages" 
          :key="mortgage.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push(`/mortgages/${mortgage.id}`)"
        >
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ mortgage.displayName }}
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              {{ mortgage.description }}
            </p>
            
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Loan Amount:</span>
                <span class="font-medium">{{ mortgageStore.formatCurrency(mortgage.loanAmount) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Interest Rate:</span>
                <span class="font-medium">{{ mortgageStore.formatInterestRate(mortgage.interestRate) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Monthly Payment:</span>
                <span class="font-medium">{{ mortgageStore.formatCurrency(mortgage.monthlyPayment) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Status:</span>
                <span :class="mortgageStore.getMortgageStatusColor(mortgage)">
                  {{ mortgageStore.getMortgageStatusLabel(mortgage) }}
                </span>
              </div>
            </div>
            
            <!-- Progress bar -->
            <div class="mt-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{{ mortgageStore.getMortgageProgress(mortgage) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${mortgageStore.getMortgageProgress(mortgage)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="mortgageStore.mortgages.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          No Mortgages Yet
        </h2>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto px-4">
          Start by creating your first mortgage to see payment schedules, amortization tables, 
          and understand how extra payments can help you become debt-free faster.
        </p>
        
        <RouterLink
          to="/mortgages/new"
          class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Create Your First Mortgage
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMortgageStore } from "../stores/mortgageStore";

const mortgageStore = useMortgageStore();
</script>