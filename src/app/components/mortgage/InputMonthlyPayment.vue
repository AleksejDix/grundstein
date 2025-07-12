<template>
  <div class="space-y-1">
    <label class="text-xs whitespace-nowrap" for="monthlyReprainment">
      Monthly Payment (EUR)
    </label>
    <div class="flex items-center gap-2">
      <input
        type="number"
        id="monthlyReprainment"
        name="monthlyReprainment"
        :value="modelValue"
        step="1"
        @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
        class="rounded w-full"
      />
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
