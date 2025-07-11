<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-2xl font-semibold text-gray-800">Payment Schedule</h3>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="showOnlyExtraPayments"
            type="checkbox"
            class="rounded"
          />
          Show only months with extra payments
        </label>
        <select
          v-model="displayMonths"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="12">First Year</option>
          <option value="24">First 2 Years</option>
          <option value="60">First 5 Years</option>
          <option value="120">First 10 Years</option>
          <option value="999">All Payments</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"
      ></div>
      <p class="text-gray-500 mt-2">Calculating payment schedule...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-2">⚠️ Error calculating schedule</div>
      <p class="text-gray-500 text-sm">{{ error }}</p>
    </div>

    <!-- Schedule Table -->
    <div v-else-if="schedule" class="overflow-x-auto">
      <!-- Summary Stats -->
      <div
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
      >
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(totalInterestSaved) }}
          </div>
          <div class="text-sm text-gray-600">Interest Saved</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ termReductionMonths }} months
          </div>
          <div class="text-sm text-gray-600">Term Reduction</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {{ formatCurrency(totalExtraPayments) }}
          </div>
          <div class="text-sm text-gray-600">Total Extra Payments</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">
            {{ effectiveRate.toFixed(2) }}%
          </div>
          <div class="text-sm text-gray-600">Effective Return</div>
        </div>
      </div>

      <!-- Payment Table -->
      <div class="max-h-96 overflow-y-auto border rounded-lg">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">
                Month
              </th>
              <th class="px-4 py-3 text-left font-semibold text-gray-700">
                Date
              </th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">
                Payment
              </th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">
                Principal
              </th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">
                Interest
              </th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">
                Extra
              </th>
              <th class="px-4 py-3 text-right font-semibold text-gray-700">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in visibleEntries"
              :key="entry.month"
              class="border-t hover:bg-gray-50"
              :class="{
                'bg-green-50': entry.extraPayment,
                'border-green-200': entry.extraPayment,
              }"
            >
              <td class="px-4 py-3 font-medium">{{ entry.month }}</td>
              <td class="px-4 py-3 text-gray-600">
                {{ formatDate(entry.month) }}
              </td>
              <td class="px-4 py-3 text-right font-medium">
                {{ formatCurrency(entry.totalPayment) }}
              </td>
              <td class="px-4 py-3 text-right text-blue-600">
                {{ formatCurrency(entry.regularPayment.principal) }}
              </td>
              <td class="px-4 py-3 text-right text-red-600">
                {{ formatCurrency(entry.regularPayment.interest) }}
              </td>
              <td class="px-4 py-3 text-right text-green-600 font-medium">
                {{
                  entry.extraPayment
                    ? formatCurrency(entry.extraPayment.amount)
                    : "—"
                }}
              </td>
              <td class="px-4 py-3 text-right font-medium">
                {{ formatCurrency(entry.remainingBalance) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredEntries.length > 50" class="mt-4 flex justify-center">
        <div class="flex gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="px-3 py-1 rounded text-sm"
            :class="{
              'bg-indigo-600 text-white': currentPage === page,
              'bg-gray-200 text-gray-700 hover:bg-gray-300':
                currentPage !== page,
            }"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Schedule State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>Configure your loan parameters to see the payment schedule</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  MortgageService,
  type LoanScenarioInput,
} from "../application/services/MortgageService";
import {
  calculatePaymentSchedule,
  type PaymentSchedule,
  type PaymentScheduleEntry,
} from "../domain/calculations/SondertilgungCalculations";
import { createLoanConfiguration } from "../domain/types/LoanConfiguration";
import {
  createSondertilgungPlan,
  createPercentageLimit,
  createUnlimitedLimit,
} from "../domain/types/SondertilgungPlan";
import { createExtraPayment } from "../domain/types/ExtraPayment";
import { createPaymentMonth } from "../domain/types/PaymentMonth";
import { createLoanAmount } from "../domain/types/LoanAmount";
import { createInterestRate } from "../domain/types/InterestRate";
import { createMonthCount } from "../domain/types/MonthCount";
import { createMoney, toEuros } from "../domain/types/Money";
import { toNumber as monthCountToNumber } from "../domain/types/MonthCount";
import { createPercentage } from "../domain/types/Percentage";

const props = defineProps<{
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  extraPayments: Record<number, number>;
  sondertilgungMaxPercent: number;
}>();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const schedule = ref<PaymentSchedule | null>(null);
const displayMonths = ref(24);
const showOnlyExtraPayments = ref(false);
const currentPage = ref(1);
const itemsPerPage = 50;

// Services
const mortgageService = new MortgageService();

// Computed values
const visibleEntries = computed(() => {
  if (!schedule.value) return [];

  const entries = filteredEntries.value;
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return entries.slice(startIndex, endIndex);
});

