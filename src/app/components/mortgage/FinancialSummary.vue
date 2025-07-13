<template>
  <div>
    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-10">
      <!-- Total Payments -->
      <div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Total Payments
          <span class="text-xs normal-case text-gray-400">(12 months)</span>
        </div>
        <div
          class="text-3xl font-light text-gray-900"
          data-testid="total-payments"
        >
          {{ formatEuros(summary.totalPayments) }}
        </div>
      </div>

      <!-- Interest Paid -->
      <div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Interest Paid
        </div>
        <div
          class="text-3xl font-light text-red-600"
          data-testid="total-interest"
        >
          {{ formatEuros(summary.totalInterest) }}
        </div>
      </div>

      <!-- Principal Paid -->
      <div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Principal Paid
        </div>
        <div
          class="text-3xl font-light text-green-600"
          data-testid="total-principal"
        >
          {{ formatEuros(summary.totalPrincipal) }}
        </div>
      </div>

      <!-- Remaining Balance -->
      <div>
        <div class="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Remaining Balance
        </div>
        <div
          class="text-3xl font-light text-gray-900"
          data-testid="remaining-balance"
        >
          {{ formatEuros(summary.remainingBalance) }}
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="mt-12 pt-8 border-t border-gray-100">
      <div class="text-sm text-gray-500 uppercase tracking-wide mb-4">
        Paydown Progress
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span
            class="text-2xl font-light text-gray-900"
            data-testid="paydown-rate"
          >
            {{ formatPercentage(summary.paydownPercentage) }}
          </span>
          <span class="text-sm text-gray-500">
            {{ formatEuros(summary.totalPrincipal) }} of
            {{ formatEuros(summary.originalLoanAmount) }}
          </span>
        </div>

        <div class="w-full bg-gray-100 h-2 overflow-hidden">
          <div
            class="bg-green-500 h-full transition-all duration-500"
            :style="{ width: `${summary.paydownPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Key Rates -->
    <div class="mt-10 grid grid-cols-2 gap-8">
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Effective Rate
        </div>
        <div
          class="text-xl font-light text-gray-900"
          data-testid="effective-rate"
        >
          {{ formatPercentage(summary.effectiveRate) }}
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Annual Paydown
        </div>
        <div class="text-xl font-light text-gray-900">
          {{ formatPercentage(summary.annualPaydownRate) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FinancialSummary {
  // First year totals
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
  remainingBalance: number;

  // Progress metrics
  paydownPercentage: number;
  originalLoanAmount: number;

  // Key rates
  effectiveRate: number;
  annualPaydownRate: number;
}

interface Props {
  summary: FinancialSummary;
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
