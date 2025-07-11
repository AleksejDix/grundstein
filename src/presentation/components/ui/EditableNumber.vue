<template>
  <div class="inline-block relative">
    <input
      v-if="editing"
      ref="inputRef"
      type="number"
      :value="modelValue"
      @input="updateValue"
      @blur="stopEditing"
      @keyup.enter="stopEditing"
      :min="min"
      :max="max"
      class="bg-green-100 border-2 border-green-300 rounded-lg px-3 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
      :style="{ width: String(modelValue || 0).length + 3 + 'ch' }"
    />
    <span
      v-else
      @click="startEditing"
      class="bg-green-100 hover:bg-green-200 border-2 border-green-300 rounded-lg px-3 py-1 cursor-pointer font-bold transition"
    >
      {{ formatNumber(modelValue || 0) }}{{ suffix }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

// Props
defineProps<{
  modelValue: number | undefined;
  suffix?: string;
  min?: number;
  max?: number;
}>();

// Emits
const emit = defineEmits<{
  "update:modelValue": [value: number | undefined];
}>();

// State
const editing = ref(false);
const inputRef = ref<HTMLInputElement>();

// Methods
async function startEditing() {
  editing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
}

function stopEditing() {
  editing.value = false;
}

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value ? Number(target.value) : undefined;
  emit("update:modelValue", value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE").format(value);
}
</script>
