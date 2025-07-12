<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgage Calculator</h1>
      <p class="text-lg text-gray-600 mb-8">
        Calculate your mortgage payments and track your path to being debt-free
      </p>

      <div class="text-center py-12 bg-white rounded-lg shadow">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to Grundstein
        </h2>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto px-4">
          Start by creating a mortgage to see payment schedules, amortization tables, 
          and understand how extra payments can help you become debt-free faster.
        </p>
        
        <RouterLink
          :to="routes.create()"
          class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Create New Mortgage
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { routes } from "../../router/routes";
</script>