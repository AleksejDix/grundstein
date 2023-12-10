<template>
  <input
    ref="input"
    class="font-mono text-left"
    id="pv"
    name="pv"
    :type="isFocused ? 'number' : 'text'"
    :value="
      isFocused
        ? Number(Number(modelValue).toFixed(2))
        : currency.format(modelValue)
    "
    min="0"
    step="0"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @input="updateModelValue"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { currency } from "@/formatters/currency";

defineProps(["modelValue"]);
const emits = defineEmits(["update:modelValue"]);

const input = ref();
const isFocused = ref(false);

function updateModelValue(event: Event) {
  emits("update:modelValue", +(event.target as HTMLInputElement).value);
}
</script>

<style scoped>
label {
  @apply uppercase text-xs font-bold tracking-wider text-right pb-2;
}

input[type="text"],
input[type="number"] {
  display: inline-block;
  text-align: right;
  padding: 0;
  margin: 0;
  line-height: 40px;
  width: 100%;
  @apply border-b bg-transparent border-transparent border-t-zinc-900;
}

input:focus-visible,
input:focus {
  border-color: black;
  outline: none !important;
  box-shadow: none !important;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
