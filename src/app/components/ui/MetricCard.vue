<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 text-center">
    <div class="text-4xl mb-2">{{ icon }}</div>
    <h3 class="text-lg font-semibold text-gray-700 mb-2">{{ title }}</h3>
    <div class="text-2xl font-bold text-gray-900 mb-1">{{ value }}</div>
    <p class="text-sm text-gray-500">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
}>();
</script>
