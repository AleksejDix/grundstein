<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Navigation -->
    <AppNavigation />

    <!-- Main Content Area -->
    <main class="relative">
      <slot />
    </main>

    <!-- Footer (optional) -->
    <footer v-if="showFooter" class="bg-white border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-6">
            <span class="text-sm text-gray-500">© 2024 Grundstein</span>
            <span class="text-sm text-gray-500"
              >Professional Mortgage Portfolio Management</span
            >
          </div>
          <div class="flex items-center space-x-4">
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700"
              >Privacy</a
            >
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700"
              >Terms</a
            >
            <a href="#" class="text-sm text-gray-500 hover:text-gray-700"
              >Support</a
            >
          </div>
        </div>
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
