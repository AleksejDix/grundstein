<template>
  <div
    class="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
    role="region"
    aria-labelledby="financial-summary-title"
  >
    <h3 id="financial-summary-title" class="text-lg font-semibold text-gray-900 mb-4">
      Jahresübersicht (Erstes Jahr)
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Payments -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <div class="text-blue-800 text-sm font-medium mb-1">Gesamte Zahlungen</div>
        <div class="text-lg font-bold text-blue-900" data-testid="total-payments">
          {{ formatEuros(summary.totalPayments) }}
        </div>
        <div class="text-blue-700 text-xs mt-1">12 Monate</div>
      </div>

      <!-- Total Interest -->
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
        <div class="text-orange-800 text-sm font-medium mb-1">Zinsen gesamt</div>
        <div class="text-lg font-bold text-orange-900" data-testid="total-interest">
          {{ formatEuros(summary.totalInterest) }}
        </div>
        <div class="text-orange-700 text-xs mt-1">Jahr 1</div>
      </div>

      <!-- Total Principal -->
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div class="text-green-800 text-sm font-medium mb-1">Tilgung gesamt</div>
        <div class="text-lg font-bold text-green-900" data-testid="total-principal">
          {{ formatEuros(summary.totalPrincipal) }}
        </div>
        <div class="text-green-700 text-xs mt-1">Jahr 1</div>
      </div>

      <!-- Remaining Balance -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <div class="text-gray-800 text-sm font-medium mb-1">Restschuld</div>
        <div class="text-lg font-bold text-gray-900" data-testid="remaining-balance">
          {{ formatEuros(summary.remainingBalance) }}
        </div>
        <div class="text-gray-700 text-xs mt-1">Nach Jahr 1</div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div class="mt-6">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>Tilgungsfortschritt</span>
        <span>{{ formatPercentage(summary.paydownPercentage) }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          class="bg-green-500 h-full transition-all duration-500"
          :style="{ width: `${summary.paydownPercentage}%` }"
          :title="`${formatPercentage(summary.paydownPercentage)} der ursprünglichen Darlehenssumme getilgt`"
        ></div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        {{ formatEuros(summary.totalPrincipal) }} von {{ formatEuros(summary.originalLoanAmount) }} getilgt
      </div>
    </div>

    <!-- Key Insights -->
    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="text-sm font-medium text-blue-900 mb-2">Wichtige Kennzahlen</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div class="flex justify-between">
          <span class="text-blue-800">Effektivzins p.a.:</span>
          <span class="font-medium text-blue-900" data-testid="effective-rate">
            {{ formatPercentage(summary.effectiveRate) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-blue-800">Tilgungsrate p.a.:</span>
          <span class="font-medium text-blue-900" data-testid="paydown-rate">
            {{ formatPercentage(summary.annualPaydownRate) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FinancialSummary {
  // First year totals
  totalPayments: number
  totalInterest: number
  totalPrincipal: number
  remainingBalance: number
  
  // Progress metrics
  paydownPercentage: number
  originalLoanAmount: number
  
  // Key rates
  effectiveRate: number
  annualPaydownRate: number
}

interface Props {
  summary: FinancialSummary
}

defineProps<Props>()

/**
 * Format amount as euros using German locale
 */
function formatEuros(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage using German locale
 */
function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100)
}
</script>