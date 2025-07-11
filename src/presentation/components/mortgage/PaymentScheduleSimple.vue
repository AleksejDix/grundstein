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
        class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
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
        <div class="text-center" v-if="currentMonthData">
          <div class="text-2xl font-bold text-indigo-600">
            {{ formatCurrency(currentMonthData.remainingBalance) }}
          </div>
          <div class="text-sm text-indigo-600 font-medium">Current Balance</div>
          <div class="text-xs text-gray-500">
            {{ currentMonthData.paymentsLeft }} payments left
          </div>
        </div>
      </div>

      <!-- Payment Table -->
      <div class="border rounded-lg">
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
                Extra Payment (€)
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
                'bg-green-50':
                  entry.extraPayment > 0 && !isCurrentMonth(entry.month),
                'border-green-200':
                  entry.extraPayment > 0 && !isCurrentMonth(entry.month),
                'bg-blue-100 border-blue-300 shadow-lg ring-2 ring-blue-400':
                  isCurrentMonth(entry.month),
                'bg-green-100 border-green-400 shadow-lg ring-2 ring-green-400':
                  isCurrentMonth(entry.month) && entry.extraPayment > 0,
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
                {{ formatCurrency(entry.principal) }}
              </td>
              <td class="px-4 py-3 text-right text-red-600">
                {{ formatCurrency(entry.interest) }}
              </td>
              <td class="px-4 py-3 text-right text-green-600 font-medium">
                <div class="flex items-center justify-end gap-2">
                  <input
                    :value="props.extraPayments[entry.month] || ''"
                    @input="
                      updateExtraPayment(
                        entry.month,
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    @blur="validateExtraPayment(entry.month)"
                    type="number"
                    min="0"
                    :max="monthlyExtraPaymentLimit"
                    step="100"
                    placeholder="0"
                    :title="getExtraPaymentTooltip(entry.month)"
                    class="w-24 px-2 py-1 text-xs border border-gray-300 rounded text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    :class="{
                      'border-green-500 bg-green-50':
                        entry.extraPayment > 0 &&
                        !isExceedingAnnualLimit(entry.month),
                      'border-red-500 bg-red-50': isExceedingAnnualLimit(
                        entry.month
                      ),
                      'border-gray-300 bg-white':
                        entry.extraPayment === 0 &&
                        !isExceedingAnnualLimit(entry.month),
                    }"
                  />
                </div>
              </td>
              <td class="px-4 py-3 text-right font-medium">
                {{ formatCurrency(entry.remainingBalance) }}
              </td>
            </tr>
          </tbody>
        </table>
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

const props = defineProps<{
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  extraPayments: Record<number, number>;
  sondertilgungMaxPercent: number;
  startDate: string;
}>();

const emit = defineEmits<{
  "update:extraPayments": [payments: Record<number, number>];
}>();

// Simplified schedule entry type
type ScheduleEntry = {
  month: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
  interestSaved: number;
};

// State
const loading = ref(false);
const error = ref<string | null>(null);
const schedule = ref<ScheduleEntry[] | null>(null);
const displayMonths = ref(999);
const showOnlyExtraPayments = ref(false);

// Computed values
const visibleEntries = computed(() => {
  return filteredEntries.value;
});

const filteredEntries = computed(() => {
  if (!schedule.value) return [];

  let entries = schedule.value;

  // Filter by display months
  if (displayMonths.value < 999) {
    entries = entries.slice(0, displayMonths.value);
  }

  // Filter by extra payments only
  if (showOnlyExtraPayments.value) {
    entries = entries.filter((entry) => entry.extraPayment > 0);
  }

  return entries;
});

const totalInterestSaved = computed(() => {
  if (!schedule.value) return 0;
  const lastEntry = schedule.value[schedule.value.length - 1];
  return lastEntry ? lastEntry.interestSaved : 0;
});

const termReductionMonths = computed(() => {
  if (!schedule.value) return 0;
  const actualMonths = schedule.value.length;
  return Math.max(0, props.termMonths - actualMonths);
});

const totalExtraPayments = computed(() => {
  if (!schedule.value) return 0;
  return schedule.value.reduce((sum, entry) => sum + entry.extraPayment, 0);
});

const effectiveRate = computed(() => {
  if (!schedule.value || totalExtraPayments.value === 0) return 0;
  // Simplified ROI calculation: interest saved / extra payments invested
  return (totalInterestSaved.value / totalExtraPayments.value) * 100;
});

const currentMonthData = computed(() => {
  if (!schedule.value) return null;

  const currentEntry = schedule.value.find((entry) =>
    isCurrentMonth(entry.month)
  );
  if (!currentEntry) return null;

  const paymentsLeft = schedule.value.length - currentEntry.month + 1;

  return {
    remainingBalance: currentEntry.remainingBalance,
    paymentsLeft: paymentsLeft,
    currentPayment: currentEntry.totalPayment,
    month: currentEntry.month,
  };
});

const annualExtraPaymentLimit = computed(() => {
  return Math.floor((props.loanAmount * props.sondertilgungMaxPercent) / 100);
});

const monthlyExtraPaymentLimit = computed(() => {
  return annualExtraPaymentLimit.value; // Allow full annual amount in any month
});

// Methods
function calculateSchedule() {
  if (!props.loanAmount || !props.interestRate || !props.termMonths) {
    schedule.value = null;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const monthlyRate = props.interestRate / 100 / 12;
    const numberOfPayments = props.termMonths;

    // Calculate regular monthly payment using standard formula
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = props.loanAmount / numberOfPayments;
    } else {
      const factor = Math.pow(1 + monthlyRate, numberOfPayments);
      monthlyPayment = (props.loanAmount * monthlyRate * factor) / (factor - 1);
    }

    const entries: ScheduleEntry[] = [];
    let remainingBalance = props.loanAmount;
    let cumulativeInterestSaved = 0;

    // Calculate original total interest for comparison
    const originalTotalInterest =
      monthlyPayment * numberOfPayments - props.loanAmount;

    for (
      let month = 1;
      month <= numberOfPayments && remainingBalance > 0.01;
      month++
    ) {
      // Calculate interest for this month
      const monthlyInterest = remainingBalance * monthlyRate;

      // Calculate principal payment
      const regularPrincipal = Math.min(
        monthlyPayment - monthlyInterest,
        remainingBalance
      );

      // Get extra payment for this month
      const extraPayment = props.extraPayments[month] || 0;
      const actualExtraPayment = Math.min(
        extraPayment,
        remainingBalance - regularPrincipal
      );

      // Calculate total payment
      const totalPayment = monthlyPayment + actualExtraPayment;

      // Calculate new balance
      remainingBalance -= regularPrincipal + actualExtraPayment;
      remainingBalance = Math.max(0, remainingBalance);

      // Estimate interest saved (simplified calculation)
      if (actualExtraPayment > 0) {
        const monthsRemaining = numberOfPayments - month;
        const interestSavedThisMonth =
          actualExtraPayment * monthlyRate * monthsRemaining;
        cumulativeInterestSaved += interestSavedThisMonth;
      }

      entries.push({
        month,
        principal: regularPrincipal,
        interest: monthlyInterest,
        extraPayment: actualExtraPayment,
        totalPayment,
        remainingBalance,
        interestSaved: cumulativeInterestSaved,
      });

      // Break if loan is paid off
      if (remainingBalance <= 0.01) break;
    }

    schedule.value = entries;
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
  const startDate = new Date(props.startDate);
  // Add months to start date (monthNumber - 1 because month 1 is the first payment)
  const paymentDate = new Date(startDate);
  paymentDate.setMonth(startDate.getMonth() + monthNumber - 1);

  return paymentDate.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "short",
  });
}