const filteredEntries = computed(() => {
  if (!schedule.value) return [];

  let entries = schedule.value.entries;

  // Filter by display months
  if (displayMonths.value < 999) {
    entries = entries.slice(0, displayMonths.value);
  }

  // Filter by extra payments only
  if (showOnlyExtraPayments.value) {
    entries = entries.filter((entry) => entry.extraPayment);
  }

  return entries;
});

const totalPages = computed(() => {
  return Math.ceil(filteredEntries.value.length / itemsPerPage);
});

const totalInterestSaved = computed(() => {
  if (!schedule.value) return 0;
  return toEuros(schedule.value.totalInterestSaved);
});

const termReductionMonths = computed(() => {
  if (!schedule.value) return 0;
  return monthCountToNumber(schedule.value.termReductionMonths);
});

const totalExtraPayments = computed(() => {
  if (!schedule.value) return 0;
  return schedule.value.entries
    .filter((entry) => entry.extraPayment)
    .reduce(
      (sum, entry) =>
        sum + (entry.extraPayment ? toEuros(entry.extraPayment.amount) : 0),
      0
    );
});

const effectiveRate = computed(() => {
  if (!schedule.value || totalExtraPayments.value === 0) return 0;
  // Simplified ROI calculation: interest saved / extra payments invested
  return (totalInterestSaved.value / totalExtraPayments.value) * 100;
});

// Methods
async function calculateSchedule() {
  if (!props.loanAmount || !props.interestRate || !props.termMonths) {
    schedule.value = null;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Create domain value objects
    const loanAmountResult = createLoanAmount(props.loanAmount);
    if (!loanAmountResult.success) {
      throw new Error("Invalid loan amount: " + loanAmountResult.error);
    }

    const interestRateResult = createInterestRate(props.interestRate);
    if (!interestRateResult.success) {
      throw new Error("Invalid interest rate: " + interestRateResult.error);
    }

    const termResult = createMonthCount(props.termMonths);
    if (!termResult.success) {
      throw new Error("Invalid term: " + termResult.error);
    }

    // Calculate monthly payment using domain service
    const quickEstimate = mortgageService.getQuickEstimate(
      props.loanAmount,
      props.interestRate,
      props.termMonths / 12
    );

    const monthlyPaymentResult = createMoney(quickEstimate.monthlyPayment);
    if (!monthlyPaymentResult.success) {
      throw new Error("Invalid monthly payment calculation");
    }

    // Create loan configuration
    const loanConfigResult = createLoanConfiguration(
      loanAmountResult.data,
      interestRateResult.data,
      termResult.data,
      monthlyPaymentResult.data
    );

    if (!loanConfigResult.success) {
      throw new Error("Invalid loan configuration: " + loanConfigResult.error);
    }

    // Create Sondertilgung plan from extra payments
    const extraPaymentsList = Object.entries(props.extraPayments)
      .map(([month, amount]) => {
        const monthResult = createPaymentMonth(Number(month));
        if (!monthResult.success) return null;

        const paymentResult = createExtraPayment(monthResult.data, amount);
        if (!paymentResult.success) return null;

        return paymentResult.data;
      })
      .filter(Boolean);

    // Create yearly limit for Sondertilgung
    let yearlyLimit;
    if (extraPaymentsList.length === 0) {
      // Use unlimited limit when no payments are configured
      yearlyLimit = createUnlimitedLimit();
    } else {
      // Use percentage limit when payments are configured
      const percentageResult = createPercentage(props.sondertilgungMaxPercent);
      if (!percentageResult.success) {
        throw new Error(
          "Invalid Sondertilgung percentage: " + percentageResult.error
        );
      }
      yearlyLimit = createPercentageLimit(percentageResult.data);
    }

    const sondertilgungPlanResult = createSondertilgungPlan(
      yearlyLimit,
      extraPaymentsList as any[],
      loanAmountResult.data
    );

    if (!sondertilgungPlanResult.success) {
      throw new Error(
        "Invalid Sondertilgung plan: " + sondertilgungPlanResult.error
      );
    }

    // Calculate payment schedule
    const scheduleResult = calculatePaymentSchedule(
      loanConfigResult.data,
      sondertilgungPlanResult.data
    );

    if (!scheduleResult.success) {
      throw new Error("Schedule calculation failed: " + scheduleResult.error);
    }

    schedule.value = scheduleResult.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
    console.error("Payment schedule calculation error:", err);
  } finally {
    loading.value = false;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(monthNumber: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthNumber - 1);
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
  });
}

// Watchers
watch(
  [
    () => props.loanAmount,
    () => props.interestRate,
    () => props.termMonths,
    () => props.extraPayments,
    () => props.sondertilgungMaxPercent,
  ],
  calculateSchedule,
  { deep: true }
);

// Initialize
onMounted(calculateSchedule);
</script>

<style scoped>
/* Ensure table scrolling works properly */
.max-h-96 {
  max-height: 24rem;
}

/* Highlight extra payment rows */
.bg-green-50 {
  background-color: rgb(240 253 244);
}

.border-green-200 {
  border-color: rgb(187 247 208);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
