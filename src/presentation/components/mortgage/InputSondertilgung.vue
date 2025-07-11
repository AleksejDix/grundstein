<template>
  <div class="space-y-1">
    <label class="text-xs whitespace-nowrap" for="sondertilgung">
      Max. Sondertilgung (%)
    </label>

    <div class="flex items-center gap-2">
      <select
        id="sondertilgung"
        :value="modelValue"
        @change="
          $emit(
            'update:modelValue',
            Number(($event.target as HTMLSelectElement).value)
          )
        "
        class="rounded w-full bg-gray-300 border-none p-2"
      >
        <option value="5">5% ({{ formatCurrency(maxAmount(5)) }}/Jahr)</option>
        <option value="10">
          10% ({{ formatCurrency(maxAmount(10)) }}/Jahr)
        </option>
        <option value="20">
          20% ({{ formatCurrency(maxAmount(20)) }}/Jahr)
        </option>
        <option value="50">
          50% ({{ formatCurrency(maxAmount(50)) }}/Jahr)
        </option>
        <option value="100">100% (unbegrenzt)</option>
      </select>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
  loanAmount: number;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();

function maxAmount(percentage: number): number {
  return (props.loanAmount * percentage) / 100;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
</script>
