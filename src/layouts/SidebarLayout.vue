<template>
  <BaseLayout :show-footer="showFooter">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-8">
            <slot name="sidebar" />
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <slot />
        </div>
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
