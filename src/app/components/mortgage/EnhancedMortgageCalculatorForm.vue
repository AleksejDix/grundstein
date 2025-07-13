<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
      <p class="text-gray-600">
        Lock any parameter and watch others calculate in real-time. Use arrow keys or +/- buttons to adjust values.
      </p>
    </div>

    <!-- Interactive Controls Info -->
    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">🔒 Interactive Features</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <strong>Lock Parameters:</strong> Click the lock icon to fix a value
        </div>
        <div>
          <strong>Real-time Updates:</strong> Change any unlocked value to see instant recalculation
        </div>
        <div>
          <strong>Quick Adjustments:</strong> Use +/- buttons or arrow keys
        </div>
        <div>
          <strong>Flexible Scenarios:</strong> Lock payment to find affordable loan amounts or terms
        </div>
      </div>
    </div>

    <!-- Input Form -->
    <form @submit.prevent class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Loan Amount -->
        <LockableInput
          v-model="mortgage.inputs.loan"
          v-model:locked="mortgage.locks.loanAmount"
          input-id="loan-amount"
          label="Loan Amount (Darlehenssumme)"
          :min="1000"
          :max="10000000"
          :step="1000"
          prefix="€"
          placeholder="50,000"
          :required="true"
          :error-message="mortgage.errors.value.loanAmount"
          :help-text="mortgage.formatEuros(mortgage.inputs.loan)"
          :lockable="true"
          :lock-message="mortgage.locks.loanAmount ? 'Loan amount is locked - other values will adjust' : undefined"
        />

        <!-- Interest Rate -->
        <LockableInput
          v-model="mortgage.inputs.interestRate"
          v-model:locked="mortgage.locks.interestRate"
          input-id="interest-rate"
          label="Annual Interest Rate (Zinssatz)"
          :min="0.0"
          :max="25"
          :step="0.1"
          suffix="%"
          placeholder="0.8"
          :required="true"
          :error-message="mortgage.errors.value.interestRate"
          :help-text="mortgage.formatPercentage(mortgage.inputs.interestRate)"
          :lockable="true"
          :lock-message="mortgage.locks.interestRate ? 'Interest rate is locked - other values will adjust' : undefined"
        />

        <!-- Term in Months -->
        <LockableInput
          v-model="mortgage.inputs.termMonths"
          v-model:locked="mortgage.locks.termMonths"
          input-id="term-months"
          label="Loan Term (Laufzeit)"
          :min="60"
          :max="480"
          :step="1"
          suffix="Monate"
          placeholder="140"
          :required="true"
          :error-message="mortgage.errors.value.termMonths"
          :help-text="`${mortgage.inputs.termMonths} Monate = ${(mortgage.inputs.termMonths / 12).toFixed(1)} Jahre`"
          :lockable="true"
          :lock-message="mortgage.locks.termMonths ? 'Term is locked - other values will adjust' : undefined"
        />

        <!-- Monthly Payment -->
        <LockableInput
          v-model="mortgage.inputs.monthlyPayment"
          v-model:locked="mortgage.locks.monthlyPayment"
          input-id="monthly-payment"
          label="Monthly Payment (Monatliche Rate)"
          :min="10"
          :max="100000"
          :step="1"
          prefix="€"
          placeholder="375"
          :required="true"
          :error-message="mortgage.errors.value.monthlyPayment"
          :help-text="mortgage.formatEuros(mortgage.inputs.monthlyPayment)"
          :lockable="true"
          :lock-message="mortgage.locks.monthlyPayment ? 'Payment is locked - other values will adjust' : undefined"
        />
      </div>

    </form>

    <!-- Real-time Results -->
    <div v-if="mortgage.presentation.value.isValid" class="mt-8 space-y-6">
      <!-- Payment Breakdown -->
      <PaymentBreakdown :breakdown="paymentBreakdown" />
      
      <!-- Financial Summary -->
      <FinancialSummary :summary="financialSummary" />

      <!-- Locked Parameters Status -->
      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="text-sm font-semibold text-yellow-900 mb-2">🔒 Parameter Status</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div :class="mortgage.locks.loanAmount ? 'text-red-700 font-semibold' : 'text-gray-600'">
            Loan Amount: {{ mortgage.locks.loanAmount ? 'LOCKED' : 'Flexible' }}
          </div>
          <div :class="mortgage.locks.interestRate ? 'text-red-700 font-semibold' : 'text-gray-600'">
            Interest Rate: {{ mortgage.locks.interestRate ? 'LOCKED' : 'Flexible' }}
          </div>
          <div :class="mortgage.locks.termMonths ? 'text-red-700 font-semibold' : 'text-gray-600'">
            Term: {{ mortgage.locks.termMonths ? 'LOCKED' : 'Flexible' }}
          </div>
          <div :class="mortgage.locks.monthlyPayment ? 'text-red-700 font-semibold' : 'text-gray-600'">
            Payment: {{ mortgage.locks.monthlyPayment ? 'LOCKED' : 'Flexible' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="!mortgage.presentation.value.isValid && mortgage.presentation.value.errorMessage"
      class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Calculation Error</h3>
          <p class="mt-1 text-sm text-red-700">
            {{ mortgage.presentation.value.errorMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMortgage } from '../../composables/useMortgage'
import LockableInput from './LockableInput.vue'
import PaymentBreakdown from './PaymentBreakdown.vue'
import FinancialSummary from './FinancialSummary.vue'

// Use unified mortgage composable with parameter locking (delegates to core domain)
const mortgage = useMortgage()

// Computed properties for components
const paymentBreakdown = computed(() => {
  const presentation = mortgage.presentation.value
  return {
    totalPayment: presentation.monthlyPayment,
    principalPayment: presentation.monthlyPrincipal,
    interestPayment: presentation.monthlyInterest,
    principalPercentage: presentation.principalPercentage,
    interestPercentage: 100 - presentation.principalPercentage,
  }
})

const financialSummary = computed(() => {
  const presentation = mortgage.presentation.value
  return {
    totalPayments: presentation.firstYearPayments,
    totalInterest: presentation.firstYearInterest,
    totalPrincipal: presentation.firstYearPrincipal,
    remainingBalance: presentation.remainingBalance,
    paydownPercentage: presentation.paydownPercentage,
    originalLoanAmount: presentation.loanAmount,
    effectiveRate: presentation.interestRate,
    annualPaydownRate: presentation.paydownPercentage,
  }
})

</script>