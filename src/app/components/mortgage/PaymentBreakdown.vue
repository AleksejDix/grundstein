<template>
  <div
    class="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
    role="region"
    aria-labelledby="payment-breakdown-title"
  >
    <h3 id="payment-breakdown-title" class="text-lg font-semibold text-gray-900 mb-4">
      Monatliche Rate aufgeschlüsselt
    </h3>

    <!-- Monthly Payment Breakdown -->
    <div class="space-y-4">
      <!-- Total Monthly Payment -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex justify-between items-center">
          <span class="text-blue-900 font-medium">Gesamte monatliche Rate</span>
          <span class="text-2xl font-bold text-blue-900" data-testid="total-payment">
            {{ formatEuros(breakdown.totalPayment) }}
          </span>
        </div>
      </div>

      <!-- Principal and Interest Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Principal Payment -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-center">
            <div class="text-green-800 text-sm font-medium mb-1">Tilgung</div>
            <div class="text-xl font-bold text-green-900" data-testid="principal-payment">
              {{ formatEuros(breakdown.principalPayment) }}
            </div>
            <div class="text-green-700 text-sm mt-1" data-testid="principal-percentage">
              {{ formatPercentage(breakdown.principalPercentage) }}
            </div>
          </div>
        </div>

        <!-- Interest Payment -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div class="text-center">
            <div class="text-orange-800 text-sm font-medium mb-1">Zinsen</div>
            <div class="text-xl font-bold text-orange-900" data-testid="interest-payment">
              {{ formatEuros(breakdown.interestPayment) }}
            </div>
            <div class="text-orange-700 text-sm mt-1" data-testid="interest-percentage">
              {{ formatPercentage(breakdown.interestPercentage) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar Visualization -->
      <div class="mt-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Verteilung der monatlichen Rate</span>
          <span>Tilgung / Zinsen</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div class="h-full flex">
            <div
              class="bg-green-500 transition-all duration-300"
              :style="{ width: `${breakdown.principalPercentage}%` }"
              :title="`Tilgung: ${formatPercentage(breakdown.principalPercentage)}`"
            ></div>
            <div
              class="bg-orange-500 transition-all duration-300"
              :style="{ width: `${breakdown.interestPercentage}%` }"
              :title="`Zinsen: ${formatPercentage(breakdown.interestPercentage)}`"
            ></div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>{{ formatPercentage(breakdown.principalPercentage) }} Tilgung</span>
          <span>{{ formatPercentage(breakdown.interestPercentage) }} Zinsen</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PaymentBreakdown {
  totalPayment: number
  principalPayment: number
  interestPayment: number
  principalPercentage: number
  interestPercentage: number
}

interface Props {
  breakdown: PaymentBreakdown
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