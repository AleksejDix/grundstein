<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8">
        <RouterLink
          to="/"
          class="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back
        </RouterLink>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Create New Mortgage
        </h1>
        <p class="text-lg text-gray-600">Add a new mortgage to track</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 text-center">
          Mortgage creation form would go here.
        </p>
        <p class="text-gray-500 text-center text-sm mt-2">
          This page would contain a form to create new mortgages.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple page - no business logic
</script>
