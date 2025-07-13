<template>
  <div class="form-group">
    <label
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
      <button
        v-if="lockable"
        @click="toggleLock"
        :class="[
          'ml-2 p-1 rounded text-xs transition-colors',
          isLocked 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
        :title="isLocked ? 'Unlock to edit' : 'Lock value'"
        type="button"
      >
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="isLocked" d="M10 2C8.895 2 8 2.895 8 4v2H6c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V8c0-1.105-.895-2-2-2h-2V4c0-1.105-.895-2-2-2z"/>
          <path v-else d="M10 2C8.895 2 8 2.895 8 4v2H6c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V8c0-1.105-.895-2-2-2h-2V4c0-1.105-.895-2-2-2zm0 2c.552 0 1 .448 1 1v2H9V5c0-.552.448-1 1-1z"/>
        </svg>
      </button>
    </label>
    
    <div class="relative">
      <!-- Decrease button -->
      <button
        v-if="showControls && !isLocked"
        @click="decrease"
        @mousedown="startContinuousChange('decrease')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
        type="button"
        :disabled="isLocked"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 10h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Prefix (e.g., €) -->
      <span
        v-if="prefix"
        class="absolute top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
        :class="showControls && !isLocked ? 'left-8' : 'left-3'"
        aria-hidden="true"
      >
        {{ prefix }}
      </span>

      <!-- Input field -->
      <input
        :id="inputId"
        v-model.number="internalValue"
        :type="inputType"
        :min="min"
        :max="max"
        :step="step"
        :readonly="isLocked"
        class="w-full py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors"
        :class="[
          {
            'border-red-500 focus:ring-red-500': hasError,
            'bg-red-50': isLocked,
            'cursor-not-allowed': isLocked
          },
          showControls && !isLocked ? 'pl-12' : prefix ? 'pl-8' : 'pl-4',
          showControls && !isLocked ? 'pr-12' : suffix ? 'pr-8' : 'pr-4'
        ]"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : `${inputId}-help`"
        :placeholder="placeholder"
        :required="required"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Suffix (e.g., %) -->
      <span
        v-if="suffix"
        class="absolute top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
        :class="showControls && !isLocked ? 'right-8' : 'right-3'"
        aria-hidden="true"
      >
        {{ suffix }}
      </span>

      <!-- Increase button -->
      <button
        v-if="showControls && !isLocked"
        @click="increase"
        @mousedown="startContinuousChange('increase')"
        @mouseup="stopContinuousChange"
        @mouseleave="stopContinuousChange"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
        type="button"
        :disabled="isLocked"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p
      v-if="hasError && errorMessage"
      :id="`${inputId}-error`"
      class="mt-1 text-sm text-red-600"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </p>

    <!-- Help text -->
    <p
      v-if="!hasError && helpText"
      :id="`${inputId}-help`"
      class="mt-1 text-sm text-gray-500"
    >
      {{ helpText }}
    </p>

    <!-- Lock status indicator -->
    <p
      v-if="isLocked && lockMessage"
      class="mt-1 text-sm text-red-600 flex items-center"
    >
      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2C8.895 2 8 2.895 8 4v2H6c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2h8c1.105 0 2-.895 2-2V8c0-1.105-.895-2-2-2h-2V4c0-1.105-.895-2-2-2z"/>
      </svg>
      {{ lockMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: number
  label: string
  inputId: string
  inputType?: string
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  placeholder?: string
  required?: boolean
  errorMessage?: string
  helpText?: string
  lockable?: boolean
  locked?: boolean
  lockMessage?: string
  showControls?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'update:locked', locked: boolean): void
  (e: 'input', value: number): void
  (e: 'blur', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  inputType: 'number',
  step: 1,
  lockable: false,
  locked: false,
  showControls: true
})

const emit = defineEmits<Emits>()

// Internal state
const internalValue = ref(props.modelValue)
const isLocked = ref(props.locked)
const continuousChangeInterval = ref<NodeJS.Timeout | null>(null)

// Computed properties
const hasError = computed(() => !!props.errorMessage)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

watch(() => props.locked, (newLocked) => {
  isLocked.value = newLocked
})

// Methods
function handleInput() {
  if (!isLocked.value) {
    emit('update:modelValue', internalValue.value)
    emit('input', internalValue.value)
  }
}

function handleBlur() {
  emit('blur', internalValue.value)
}

function handleKeydown(event: KeyboardEvent) {
  if (isLocked.value) return
  
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    increase()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrease()
  }
}

function increase() {
  if (isLocked.value) return
  
  const newValue = internalValue.value + (props.step || 1)
  if (!props.max || newValue <= props.max) {
    internalValue.value = newValue
    handleInput()
  }
}

function decrease() {
  if (isLocked.value) return
  
  const newValue = internalValue.value - (props.step || 1)
  if (!props.min || newValue >= props.min) {
    internalValue.value = newValue
    handleInput()
  }
}

function toggleLock() {
  isLocked.value = !isLocked.value
  emit('update:locked', isLocked.value)
}

function startContinuousChange(direction: 'increase' | 'decrease') {
  if (isLocked.value) return
  
  // Start continuous change after a delay
  continuousChangeInterval.value = setTimeout(() => {
    continuousChangeInterval.value = setInterval(() => {
      if (direction === 'increase') {
        increase()
      } else {
        decrease()
      }
    }, 100) // Change every 100ms while held down
  }, 500) // Start after 500ms hold
}

function stopContinuousChange() {
  if (continuousChangeInterval.value) {
    clearTimeout(continuousChangeInterval.value)
    clearInterval(continuousChangeInterval.value)
    continuousChangeInterval.value = null
  }
}
</script>