<template>
  <BaseLayout :show-footer="showFooter">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Header -->
      <div class="mb-8">
        <slot name="header" />
      </div>

      <!-- Metrics Grid -->
      <div
        v-if="$slots.metrics"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <slot name="metrics" />
      </div>

      <!-- Quick Actions -->
      <div v-if="$slots.quickActions" class="mb-8">
        <slot name="quickActions" />
      </div>

      <!-- Main Dashboard Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Primary Content -->
        <div>
          <slot name="primary" />
        </div>

        <!-- Secondary Content -->
        <div>
          <slot name="secondary" />
        </div>
      </div>

      <!-- Full Width Section -->
      <div v-if="$slots.fullWidth" class="mt-8">
        <slot name="fullWidth" />
      </div>

      <!-- Default Content -->
      <div v-if="!$slots.primary && !$slots.secondary">
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
