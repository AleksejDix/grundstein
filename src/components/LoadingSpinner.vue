<template>
  <div class="flex justify-center items-center h-64">
    <div
      class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
    ></div>
    <p v-if="message" class="ml-3 text-gray-600">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string;
}

defineProps<Props>();
</script>
