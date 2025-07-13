<template>
  <div class="form-group">
    <div class="flex items-center justify-between mb-2">
      <label :for="inputId" class="text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <button
        v-if="lockable"
        @click="toggleLock"
        :class="[
          'p-1 transition-all',
          isLocked ? 'text-red-600' : 'text-gray-300 hover:text-gray-500',
        ]"
        :title="isLocked ? 'Unlock to edit' : 'Lock value'"
        type="button"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            v-if="isLocked"
            d="M10 2C8.895 2 8 2.895 8 4v2H6c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V8c0-1.105-.895-2-2-2h-2V4c0-1.105-.895-2-2-2z"
          />
          <path
            v-else
            d="M10 2C8.895 2 8 2.895 8 4v2H6c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V8c0-1.105-.895-2-2-2h-2V4c0-1.105-.895-2-2-2zm0 2c.552 0 1 .448 1 1v2H9V5c0-.552.448-1 1-1z"
          />
        </svg>
      </button>
    </div>

    <div class="relative">
      <!-- Decrease button -->
      <button
        v-if="showControls && !isLocked"
        @click="decrease"
        @mousedown="startContinuousChange('decrease')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
        class="absolute -left-6 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-500 p-0.5"
        type="button"
        :disabled="isLocked"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 12H4"
          />
        </svg>
      </button>

      <div class="flex items-baseline gap-1">
        <!-- Prefix (e.g., €) -->
        <span
          v-if="prefix"
          class="text-2xl font-light text-gray-500"
          aria-hidden="true"
        >
          {{ prefix }}
        </span>

        <!-- Input field -->
        <input
          v-model="internalValue"
          :id="inputId"
          :type="inputType"
          :min="min"
          :max="max"
          :step="step"
          :readonly="isLocked"
          class="flex-1 text-2xl font-light bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full"
          :class="{
            'text-gray-400': isLocked,
            'text-gray-900': !isLocked,
            'cursor-not-allowed': isLocked,
          }"
          :aria-invalid="hasError"
          :aria-describedby="hasError ? `${inputId}-error` : `${inputId}-help`"
          :placeholder="placeholder"
          :required="required"
          @input="handleInput"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />

        <!-- Suffix (e.g., %) -->
        <span v-if="suffix" class="text-sm text-gray-500" aria-hidden="true">
          {{ suffix }}
        </span>
      </div>

      <!-- Increase button -->
      <button
        v-if="showControls && !isLocked"
        @click="increase"
        @mousedown="startContinuousChange('increase')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
        class="absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-gray-500 p-0.5"
        type="button"
        :disabled="isLocked"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>

    <!-- Help text / Error message / Lock status -->
    <div class="mt-1 h-4">
      <p
        v-if="hasError && errorMessage"
        :id="`${inputId}-error`"
        class="text-xs text-red-600"
      >
        {{ errorMessage }}
      </p>
      <p v-else-if="isLocked && lockMessage" class="text-xs text-red-500">
        {{ lockMessage }}
      </p>
      <p
        v-else-if="helpText"
        :id="`${inputId}-help`"
        class="text-xs text-gray-500"
      >
        {{ helpText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  modelValue: number;
  label: string;
  labelSecondary?: string;
  inputId: string;
  inputType?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
  helpText?: string;
  lockable?: boolean;
  locked?: boolean;
  lockMessage?: string;
  showControls?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: number): void;
  (e: "update:locked", locked: boolean): void;
  (e: "input", value: number): void;
  (e: "blur", value: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  inputType: "number",
  step: 1,
  lockable: false,
  locked: false,
  showControls: true,
});

const emit = defineEmits<Emits>();

// Internal state
const internalValue = ref(props.modelValue);
const isLocked = ref(props.locked);
const continuousChangeInterval = ref<NodeJS.Timeout | null>(null);

// Computed properties
const hasError = computed(() => !!props.errorMessage);

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  },
);

watch(
  () => props.locked,
  (newLocked) => {
    isLocked.value = newLocked;
  },
);

// Methods
function handleInput() {
  if (!isLocked.value) {
    emit("update:modelValue", internalValue.value);
    emit("input", internalValue.value);
  }
}

function handleBlur() {
  emit("blur", internalValue.value);
}

function handleKeydown(event: KeyboardEvent) {
  if (isLocked.value) return;

  if (event.key === "ArrowUp") {
    event.preventDefault();
    increase();
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    decrease();
  }
}

function increase() {
  if (isLocked.value) return;

  const newValue = internalValue.value + (props.step || 1);
  if (!props.max || newValue <= props.max) {
    internalValue.value = newValue;
    handleInput();
  }
}

function decrease() {
  if (isLocked.value) return;

  const newValue = internalValue.value - (props.step || 1);
  if (!props.min || newValue >= props.min) {
    internalValue.value = newValue;
    handleInput();
  }
}

function toggleLock() {
  isLocked.value = !isLocked.value;
  emit("update:locked", isLocked.value);
}

function startContinuousChange(direction: "increase" | "decrease") {
  if (isLocked.value) return;

  // Start continuous change after a delay
  continuousChangeInterval.value = setTimeout(() => {
    continuousChangeInterval.value = setInterval(() => {
      if (direction === "increase") {
        increase();
      } else {
        decrease();
      }
    }, 100); // Change every 100ms while held down
  }, 500); // Start after 500ms hold
}

function stopContinuousChange() {
  if (continuousChangeInterval.value) {
    clearTimeout(continuousChangeInterval.value);
    clearInterval(continuousChangeInterval.value);
    continuousChangeInterval.value = null;
  }
}
</script>

<style scoped>
/* Remove number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
