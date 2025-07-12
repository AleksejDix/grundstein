<template>
  <div class="bg-zinc-900 p-4 rounded border border-zinc-700">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-white font-medium">Monatliche Sondertilgung</h3>
      <button
        @click="clearAll"
        class="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-1 rounded"
      >
        Alle löschen
      </button>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <div class="grid grid-cols-6 gap-2 text-xs text-zinc-400 mb-2 px-2">
        <div>Monat</div>
        <div>Jahr</div>
        <div>Sondertilgung</div>
        <div>Remaining</div>
        <div>Summe</div>
        <div>Actions</div>
      </div>

      <div
        v-for="month in visibleMonths"
        :key="month"
        class="grid grid-cols-6 gap-2 items-center py-1 px-2 hover:bg-zinc-800 rounded"
      >
        <div class="text-zinc-300 text-xs">
          {{ getMonthName(month) }}
        </div>
        <div class="text-zinc-300 text-xs">
          {{ getYear(month) }}
        </div>
        <div>
          <input
            :value="extraPayments[month] || 0"
            @input="
              updateExtraPayment(
                month,
                ($event.target as HTMLInputElement).value
              )
            "
            type="number"
            :max="maxMonthlyAmount"
            min="0"
            step="100"
            class="w-full bg-zinc-800 text-white text-xs px-2 py-1 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
            :class="{ 'border-red-500': isExceedingLimit(month) }"
          />
        </div>
        <div
          class="text-xs"
          :class="{
            'text-red-400': isExceedingLimit(month),
            'text-zinc-400': !isExceedingLimit(month),
          }"
        >
          {{ formatCurrency(remainingMonthlyLimit(month)) }}
        </div>
        <div class="text-xs text-zinc-400">
          {{ formatCurrency(getYearlySum(getYear(month))) }}
        </div>
        <div class="flex gap-1">
          <button
            @click="setMaxPayment(month)"
            class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-1 py-0.5 rounded"
            :disabled="isExceedingLimit(month)"
          >
            Max
          </button>
          <button
            @click="clearPayment(month)"
            class="text-xs bg-red-600 hover:bg-red-500 text-white px-1 py-0.5 rounded"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 text-xs text-zinc-400">
      Gesamte Sondertilgung: {{ formatCurrency(totalExtraPayments) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  extraPayments: Record<number, number>;
  maxPercentage: number;
  loanAmount: number;
  termMonths: number;
}>();

const emit = defineEmits<{
  "update:extraPayments": [payments: Record<number, number>];
}>();

const showMonths = ref(24); // Show first 24 months by default

const maxMonthlyAmount = computed(() => {
  return (props.loanAmount * props.maxPercentage) / 100 / 12;
});

const visibleMonths = computed(() => {
  const months = Math.min(props.termMonths || 360, showMonths.value);
  return Array.from({ length: months }, (_, i) => i + 1);
});

const totalExtraPayments = computed(() => {
  return Object.values(props.extraPayments).reduce(
    (sum, amount) => sum + amount,
    0
  );
});

function getMonthName(monthNumber: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthNumber - 1);
  return date.toLocaleDateString("de-DE", { month: "short" });
}

function getYear(monthNumber: number): number {
  const date = new Date();
  date.setMonth(date.getMonth() + monthNumber - 1);
  return date.getFullYear();
}

function getYearlySum(year: number): number {
  return Object.entries(props.extraPayments)
    .filter(([month, _]) => getYear(Number(month)) === year)
    .reduce((sum, [_, amount]) => sum + amount, 0);
}

function remainingMonthlyLimit(month: number): number {
  const year = getYear(month);
  const yearlyUsed = getYearlySum(year);
  const yearlyLimit = (props.loanAmount * props.maxPercentage) / 100;
  const currentMonthAmount = props.extraPayments[month] || 0;
  return Math.min(
    maxMonthlyAmount.value,
    yearlyLimit - yearlyUsed + currentMonthAmount
  );
}

function isExceedingLimit(month: number): boolean {
  const year = getYear(month);
  const yearlyUsed = getYearlySum(year);
  const yearlyLimit = (props.loanAmount * props.maxPercentage) / 100;
  return yearlyUsed > yearlyLimit;
}

function updateExtraPayment(month: number, value: string) {
  const amount = Number(value) || 0;
  const newPayments = { ...props.extraPayments };

  if (amount === 0) {
    delete newPayments[month];
  } else {
    newPayments[month] = Math.min(amount, remainingMonthlyLimit(month));
  }

  emit("update:extraPayments", newPayments);
}

function setMaxPayment(month: number) {
  const maxAmount = remainingMonthlyLimit(month);
  if (maxAmount > 0) {
    updateExtraPayment(month, maxAmount.toString());
  }
}

function clearPayment(month: number) {
  updateExtraPayment(month, "0");
}

function clearAll() {
  emit("update:extraPayments", {});
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
</script>
