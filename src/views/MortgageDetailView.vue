<template>
  <div class="mortgage-detail-view">
    <!-- Page header -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Breadcrumb Navigation -->
        <nav class="mb-4">
          <ol class="flex items-center space-x-2 text-blue-100">
            <li>
              <RouterLink
                :to="routes.mortgages.index()"
                class="hover:text-white transition-colors"
              >
                Darlehen
              </RouterLink>
            </li>
            <li>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </li>
            <li class="text-white font-medium">
              {{ getMortgageDisplayName(mortgageId) }}
            </li>
          </ol>
        </nav>

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              {{ getMortgageDisplayName(mortgageId) }}
            </h1>
            <p class="text-blue-100">
              {{ getMortgageDescription(mortgageId) }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-sm text-blue-100">Letztes Update</div>
            <div class="text-lg font-semibold">
              {{ formatDate(new Date()) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main dashboard content -->
    <div class="bg-gray-50 min-h-screen">
      <MortgageDetailDashboard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import MortgageDetailDashboard from "../components/MortgageDetailDashboard.vue";
import { routes } from "../router/routes";
import { useMortgageStore } from "../stores/mortgageStore";

// Get route parameters and store
const route = useRoute();
const mortgageStore = useMortgageStore();
const mortgageId = computed(() => route.params.id as string | undefined);

// Get mortgage data from store
const mortgageData = computed(() => {
  if (!mortgageId.value) return null;
  return mortgageStore.getMortgageById(mortgageId.value);
});

// Helper functions
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getMortgageDisplayName(id: string | undefined): string {
  if (!id) return "Unbekanntes Darlehen";

  const mortgage = mortgageStore.getMortgageById(id);
  if (mortgage) {
    return mortgage.displayName;
  }

  return `Darlehen ${id}`;
}

function getMortgageDescription(id: string | undefined): string {
  if (!id) return "Darlehensdaten nicht verfügbar";

  const mortgage = mortgageStore.getMortgageById(id);
  if (mortgage) {
    const statusText =
      mortgage.status === "completed"
        ? " • Vollständig abbezahlt"
        : mortgage.status === "active"
        ? ` • Darlehen seit ${mortgage.startDate.getFullYear()}`
        : "";
    return `${mortgage.description}${statusText}`;
  }

  return `Detaillierte Analyse für Darlehen ${id}`;
}

// Set selected mortgage in store and log for debugging
onMounted(() => {
  if (mortgageId.value) {
    mortgageStore.setSelectedMortgage(mortgageId.value);
    console.log("📍 Mortgage Show Route - ID:", mortgageId.value);
    console.log("🏠 Mortgage Data:", mortgageData.value);
  }
});
</script>

<style scoped>
.mortgage-detail-view {
  @apply min-h-screen bg-gray-50;
}
</style>
