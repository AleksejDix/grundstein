<template>
  <BaseLayout :show-footer="showFooter">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Detail Header -->
      <div class="mb-8">
        <slot name="header" />
      </div>

      <!-- Metrics/Stats Row -->
      <div
        v-if="$slots.metrics"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <slot name="metrics" />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Primary Content (2/3 width) -->
        <div class="lg:col-span-2">
          <slot name="primary" />
        </div>

        <!-- Sidebar Content (1/3 width) -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <slot name="sidebar" />
          </div>
        </div>
      </div>

      <!-- Full Width Section -->
      <div v-if="$slots.fullWidth" class="mt-8">
        <slot name="fullWidth" />
      </div>

      <!-- Default Content -->
      <div v-if="!$slots.primary && !$slots.sidebar">
        <slot />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from "./BaseLayout.vue";

interface Props {
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  showFooter: false,
});
</script>
