<template>
  <div>
    <label for="interest">Sollzinsen</label>
    <input
      type="number"
      id="interest"
      step="0.01"
      name="interest"
      :value="modelValue"
      @input="$emit('update:modelValue', +$event.target.value)"
      class="rounded w-full"
    />
    <label for="interestrange" hidden>interest</label>
    <input
      type="range"
      id="interestrange"
      name="interestrange"
      min="0"
      step="0.01"
      max="20"
      :value="modelValue"
      @input="$emit('update:modelValue', +$event.target.value)"
      class="w-full h-1 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  </div>
</template>

<script setup lang="ts">
defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
</script>
