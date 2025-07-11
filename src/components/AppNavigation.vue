<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <RouterLink
            :to="routes.dashboard.index()"
            class="flex items-center space-x-3"
          >
            <div
              class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.95-.45 3.73-1.28 5.31-2.38C19.77 17 22 13.55 22 9V7l-10-5z"
                />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">Grundstein</span>
          </RouterLink>
        </div>
        <div class="flex items-center space-x-6">
          <RouterLink
            :to="routes.dashboard.index()"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            :class="{
              'text-blue-600 font-medium': currentRoute === 'dashboard',
            }"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            :to="routes.portfolios.index()"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            :class="{
              'text-blue-600 font-medium': currentRoute === 'portfolios',
            }"
          >
            Portfolios
          </RouterLink>

          <RouterLink
            :to="routes.mortgages.index()"
            class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            :class="{
              'text-blue-600 font-medium': currentRoute === 'mortgages',
            }"
          >
            Darlehen
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { routes } from "../router/routes";

const route = useRoute();

const currentRoute = computed(() => {
  const name = route.name as string;
  if (name?.startsWith("dashboard")) return "dashboard";
  if (name?.startsWith("portfolios")) return "portfolios";
  if (name?.startsWith("mortgages")) return "mortgages";
  return "";
});
</script>