function isCurrentMonth(monthNumber: number): boolean {
  const startDate = new Date(props.startDate);
  const paymentDate = new Date(startDate);
  paymentDate.setMonth(startDate.getMonth() + monthNumber - 1);

  const today = new Date();

  // Check if the payment date is the current month and year
  return (
    paymentDate.getMonth() === today.getMonth() &&
    paymentDate.getFullYear() === today.getFullYear()
  );
}

function updateExtraPayment(month: number, value: string) {
  const amount = Number(value) || 0;
  const newPayments = { ...props.extraPayments };

  if (amount === 0) {
    delete newPayments[month];
  } else {
    newPayments[month] = amount;
  }

  emit("update:extraPayments", newPayments);
}

function getExtraPaymentTooltip(month: number): string {
  const year = Math.ceil(month / 12);
  const yearStart = (year - 1) * 12 + 1;
  const yearEnd = year * 12;

  let yearlyTotal = 0;
  for (let m = yearStart; m <= yearEnd; m++) {
    if (m !== month && props.extraPayments[m]) {
      yearlyTotal += props.extraPayments[m];
    }
  }

  const remainingAllowance = annualExtraPaymentLimit.value - yearlyTotal;
  const annualLimit = annualExtraPaymentLimit.value.toLocaleString("de-DE");
  const remaining = remainingAllowance.toLocaleString("de-DE");

  return `Year ${year} limit: €${annualLimit} | Remaining: €${remaining}`;
}

function isExceedingAnnualLimit(month: number): boolean {
  const year = Math.ceil(month / 12);
  const yearStart = (year - 1) * 12 + 1;
  const yearEnd = year * 12;

  let yearlyTotal = 0;
  for (let m = yearStart; m <= yearEnd; m++) {
    if (props.extraPayments[m]) {
      yearlyTotal += props.extraPayments[m];
    }
  }

  return yearlyTotal > annualExtraPaymentLimit.value;
}

function validateExtraPayment(month: number) {
  const currentValue = props.extraPayments[month] || 0;

  // Calculate which year this month belongs to
  const year = Math.ceil(month / 12);

  // Calculate total extra payments for this year (excluding current month)
  const yearStart = (year - 1) * 12 + 1;
  const yearEnd = year * 12;

  let yearlyTotal = 0;
  for (let m = yearStart; m <= yearEnd; m++) {
    if (m !== month && props.extraPayments[m]) {
      yearlyTotal += props.extraPayments[m];
    }
  }

  // Check if current payment would exceed annual limit
  const remainingAnnualAllowance = annualExtraPaymentLimit.value - yearlyTotal;

  if (currentValue > remainingAnnualAllowance) {
    const newPayments = { ...props.extraPayments };
    newPayments[month] = Math.max(0, remainingAnnualAllowance);
    emit("update:extraPayments", newPayments);
  }
}

// Watchers
watch(
  [
    () => props.loanAmount,
    () => props.interestRate,
    () => props.termMonths,
    () => props.extraPayments,
    () => props.sondertilgungMaxPercent,
    () => props.startDate,
  ],
  calculateSchedule,
  { deep: true }
);

// Initialize
onMounted(calculateSchedule);
</script>

<style scoped>
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
