<template>
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ title }}</h1>
      <p v-if="subtitle" class="text-lg text-gray-600">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex space-x-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>
