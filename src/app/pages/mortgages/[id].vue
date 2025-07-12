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

        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mortgage Details</h1>
        <p class="text-lg text-gray-600">
          View and manage mortgage information
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600 text-center">
          Mortgage ID: {{ route.params.id }}
        </p>
        <p class="text-gray-500 text-center text-sm mt-2">
          This page would show mortgage details when connected to data.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>
