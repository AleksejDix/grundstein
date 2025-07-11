<template>
  <div class="text-center py-16">
    <div class="mx-auto h-24 w-24 text-gray-400 mb-6">
      <slot name="icon">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </slot>
    </div>
    <h3 class="text-2xl font-semibold text-gray-900 mb-4">{{ title }}</h3>
    <p class="text-gray-500 mb-8 max-w-md mx-auto">{{ description }}</p>
    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
}

defineProps<Props>();
</script>
