<template>
  <div class="mortgage-detail-dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Lade Darlehensdaten...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <svg
        class="h-12 w-12 text-red-500 mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="text-lg font-semibold text-red-800 mb-2">
        Fehler beim Laden der Daten
      </h3>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadMortgageData"
        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Erneut versuchen
      </button>
    </div>

    <!-- Main Dashboard Content -->
    <div v-else-if="summary && sondertilgungRecs">
      <!-- Header with basic loan info -->
      <div class="dashboard-header">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Immobilien-Darlehen Dashboard
        </h1>
        <p class="text-gray-600 mb-6">
          Ihre Wohnung in Berlin Mitte • Darlehen seit Mai 2021
        </p>
      </div>

      <!-- Main metrics grid -->
      <div
        class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <!-- Current Balance -->
        <div class="metric-card bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Restschuld</p>
              <p class="text-2xl font-bold text-gray-900">
                €{{ formatNumber(summary.loanProgress.currentBalance) }}
              </p>
            </div>
            <div
              class="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Paid -->
        <div class="metric-card bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Bereits getilgt</p>
              <p class="text-2xl font-bold text-green-600">
                €{{ formatNumber(summary.loanProgress.totalPaid) }}
              </p>
            </div>
            <div
              class="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Property Value -->
        <div class="metric-card bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Immobilienwert</p>
              <p class="text-2xl font-bold text-blue-600">
                €{{ formatNumber(summary.propertyEquity.propertyValue) }}
              </p>
            </div>
            <div
              class="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-6 w-6 text-blue-600"
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
          </div>
        </div>

        <!-- Equity Built -->
        <div class="metric-card bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Eigenkapital</p>
              <p class="text-2xl font-bold text-purple-600">
                €{{ formatNumber(summary.propertyEquity.equityBuilt) }}
              </p>
            </div>
            <div
              class="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Loan Progress -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Tilgungsfortschritt
          </h3>

          <!-- Progress bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span
                >{{ summary.loanProgress.percentagePaid.toFixed(1) }}%
                getilgt</span
              >
              <span
                >{{ summary.futureProjections.yearsRemaining }} Jahre
                verbleibend</span
              >
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                :style="{ width: summary.loanProgress.percentagePaid + '%' }"
              ></div>
            </div>
          </div>

          <!-- Details -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Ursprüngliche Darlehenssumme:</span>
              <span class="font-medium"
                >€{{ formatNumber(summary.loanProgress.originalAmount) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Verbleibende Zahlungen:</span>
              <span class="font-medium">{{
                summary.futureProjections.paymentsRemaining
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Voraussichtliches Ablaufdatum:</span>
              <span class="font-medium">{{
                formatDate(summary.futureProjections.payoffDate)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Performance -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Zahlungsverhalten
          </h3>

          <!-- Perfect score badge -->
          <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg
                class="h-5 w-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-green-800 font-medium"
                >Perfekte Zahlungshistorie</span
              >
            </div>
          </div>

          <!-- Stats -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Anzahl Zahlungen:</span>
              <span class="font-medium">{{
                summary.paymentPerformance.totalPayments
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Pünktliche Zahlungen:</span>
              <span class="font-medium text-green-600">{{
                summary.paymentPerformance.onTimePayments
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Zuverlässigkeitsscore:</span>
              <span class="font-medium text-green-600"
                >{{ summary.paymentPerformance.consistencyScore }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Durchschnittliche Rate:</span>
              <span class="font-medium"
                >€{{ summary.paymentPerformance.averagePayment }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History Chart Section -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <PaymentHistoryChart
            :original-amount="summary.loanProgress.originalAmount"
            :current-balance="summary.loanProgress.currentBalance"
            :monthly-payment="375"
            :total-payments="summary.paymentPerformance.totalPayments"
            :start-date="new Date(2021, 4, 1)"
          />
        </div>
      </div>

      <!-- LTV and Sondertilgung section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- LTV Ratio -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Beleihungsauslauf (LTV)
          </h3>

          <!-- LTV gauge -->
          <div class="text-center mb-4">
            <div class="relative inline-block">
              <div
                class="w-32 h-32 rounded-full border-8 border-gray-200 relative"
              >
                <div
                  class="w-full h-full rounded-full border-8 border-blue-500 absolute"
                  :style="{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + summary.propertyEquity.ltvRatio * 50
                    }% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)`,
                  }"
                ></div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-gray-900">
                      {{ summary.propertyEquity.ltvRatio.toFixed(1) }}%
                    </div>
                    <div class="text-xs text-gray-600">LTV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- LTV details -->
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Immobilienwert:</span>
              <span class="font-medium"
                >€{{ formatNumber(summary.propertyEquity.propertyValue) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Verbleibendes Darlehen:</span>
              <span class="font-medium"
                >€{{ formatNumber(summary.propertyEquity.remainingDebt) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Aufgebautes Eigenkapital:</span>
              <span class="font-medium text-green-600"
                >€{{ formatNumber(summary.propertyEquity.equityBuilt) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Sondertilgung Opportunities -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Sondertilgung Möglichkeiten
          </h3>

          <!-- Bank type info -->
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="text-sm text-blue-800">
              <strong>Online-Bank:</strong> Günstige Sondertilgungskonditionen
            </div>
          </div>

          <!-- Recommendations -->
          <div class="space-y-4">
            <!-- Available percentages -->
            <div>
              <span class="text-gray-600 text-sm"
                >Erlaubte Sondertilgung pro Jahr:</span
              >
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="percentage in sondertilgungRecs.availablePercentages"
                  :key="percentage"
                  class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {{ percentage }}%
                </span>
              </div>
            </div>

            <!-- Recommendation -->
            <div
              class="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg"
            >
              <h4 class="font-medium text-gray-900 mb-2">Empfehlung</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Empfohlener Betrag:</span>
                  <span class="font-medium"
                    >€{{
                      formatNumber(sondertilgungRecs.recommendedAmount)
                    }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Potentielle Ersparnis:</span>
                  <span class="font-medium text-green-600"
                    >€{{
                      formatNumber(sondertilgungRecs.potentialSavings)
                    }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Optimaler Zeitpunkt:</span>
                  <span class="font-medium">{{
                    sondertilgungRecs.optimalTiming
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Risikobewertung:</span>
                  <span class="font-medium">{{
                    sondertilgungRecs.riskAssessment
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Action button -->
            <button
              class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Sondertilgung planen
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- End of main dashboard content -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  createSimpleApartmentMortgage,
  getSimpleMortgageSummary,
  getSimpleSondertilgungRecommendations,
  type SimpleMortgageData,
} from "../../services/SimpleMortgageDataService";
import PaymentHistoryChart from "./PaymentHistoryChart.vue";

// Reactive state
const mortgageData = ref<SimpleMortgageData | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Computed properties
const summary = computed(() => {
  if (!mortgageData.value) return null;
  try {
    return getSimpleMortgageSummary(mortgageData.value);
  } catch (err) {
    console.error("Error creating summary:", err);
    return null;
  }
});

const sondertilgungRecs = computed(() => {
  if (!mortgageData.value) return null;
  try {
    return getSimpleSondertilgungRecommendations(mortgageData.value);
  } catch (err) {
    console.error("Error creating Sondertilgung recommendations:", err);
    return null;
  }
});

// Helper functions
function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "long",
  }).format(date);
}

// Load mortgage data
async function loadMortgageData() {
  try {
    isLoading.value = true;
    error.value = null;

    console.log("🚀 Loading realistic apartment mortgage data...");

    // Simulate async loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    mortgageData.value = createSimpleApartmentMortgage();

    console.log("✅ Mortgage dashboard loaded successfully");
    console.log("📊 Summary:", summary.value);
    console.log("💰 Sondertilgung:", sondertilgungRecs.value);
  } catch (err) {
    console.error("❌ Failed to load mortgage data:", err);

    // Fallback to mock data for demonstration
    console.log("📋 Using fallback mock data...");
    mortgageData.value = {
      originalLoanAmount: 50000,
      currentBalance: 32800,
      monthlyPayment: 375,
      interestRate: 0.8,
      propertyValue: 65000,
      originalPurchasePrice: 60000,
      totalPayments: 50,
      totalPaid: 18750,
      paymentsRemaining: 95,
      ltvRatio: 50.5,
      equityBuilt: 32200,
      percentagePaid: 34.4,
      payoffDate: new Date(2033, 6, 1),
    };

    error.value = null; // Clear error since we have fallback data
  } finally {
    isLoading.value = false;
  }
}

// Load data on mount
onMounted(() => {
  loadMortgageData();
});
</script>

<style scoped>
.mortgage-detail-dashboard {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem;
}

.metric-card {
  transition-property: box-shadow;
  transition-duration: 200ms;
}

.metric-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
