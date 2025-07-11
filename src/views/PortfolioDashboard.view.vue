<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Portfolio Dashboard
            </h1>
            <p class="text-gray-500 mt-1">Manage your mortgage portfolio</p>
          </div>
          <button
            @click="showCreatePortfolio = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Create Portfolio
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800">Error: {{ error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="portfolios.length === 0"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <div class="text-center">
        <div class="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2-4h14"
            />
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
        <p class="mt-1 text-sm text-gray-500">
          Get started by creating your first portfolio.
        </p>
        <div class="mt-6">
          <button
            @click="showCreatePortfolio = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Create Portfolio
          </button>
        </div>
      </div>
    </div>

    <!-- Portfolio Grid -->
    <main v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="portfolio in portfoliosWithSummary"
          :key="portfolio.portfolio.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          @click="openPortfolio(portfolio.portfolio.id)"
        >
          <!-- Portfolio Header -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ portfolio.portfolio.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ portfolio.portfolio.owner }}
                </p>
              </div>
              <div class="flex space-x-2">
                <button
                  @click.stop="editPortfolio(portfolio.portfolio)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click.stop="deletePortfolio(portfolio.portfolio)"
                  class="text-gray-400 hover:text-red-600"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Portfolio Metrics -->
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Total Principal</p>
                <p class="text-xl font-bold text-gray-900">
                  {{ formatCurrency(portfolio.summary.totalPrincipal) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Monthly Payment</p>
                <p class="text-xl font-bold text-gray-900">
                  {{ formatCurrency(portfolio.summary.totalMonthlyPayment) }}
                </p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">
                  Avg. Interest Rate
                </p>
                <p class="text-lg font-semibold text-blue-600">
                  {{ portfolio.summary.averageInterestRate.toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">
                  Active Mortgages
                </p>
                <p class="text-lg font-semibold text-green-600">
                  {{ portfolio.summary.activeMortgages }}/{{
                    portfolio.summary.totalMortgages
                  }}
                </p>
              </div>
            </div>

            <!-- Market Distribution -->
            <div class="mt-4">
              <p class="text-sm font-medium text-gray-500 mb-2">
                Market Distribution
              </p>
              <div class="flex space-x-2">
                <div
                  v-if="portfolio.summary.marketDistribution.german > 0"
                  class="flex items-center"
                >
                  <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span class="text-xs text-gray-600"
                    >DE: {{ portfolio.summary.marketDistribution.german }}</span
                  >
                </div>
                <div
                  v-if="portfolio.summary.marketDistribution.swiss > 0"
                  class="flex items-center"
                >
                  <div class="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span class="text-xs text-gray-600"
                    >CH: {{ portfolio.summary.marketDistribution.swiss }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Optimization Indicators -->
            <div
              v-if="
                portfolio.optimization.refinancingOpportunities > 0 ||
                portfolio.optimization.highRiskMortgages > 0
              "
              class="mt-4 pt-4 border-t border-gray-100"
            >
              <div class="flex space-x-4 text-xs">
                <span
                  v-if="portfolio.optimization.refinancingOpportunities > 0"
                  class="text-amber-600"
                >
                  ⚡
                  {{ portfolio.optimization.refinancingOpportunities }}
                  refinancing opportunities
                </span>
                <span
                  v-if="portfolio.optimization.highRiskMortgages > 0"
                  class="text-red-600"
                >
                  ⚠️ {{ portfolio.optimization.highRiskMortgages }} high-risk
                  mortgages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Portfolio Modal -->
    <div
      v-if="showCreatePortfolio"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Create New Portfolio
        </h3>
        <form @submit.prevent="createPortfolio">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Portfolio Name</label
            >
            <input
              v-model="newPortfolio.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Investment Properties"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Owner</label
            >
            <input
              v-model="newPortfolio.owner"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe"
              required
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreatePortfolio = false"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isCreating"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isCreating ? "Creating..." : "Create Portfolio" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { portfolioApplicationService } from "../application/services/PortfolioApplicationService";
import type {
  MortgagePortfolio,
  PortfolioWithSummary,
} from "../application/services/PortfolioApplicationService";
import type { Money } from "../domain/types/Money";
import { toEuros } from "../domain/types/Money";

const router = useRouter();

// State
const portfolios = ref<MortgagePortfolio[]>([]);
const portfoliosWithSummary = ref<PortfolioWithSummary[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showCreatePortfolio = ref(false);
const isCreating = ref(false);

const newPortfolio = ref({
  name: "",
  owner: "",
});

// Load portfolios on mount
onMounted(async () => {
  await loadPortfolios();
});

async function loadPortfolios() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await portfolioApplicationService.getAllPortfolios();

    if (result.success) {
      portfolios.value = result.data;

      // Load summaries for each portfolio
      const summaryPromises = result.data.map(async (portfolio) => {
        const summaryResult =
          await portfolioApplicationService.getPortfolioWithSummary(
            portfolio.id
          );
        return summaryResult.success ? summaryResult.data : null;
      });

      const summaries = await Promise.all(summaryPromises);
      portfoliosWithSummary.value = summaries.filter(
        (s): s is PortfolioWithSummary => s !== null
      );
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = "Failed to load portfolios";
    console.error("Portfolio loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

async function createPortfolio() {
  if (!newPortfolio.value.name.trim() || !newPortfolio.value.owner.trim()) {
    return;
  }

  isCreating.value = true;

  try {
    const result = await portfolioApplicationService.createPortfolio({
      name: newPortfolio.value.name.trim(),
      owner: newPortfolio.value.owner.trim(),
    });

    if (result.success) {
      // Reset form
      newPortfolio.value = { name: "", owner: "" };
      showCreatePortfolio.value = false;

      // Reload portfolios
      await loadPortfolios();
    } else {
      error.value = `Failed to create portfolio: ${result.error}`;
    }
  } catch (err) {
    error.value = "Failed to create portfolio";
    console.error("Portfolio creation error:", err);
  } finally {
    isCreating.value = false;
  }
}

function openPortfolio(portfolioId: string) {
  router.push({ name: "portfolio-detail", params: { id: portfolioId } });
}

function editPortfolio(portfolio: MortgagePortfolio) {
  // TODO: Implement portfolio editing
  console.log("Edit portfolio:", portfolio.name);
}

async function deletePortfolio(portfolio: MortgagePortfolio) {
  if (confirm(`Are you sure you want to delete "${portfolio.name}"?`)) {
    try {
      const result = await portfolioApplicationService.deletePortfolio(
        portfolio.id
      );
      if (result.success) {
        await loadPortfolios();
      } else {
        error.value = `Failed to delete portfolio: ${result.error}`;
      }
    } catch (err) {
      error.value = "Failed to delete portfolio";
      console.error("Portfolio deletion error:", err);
    }
  }
}

function formatCurrency(money: Money): string {
  return `€${toEuros(money).toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
