<template>
  <div class="mortgage-index-view">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Meine Darlehen</h1>
            <p class="text-gray-600 mt-2">
              Übersicht aller Immobiliendarlehen ({{
                mortgageStore.totalActiveMortgages
              }}
              aktiv)
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">
                {{
                  mortgageStore.formatCurrency(mortgageStore.totalActiveBalance)
                }}
              </div>
              <div class="text-sm text-gray-500">Gesamtrestschuld</div>
            </div>
            <RouterLink
              :to="routes.mortgages.create()"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                class="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Neues Darlehen
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Mortgages Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Active Mortgages Section -->
      <div v-if="mortgageStore.activeMortgages.length > 0" class="mb-12">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Aktive Darlehen ({{ mortgageStore.activeMortgages.length }})
        </h2>

        <div class="space-y-4">
          <div
            v-for="mortgage in mortgageStore.activeMortgages"
            :key="mortgage.id"
            class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            @click="navigateToMortgage(mortgage.id)"
          >
            <div class="p-6">
              <!-- Header Row -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                  <div
                    class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4"
                  >
                    <svg
                      class="w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ mortgage.displayName }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ mortgage.description }}
                    </p>
                    <div class="flex items-center mt-1 text-xs text-gray-500">
                      <span>{{ mortgage.propertyType }}</span>
                      <span class="mx-1">•</span>
                      <span>{{ mortgage.location }}</span>
                      <span class="mx-1">•</span>
                      <span>{{ formatDate(mortgage.startDate) }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">
                    {{ mortgageStore.formatCurrency(mortgage.currentBalance) }}
                  </div>
                  <div class="text-sm text-gray-500">verbleibend</div>
                  <div class="text-xs text-green-600 mt-1">
                    {{ mortgageStore.getMortgageProgress(mortgage) }}% getilgt
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tilgungsfortschritt</span>
                  <span
                    >{{ mortgageStore.getMortgageProgress(mortgage) }}%</span
                  >
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all duration-300"
                    :style="{
                      width: mortgageStore.getMortgageProgress(mortgage) + '%',
                    }"
                  ></div>
                </div>
              </div>

              <!-- Financial Details Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Original Loan Amount -->
                <div class="text-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-600">Ursprungssumme</div>
                  <div class="text-lg font-semibold text-gray-900">
                    {{ mortgageStore.formatCurrency(mortgage.loanAmount) }}
                  </div>
                </div>

                <!-- Already Paid -->
                <div class="text-center p-3 bg-green-50 rounded-lg">
                  <div class="text-sm text-gray-600">Bereits getilgt</div>
                  <div class="text-lg font-semibold text-green-600">
                    {{
                      mortgageStore.formatCurrency(
                        mortgage.loanAmount - mortgage.currentBalance
                      )
                    }}
                  </div>
                </div>

                <!-- Monthly Payment -->
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                  <div class="text-sm text-gray-600">Monatliche Rate</div>
                  <div class="text-lg font-semibold text-blue-600">
                    {{ mortgageStore.formatCurrency(mortgage.monthlyPayment) }}
                  </div>
                </div>

                <!-- Remaining Payments -->
                <div class="text-center p-3 bg-purple-50 rounded-lg">
                  <div class="text-sm text-gray-600">Verbl. Zahlungen</div>
                  <div class="text-lg font-semibold text-purple-600">
                    {{ calculateRemainingPayments(mortgage) }}
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                <RouterLink
                  :to="routes.mortgages.show(mortgage.id)"
                  class="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard ansehen
                </RouterLink>
                <RouterLink
                  :to="routes.mortgages.edit(mortgage.id)"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Bearbeiten
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Mortgages Section -->
      <div v-if="mortgageStore.completedMortgages.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Abbezahlte Darlehen ({{ mortgageStore.completedMortgages.length }})
        </h2>

        <div class="space-y-4">
          <div
            v-for="mortgage in mortgageStore.completedMortgages"
            :key="mortgage.id"
            class="bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow cursor-pointer"
            @click="navigateToMortgage(mortgage.id)"
          >
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div
                    class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4"
                  >
                    <svg
                      class="w-6 h-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ mortgage.displayName }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ mortgage.description }}
                    </p>
                    <div class="text-sm text-green-600 font-medium mt-1">
                      ✅ Vollständig abbezahlt
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600">
                    {{ mortgageStore.formatCurrency(mortgage.loanAmount) }}
                  </div>
                  <div class="text-sm text-gray-500">gesamt getilgt</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="mortgageStore.mortgages.length === 0"
        class="text-center py-12"
      >
        <div
          class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Keine Darlehen vorhanden
        </h3>
        <p class="text-gray-600 mb-6">
          Sie haben noch keine Darlehen angelegt. Erstellen Sie Ihr erstes
          Darlehen.
        </p>
        <RouterLink
          :to="routes.mortgages.create()"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Erstes Darlehen erstellen
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { routes } from "../../router/routes";
import { useMortgageStore } from "../../stores/mortgageStore";
import type { MortgageListItem } from "../../stores/mortgageStore";

const router = useRouter();
const mortgageStore = useMortgageStore();

// Helper functions
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "short",
  }).format(date);
}

function calculateRemainingPayments(mortgage: MortgageListItem): string {
  if (mortgage.status === "completed") return "0";

  // Simple calculation based on current balance and monthly payment
  if (mortgage.monthlyPayment <= 0) return "~";

  const remainingMonths = Math.ceil(
    mortgage.currentBalance / mortgage.monthlyPayment
  );
  const years = Math.floor(remainingMonths / 12);
  const months = remainingMonths % 12;

  if (years > 0) {
    return months > 0 ? `${years}J ${months}M` : `${years}J`;
  }
  return `${months}M`;
}

function navigateToMortgage(mortgageId: string) {
  router.push(routes.mortgages.show(mortgageId));
}

// Log for debugging
console.log(
  "📋 Mortgage Index - Available mortgages:",
  mortgageStore.mortgages.length
);
console.log(
  "💰 Total active balance:",
  mortgageStore.formatCurrency(mortgageStore.totalActiveBalance)
);
</script>

<style scoped>
.mortgage-index-view {
  min-height: 100vh;
  background-color: #f9fafb;
}
</style>
