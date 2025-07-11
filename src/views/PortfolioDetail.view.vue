<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-gray-500 hover:text-gray-700">
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ portfolio?.name || "Portfolio Details" }}
              </h1>
              <p class="text-gray-500 mt-1">{{ portfolio?.owner }}</p>
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showAddMortgage = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Mortgage
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading/Error States -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">Error: {{ error }}</p>
      </div>
    </div>

    <!-- Portfolio Content -->
    <main
      v-else-if="portfolioData"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <!-- Portfolio Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-500">Total Principal</h3>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(portfolioData.summary.totalPrincipal) }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-500">Monthly Payment</h3>
          <p class="text-2xl font-bold text-gray-900 mt-2">
            {{ formatCurrency(portfolioData.summary.totalMonthlyPayment) }}
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-500">Avg. Interest Rate</h3>
          <p class="text-2xl font-bold text-blue-600 mt-2">
            {{ portfolioData.summary.averageInterestRate.toFixed(2) }}%
          </p>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-sm font-medium text-gray-500">Active Mortgages</h3>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {{ portfolioData.summary.activeMortgages }}
          </p>
        </div>
      </div>

      <!-- Mortgages Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Mortgages</h2>
        </div>

        <div
          v-if="portfolio.mortgages.length === 0"
          class="px-6 py-12 text-center"
        >
          <p class="text-gray-500">No mortgages in this portfolio.</p>
          <button
            @click="showAddMortgage = true"
            class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add First Mortgage
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Bank
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rate
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Market
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="mortgage in portfolio.mortgages"
                :key="mortgage.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ mortgage.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(mortgage.startDate) }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ mortgage.bank }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ formatCurrency(mortgage.configuration.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ (mortgage.configuration.annualRate * 100).toFixed(2) }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(mortgage.configuration.monthlyPayment) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="
                      mortgage.market === 'DE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    "
                  >
                    {{ mortgage.market }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="
                      mortgage.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    "
                  >
                    {{ mortgage.isActive ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editMortgage(mortgage)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteMortgage(mortgage)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add Mortgage Modal Placeholder -->
    <div
      v-if="showAddMortgage"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Add New Mortgage
        </h3>
        <p class="text-gray-600 mb-4">
          Mortgage creation form will be implemented here.
        </p>
        <div class="flex justify-end">
          <button
            @click="showAddMortgage = false"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { portfolioApplicationService } from "../application/services/PortfolioApplicationService";
import type {
  MortgagePortfolio,
  PortfolioWithSummary,
  MortgageEntry,
} from "../application/services/PortfolioApplicationService";
import type { Money } from "../domain/types/Money";
import { toEuros } from "../domain/types/Money";

const route = useRoute();
const router = useRouter();

// State
const portfolio = ref<MortgagePortfolio | null>(null);
const portfolioData = ref<PortfolioWithSummary | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showAddMortgage = ref(false);

// Load portfolio on mount
onMounted(async () => {
  const portfolioId = route.params.id as string;
  if (portfolioId) {
    await loadPortfolio(portfolioId);
  }
});

async function loadPortfolio(portfolioId: string) {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await portfolioApplicationService.getPortfolioWithSummary(
      portfolioId
    );

    if (result.success) {
      portfolioData.value = result.data;
      portfolio.value = result.data.portfolio;
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = "Failed to load portfolio";
    console.error("Portfolio loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push({ name: "portfolio" });
}

function editMortgage(mortgage: MortgageEntry) {
  // TODO: Implement mortgage editing
  console.log("Edit mortgage:", mortgage.name);
}

async function deleteMortgage(mortgage: MortgageEntry) {
  if (confirm(`Are you sure you want to delete "${mortgage.name}"?`)) {
    try {
      const result = await portfolioApplicationService.removeMortgage(
        portfolio.value!.id,
        mortgage.id
      );
      if (result.success) {
        await loadPortfolio(portfolio.value!.id);
      } else {
        error.value = `Failed to delete mortgage: ${result.error}`;
      }
    } catch (err) {
      error.value = "Failed to delete mortgage";
      console.error("Mortgage deletion error:", err);
    }
  }
}

function formatCurrency(money: Money): string {
  return `€${toEuros(money).toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
</script>
