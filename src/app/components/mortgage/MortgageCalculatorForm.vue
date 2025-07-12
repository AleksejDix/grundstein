<template>
  <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">
        Mortgage Calculator
      </h1>
      <p class="text-gray-600">
        Calculate your monthly payment and explore different scenarios
      </p>
    </div>

    <!-- Input Form -->
    <form @submit.prevent="handleCalculate" class="space-y-6">
      <!-- Loan Amount -->
      <div class="form-group">
        <label for="loan-amount" class="block text-sm font-medium text-gray-700 mb-2">
          Loan Amount (Darlehenssumme)
          <span class="text-red-500" aria-label="required">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">€</span>
          <input
            id="loan-amount"
            v-model.number="mortgage.inputs.loan"
            type="number"
            min="1000"
            max="10000000"
            step="1000"
            class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            :class="{ 'border-red-500 focus:ring-red-500': loanAmountError }"
            :aria-invalid="!!loanAmountError"
            :aria-describedby="loanAmountError ? 'loan-amount-error' : 'loan-amount-help'"
            placeholder="300,000"
            required
          />
        </div>
        <p 
          v-if="loanAmountError" 
          id="loan-amount-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {{ loanAmountError }}
        </p>
        <p id="loan-amount-help" class="mt-1 text-sm text-gray-500">
          {{ formatCurrency(mortgage.inputs.loan) }}
        </p>
      </div>

      <!-- Interest Rate -->
      <div class="form-group">
        <label for="interest-rate" class="block text-sm font-medium text-gray-700 mb-2">
          Annual Interest Rate (Zinssatz)
          <span class="text-red-500" aria-label="required">*</span>
        </label>
        <div class="relative">
          <input
            id="interest-rate"
            v-model.number="mortgage.inputs.interestRate"
            type="number"
            min="0.1"
            max="15"
            step="0.1"
            class="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            :class="{ 'border-red-500 focus:ring-red-500': interestRateError }"
            :aria-invalid="!!interestRateError"
            :aria-describedby="interestRateError ? 'interest-rate-error' : 'interest-rate-help'"
            placeholder="3.5"
            required
          />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true">%</span>
        </div>
        <p 
          v-if="interestRateError" 
          id="interest-rate-error"
          class="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {{ interestRateError }}
        </p>
        <p id="interest-rate-help" class="mt-1 text-sm text-gray-500">
          {{ formatPercentage(mortgage.inputs.interestRate) }}
        </p>
      </div>

      <!-- Loan Term -->
      <div class="form-group">
        <label for="loan-term" class="block text-sm font-medium text-gray-700 mb-2">
          Loan Term (Laufzeit)
        </label>
        <div class="flex space-x-4">
          <!-- Years -->
          <div class="flex-1">
            <div class="relative">
              <input
                id="loan-term-years"
                v-model.number="termYears"
                type="number"
                min="5"
                max="40"
                step="1"
                class="w-full pr-16 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                :class="{ 'border-red-500': termError }"
                placeholder="30"
                @input="updateTermFromYears"
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">Jahre</span>
            </div>
          </div>
          
          <!-- Months (calculated) -->
          <div class="flex-1">
            <div class="relative">
              <input
                v-model.number="mortgage.inputs.termMonths"
                type="number"
                min="60"
                max="480"
                step="1"
                class="w-full pr-20 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-gray-50"
                readonly
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">Monate</span>
            </div>
          </div>
        </div>
        <p v-if="termError" class="mt-1 text-sm text-red-600">
          {{ termError }}
        </p>
        <p class="mt-1 text-sm text-gray-500">
          {{ termYears }} Jahre = {{ mortgage.inputs.termMonths }} Monate
        </p>
      </div>

      <!-- German Principal Rate (Optional) -->
      <div class="form-group">
        <label for="principal-rate" class="block text-sm font-medium text-gray-700 mb-2">
          Principal Rate (Tilgungsrate) 
          <span class="text-gray-400 font-normal">- Optional</span>
        </label>
        <div class="relative">
          <input
            id="principal-rate"
            v-model.number="mortgage.inputs.principalRate"
            type="number"
            min="1"
            max="10"
            step="0.1"
            class="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            placeholder="2.0"
          />
          <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
        </div>
        <p class="mt-1 text-sm text-gray-500">
          German-style principal repayment rate (typically 1-3%)
        </p>
      </div>

      <!-- Calculate Button -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="!isFormValid || isCalculating"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
        >
          <span v-if="isCalculating" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </span>
          <span v-else>
            Calculate Monthly Payment
          </span>
        </button>
      </div>
    </form>

    <!-- Quick Preview (if calculation is valid) -->
    <div v-if="mortgage.presentation.value.isValid && !isCalculating" class="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="text-lg font-semibold text-blue-900 mb-4">Quick Preview</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="text-center">
          <p class="text-sm text-blue-600 font-medium">Monthly Payment</p>
          <p class="text-2xl font-bold text-blue-900">
            {{ formatCurrency(mortgage.presentation.value.monthlyPayment) }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-sm text-blue-600 font-medium">Total Interest</p>
          <p class="text-2xl font-bold text-blue-900">
            {{ formatCurrency(mortgage.presentation.value.totalInterestPaid) }}
          </p>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-blue-200">
        <p class="text-sm text-blue-700">
          <strong>Payment Breakdown:</strong> 
          {{ formatCurrency(mortgage.presentation.value.monthlyPrincipal) }} principal + 
          {{ formatCurrency(mortgage.presentation.value.monthlyInterest) }} interest
        </p>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="mortgage.presentation.value.errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Calculation Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ mortgage.presentation.value.errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMortgageAdapter } from '../../adapters/MortgageAdapter'
import { createLoanAmount } from '../../../core/domain/value-objects/LoanAmount'
import { createInterestRate } from '../../../core/domain/value-objects/InterestRate'
import { createMonthCount } from '../../../core/domain/value-objects/MonthCount'

// Use the mortgage adapter
const mortgage = useMortgageAdapter()

// Local state for form handling
const isCalculating = ref(false)
const termYears = ref(30)

// Update term months when years change
function updateTermFromYears() {
  if (termYears.value && termYears.value >= 5 && termYears.value <= 40) {
    mortgage.inputs.termMonths = termYears.value * 12
  }
}

// Watch termMonths to update years display
watch(() => mortgage.inputs.termMonths, (newTermMonths) => {
  if (newTermMonths) {
    termYears.value = Math.round(newTermMonths / 12)
  }
})

// Enhanced form validation using domain types
const loanAmountError = computed(() => {
  if (!mortgage.inputs.loan) return 'Loan amount is required'
  
  const loanAmountResult = createLoanAmount(mortgage.inputs.loan)
  if (!loanAmountResult.success) {
    switch (loanAmountResult.error) {
      case 'BelowMinimum':
        return 'Minimum loan amount is €1,000'
      case 'AboveMaximum':
        return 'Maximum loan amount is €10,000,000'
      case 'MoneyValidationError':
        return 'Please enter a valid loan amount'
      default:
        return 'Invalid loan amount'
    }
  }
  return null
})

const interestRateError = computed(() => {
  if (!mortgage.inputs.interestRate) return 'Interest rate is required'
  
  const interestRateResult = createInterestRate(mortgage.inputs.interestRate)
  if (!interestRateResult.success) {
    switch (interestRateResult.error) {
      case 'BelowMinimumRate':
        return 'Minimum interest rate is 0.1%'
      case 'AboveMaximumRate':
        return 'Maximum interest rate is 25%'
      case 'PercentageValidationError':
        return 'Please enter a valid interest rate'
      default:
        return 'Invalid interest rate'
    }
  }
  return null
})

const termError = computed(() => {
  if (!termYears.value) return 'Loan term is required'
  if (!mortgage.inputs.termMonths) return 'Loan term is required'
  
  const monthCountResult = createMonthCount(mortgage.inputs.termMonths)
  if (!monthCountResult.success) {
    switch (monthCountResult.error) {
      case 'BelowMinimumTerm':
        return 'Minimum loan term is 5 years (60 months)'
      case 'AboveMaximumTerm':
        return 'Maximum loan term is 40 years (480 months)'
      case 'PositiveIntegerValidationError':
        return 'Please enter a valid loan term'
      default:
        return 'Invalid loan term'
    }
  }
  return null
})

const isFormValid = computed(() => {
  return !loanAmountError.value && !interestRateError.value && !termError.value
})

// Form submission
async function handleCalculate() {
  if (!isFormValid.value) return
  
  isCalculating.value = true
  
  try {
    // The reactive presentation model updates automatically through the adapter
    // Add a small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300))
  } catch (error) {
    console.error('Calculation failed:', error)
  } finally {
    isCalculating.value = false
  }
}

// Formatting helpers
function formatCurrency(amount: number): string {
  return mortgage.formatEuros(amount)
}

function formatPercentage(percentage: number): string {
  return mortgage.formatPercentage(percentage)
}

// Initialize with reasonable defaults for German mortgage market
mortgage.inputs.loan = 300000 // €300k typical first home
mortgage.inputs.interestRate = 3.5 // 3.5% current market rate
termYears.value = 30 // 30 years standard term
updateTermFromYears()
</script>

<style scoped>
/* Custom focus states for better UX */
input:focus {
  outline: none;
}

/* Number input styling */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>