<template>
  <BaseLayout :show-footer="showFooter">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Form Header -->
      <div class="text-center mb-8">
        <slot name="header" />
      </div>

      <!-- Form Content -->
      <div class="bg-white rounded-2xl shadow-xl">
        <!-- Form Title Bar -->
        <div v-if="$slots.titleBar" class="px-8 py-6 border-b border-gray-200">
          <slot name="titleBar" />
        </div>

        <!-- Form Body -->
        <div class="p-8">
          <slot />
        </div>

        <!-- Form Footer -->
        <div v-if="$slots.footer" class="px-8 py-6 border-t border-gray-200">
          <slot name="footer" />
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
