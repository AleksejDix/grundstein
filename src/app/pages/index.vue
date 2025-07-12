<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          German Mortgage Calculator
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          Professional mortgage calculations with German banking features.
          Calculate your monthly payments, explore Sondertilgung options, and
          optimize your mortgage strategy.
        </p>
      </div>

      <!-- Calculator Component -->
      <MortgageCalculatorForm />

      <!-- Features Section -->
      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div
            class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Professional Calculations
          </h3>
          <p class="text-gray-600">
            Powered by 400+ tested calculation functions for accuracy you can
            trust
          </p>
        </div>

        <div class="text-center">
          <div
            class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            German Market Focus
          </h3>
          <p class="text-gray-600">
            Sondertilgung planning, Tilgungsrate calculations, and BaFin
            compliance
          </p>
        </div>

        <div class="text-center">
          <div
            class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Real-time Results
          </h3>
          <p class="text-gray-600">
            Instant calculations with live updates as you adjust your parameters
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MortgageCalculatorForm from "../components/mortgage/MortgageCalculatorForm.vue";
</script>
