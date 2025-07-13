<template>
  <div>
    <!-- Total Monthly Payment -->
    <div class="mb-12">
      <div class="text-sm text-gray-500 uppercase tracking-wide mb-3">
        Total Monthly Payment
      </div>
      <div
        class="text-5xl font-light text-gray-900"
        data-testid="total-payment"
      >
        {{ formatEuros(breakdown.totalPayment) }}
      </div>
    </div>

    <!-- Principal and Interest Grid -->
    <div class="space-y-8">
      <!-- Principal Payment -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-sm text-gray-500 uppercase tracking-wide"
              >Principal</span
            >
            <span class="text-xs text-gray-400 ml-2">(Tilgung)</span>
          </div>
          <span
            class="text-sm text-gray-500"
            data-testid="principal-percentage"
          >
            {{ formatPercentage(breakdown.principalPercentage) }}
          </span>
        </div>
        <div
          class="text-3xl font-light text-green-600"
          data-testid="principal-payment"
        >
          {{ formatEuros(breakdown.principalPayment) }}
        </div>
      </div>

      <!-- Interest Payment -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-sm text-gray-500 uppercase tracking-wide"
              >Interest</span
            >
            <span class="text-xs text-gray-400 ml-2">(Zinsen)</span>
          </div>
          <span class="text-sm text-gray-500" data-testid="interest-percentage">
            {{ formatPercentage(breakdown.interestPercentage) }}
          </span>
        </div>
        <div
          class="text-3xl font-light text-red-600"
          data-testid="interest-payment"
        >
          {{ formatEuros(breakdown.interestPayment) }}
        </div>
      </div>
    </div>

    <!-- Visual Progress Bar -->
    <div class="mt-12">
      <div class="w-full bg-gray-100 h-2 overflow-hidden">
        <div class="h-full flex">
          <div
            class="bg-green-500 transition-all duration-300"
            :style="{ width: `${breakdown.principalPercentage}%` }"
          ></div>
          <div
            class="bg-red-500 transition-all duration-300"
            :style="{ width: `${breakdown.interestPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PaymentBreakdown {
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  principalPercentage: number;
  interestPercentage: number;
}

interface Props {
  breakdown: PaymentBreakdown;
}

defineProps<Props>();

/**
 * Format amount as euros using German locale
 */
function formatEuros(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage using German locale
 */
function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
}
</script>
