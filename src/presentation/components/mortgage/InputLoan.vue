<template>
  <div class="space-y-1">
    <label class="text-xs whitespace-nowrap" for="loan"
      >Loan Amount (EUR)</label
    >
    <div class="flex items-center gap-2">
      <input
        type="number"
        id="loan"
        min="50000"
        step="1000"
        name="loan"
        :value="modelValue"
        @input="$emit('update:modelValue', +$event.target.value)"
        class="rounded w-full bg-gray-300 border-none"
      />
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
