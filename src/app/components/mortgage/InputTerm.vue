<template>
  <div class="space-y-1">
    <label class="text-xs whitespace-nowrap" for="term">Term (Months)</label>
    <div class="flex items-center gap-2">
      <input
        type="number"
        id="term"
        name="term"
        :value="modelValue"
        @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)"
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
