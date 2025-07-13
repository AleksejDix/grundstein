<template>
  <div class="min-h-screen bg-white">
    <!-- Compact Header -->
    <div class="border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <h1 class="text-2xl font-light text-gray-900">
          Investment Property Calculator
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-8 py-8">
      <!-- Input Section - Compact -->
      <div class="grid grid-cols-4 gap-8 pb-8 border-b border-gray-200">
        <!-- Loan Amount -->
        <div>
          <LockableInput
            v-model="mortgage.inputs.loan"
            v-model:locked="mortgage.locks.loanAmount"
            input-id="loan-amount"
            label="Property Price"
            :min="1000"
            :max="10000000"
            :step="1000"
            prefix="€"
            :required="true"
            :error-message="mortgage.errors.value.loanAmount"
            :lockable="true"
          />
        </div>

        <!-- Interest Rate -->
        <div>
          <LockableInput
            v-model="mortgage.inputs.interestRate"
            v-model:locked="mortgage.locks.interestRate"
            input-id="interest-rate"
            label="Interest Rate"
            :min="0.0"
            :max="25"
            :step="0.1"
            suffix="%"
            :required="true"
            :error-message="mortgage.errors.value.interestRate"
            :lockable="true"
          />
        </div>

        <!-- Term in Months -->
        <div>
          <LockableInput
            v-model="mortgage.inputs.termMonths"
            v-model:locked="mortgage.locks.termMonths"
            input-id="term-months"
            label="Loan Term"
            :min="60"
            :max="480"
            :step="12"
            suffix="months"
            :required="true"
            :error-message="mortgage.errors.value.termMonths"
            :help-text="`${(mortgage.inputs.termMonths / 12).toFixed(0)} years`"
            :lockable="true"
          />
        </div>

        <!-- Monthly Payment -->
        <div>
          <LockableInput
            v-model="mortgage.inputs.monthlyPayment"
            v-model:locked="mortgage.locks.monthlyPayment"
            input-id="monthly-payment"
            label="Monthly Payment"
            :min="10"
            :max="100000"
            :step="1"
            prefix="€"
            :required="true"
            :error-message="mortgage.errors.value.monthlyPayment"
            :lockable="true"
            :lock-message="
              mortgage.locks.monthlyPayment
                ? 'Locked - adjusting other values'
                : undefined
            "
          />
        </div>
      </div>

      <!-- Key Investment Metrics -->
      <div v-if="mortgage.presentation.value.isValid" class="mt-8">
        <!-- Primary Metric - What investors care about most -->
        <div class="bg-gray-50 p-8 mb-8">
          <div class="text-center">
            <div class="text-sm text-gray-500 uppercase tracking-wide mb-2">
              Monthly Cost
            </div>
            <div class="text-6xl font-light text-gray-900 mb-4">
              {{ formatEuros(paymentBreakdown.totalPayment) }}
            </div>
            <div class="text-sm text-gray-500">
              You need
              {{ formatEuros(paymentBreakdown.totalPayment * 1.2) }} rental
              income for 20% cash flow
            </div>
          </div>
        </div>

        <!-- Secondary Metrics Grid -->
        <div class="grid grid-cols-3 gap-8 mb-8">
          <!-- Total Investment -->
          <div class="text-center p-6 border border-gray-200">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Total Cost ({{ (mortgage.inputs.termMonths / 12).toFixed(0) }}
              years)
            </div>
            <div class="text-3xl font-light text-gray-900 mb-1">
              {{
                formatEuros(
                  paymentBreakdown.totalPayment * mortgage.inputs.termMonths,
                )
              }}
            </div>
            <div class="text-sm text-red-600">
              {{
                formatEuros(
                  paymentBreakdown.totalPayment * mortgage.inputs.termMonths -
                    mortgage.inputs.loan,
                )
              }}
              interest
            </div>
          </div>

          <!-- First Year Numbers -->
          <div class="text-center p-6 border border-gray-200">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Year 1 Breakdown
            </div>
            <div class="text-3xl font-light text-gray-900 mb-1">
              {{ formatEuros(financialSummary.totalPayments) }}
            </div>
            <div class="flex justify-center gap-4 text-sm">
              <span class="text-green-600"
                >{{ formatEuros(financialSummary.totalPrincipal) }} equity</span
              >
              <span class="text-red-600"
                >{{ formatEuros(financialSummary.totalInterest) }} cost</span
              >
            </div>
          </div>

          <!-- Break Even -->
          <div class="text-center p-6 border border-gray-200">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Monthly Break-Even Rent
            </div>
            <div class="text-3xl font-light text-gray-900 mb-1">
              {{ formatEuros(paymentBreakdown.totalPayment * 1.1) }}
            </div>
            <div class="text-sm text-gray-500">
              +10% for maintenance & vacancy
            </div>
          </div>
        </div>

        <!-- Payment Structure -->
        <div class="grid grid-cols-2 gap-8">
          <div class="p-6 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-4">
              Payment Structure
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Building Equity</span>
                <span class="text-2xl font-light text-green-600">
                  {{ formatEuros(paymentBreakdown.principalPayment) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Interest Cost</span>
                <span class="text-2xl font-light text-red-600">
                  {{ formatEuros(paymentBreakdown.interestPayment) }}
                </span>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500"
                    >Equity Building Rate</span
                  >
                  <span class="text-lg font-medium text-gray-900">
                    {{ formatPercentage(paymentBreakdown.principalPercentage) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-4">
              Investment Progress
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Property Value</span>
                <span class="text-2xl font-light text-gray-900">
                  {{ formatEuros(mortgage.inputs.loan) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Remaining Debt</span>
                <span class="text-2xl font-light text-gray-900">
                  {{ formatEuros(financialSummary.remainingBalance) }}
                </span>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">Equity After 1 Year</span>
                  <span class="text-lg font-medium text-green-600">
                    {{
                      formatEuros(
                        mortgage.inputs.loan -
                          financialSummary.remainingBalance,
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Calculations -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium text-blue-900"
                >Quick ROI Check:</span
              >
              <span class="text-sm text-blue-700 ml-2">
                At {{ formatEuros(paymentBreakdown.totalPayment * 1.5) }}/month
                rent =
                {{
                  formatPercentage(
                    ((paymentBreakdown.totalPayment * 1.5 * 12) /
                      mortgage.inputs.loan) *
                      100,
                  )
                }}
                gross yield
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div
        v-if="
          !mortgage.presentation.value.isValid &&
          mortgage.presentation.value.errorMessage
        "
        class="mt-8 p-6 bg-red-50 border border-red-200"
      >
        <p class="text-sm text-red-700">
          {{ mortgage.presentation.value.errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMortgage } from "../../composables/useMortgage";
import LockableInput from "./LockableInput.vue";

// Use unified mortgage composable with parameter locking (delegates to core domain)
const mortgage = useMortgage();

// Computed properties for components
const paymentBreakdown = computed(() => {
  const presentation = mortgage.presentation.value;
  return {
    totalPayment: presentation.monthlyPayment,
    principalPayment: presentation.monthlyPrincipal,
    interestPayment: presentation.monthlyInterest,
    principalPercentage: presentation.principalPercentage,
    interestPercentage: 100 - presentation.principalPercentage,
  };
});

const financialSummary = computed(() => {
  const presentation = mortgage.presentation.value;
  return {
    totalPayments: presentation.firstYearPayments,
    totalInterest: presentation.firstYearInterest,
    totalPrincipal: presentation.firstYearPrincipal,
    remainingBalance: presentation.remainingBalance,
    paydownPercentage: presentation.paydownPercentage,
    originalLoanAmount: presentation.loanAmount,
    effectiveRate: presentation.interestRate,
    annualPaydownRate: presentation.paydownPercentage,
  };
});

/**
 * Format amount as euros using German locale
 */
function formatEuros(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Format percentage
 */
function formatPercentage(percentage: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
}
</script>
