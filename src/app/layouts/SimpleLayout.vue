<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <AppNavigation />

    <!-- Main Content Area -->
    <main class="max-w-5xl mx-auto px-4 py-8">
      <!-- Page Header (optional) -->
      <header v-if="$slots.header" class="mb-8">
        <slot name="header" />
      </header>

      <!-- Main Content -->
      <div class="space-y-6">
        <slot />
      </div>
    </main>

    <!-- Footer (optional) -->
    <footer v-if="showFooter" class="bg-white border-t border-gray-200 py-8 mt-16">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <p class="text-sm text-gray-500">© 2024 Grundstein - Professional Mortgage Portfolio Management</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from "../components/AppNavigation.vue";

interface Props {
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  showFooter: false,
});
</script>