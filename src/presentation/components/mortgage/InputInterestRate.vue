<template>
  <div class="space-y-1">
    <label class="text-xs whitespace-nowrap" for="interest"
      >Interest Rate (%)</label
    >

    <div class="flex items-center gap-2">
      <input
        type="number"
        id="interest"
        step="0.01"
        name="interest"
        :value="modelValue"
        @input="$emit('update:modelValue', +$event.target.value)"
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
