<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
      <p class="text-lg text-gray-600 mb-8">
        Calculate your mortgage payments and explore different scenarios
      </p>

      <div class="bg-white rounded-lg shadow p-8">
        <p class="text-gray-600 text-center">
          Welcome to the mortgage calculator. Use the navigation to explore
          different features.
        </p>

        <div class="mt-8 flex justify-center">
          <RouterLink
            to="/create"
            class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Start Calculator
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple landing page - no business logic in view layer
</script>
