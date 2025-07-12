<template>
  <DashboardLayout>
    <template #header>
      <PageHeader
        title="Your Financial Overview"
        subtitle="Track your mortgage portfolio, cash flow, and path to financial freedom"
      />
    </template>

    <LoadingSpinner
      v-if="isLoading"
      message="Loading your financial overview..."
    />
    <ErrorAlert v-else-if="error" :message="error" />

    <EmptyState
      v-else-if="totalPortfolios === 0"
      title="Start Your Financial Journey"
      description="Create your first portfolio or add a mortgage to begin tracking your path to financial freedom."
    >
      <template #actions>
        <div class="flex justify-center space-x-4">
          <Button
            label="Create Portfolio"
            @click="showCreatePortfolio = true"
            size="lg"
          />
          <RouterLink
            :to="routes.mortgages.create()"
            class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Add Mortgage
          </RouterLink>
        </div>
      </template>
    </EmptyState>

    <!-- Dashboard Content -->
    <template v-if="totalPortfolios > 0" #metrics>
      <MetricCard
        label="Total Debt"
        :value="formatCurrency(totalPrincipal)"
        icon-path="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
        icon-bg-color="bg-blue-100"
        icon-color="text-blue-600"
      />

      <MetricCard
        label="Monthly Payment"
        :value="formatCurrency(totalMonthlyPayment)"
        icon-path="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        icon-bg-color="bg-green-100"
        icon-color="text-green-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Avg. Rate"
        :value="`${averageRate.toFixed(2)}%`"
        icon-path="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        icon-bg-color="bg-yellow-100"
        icon-color="text-yellow-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Active Mortgages"
        :value="totalMortgages.toString()"
        icon-path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        icon-bg-color="bg-purple-100"
        icon-color="text-purple-600"
      />
    </template>

    <template v-if="totalPortfolios > 0" #quickActions>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p class="text-sm text-gray-500 mt-1">
              Manage your mortgage portfolio
            </p>
          </div>
          <div class="flex space-x-3">
            <RouterLink
              :to="routes.mortgages.create()"
              class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Add Mortgage
            </RouterLink>
            <Button
              label="Create Portfolio"
              variant="secondary"
              @click="showCreatePortfolio = true"
            />
          </div>
        </div>
      </div>
    </template>

    <template v-if="totalPortfolios > 0" #primary>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              Recent Portfolios
            </h3>
            <RouterLink
              :to="routes.portfolios.index()"
              class="text-sm text-blue-600 hover:text-blue-700"
              >View All</RouterLink
            >
          </div>
        </div>
        <div class="p-6">
          <div
            v-for="portfolio in recentPortfolios"
            :key="portfolio.portfolio.id"
            class="mb-4 last:mb-0"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">
                  {{ portfolio.portfolio.name }}
                </h4>
                <p class="text-sm text-gray-500">
                  {{ portfolio.summary.activeMortgages }} mortgages
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">
                  {{ formatCurrency(portfolio.summary.totalPrincipal) }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatCurrency(portfolio.summary.totalMonthlyPayment) }}/mo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="totalPortfolios > 0" #secondary>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Optimization Opportunities
          </h3>
        </div>
        <div class="p-6">
          <div v-if="totalOptimizations === 0" class="text-center py-8">
            <div
              class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <p class="text-gray-500">Your portfolio is optimized!</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-if="totalRefinancingOpportunities > 0"
              class="flex items-center space-x-3"
            >
              <div
                class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ totalRefinancingOpportunities }} Refinancing Opportunities
                </p>
                <p class="text-sm text-gray-500">Potential savings available</p>
              </div>
            </div>
            <div
              v-if="totalHighRiskMortgages > 0"
              class="flex items-center space-x-3"
            >
              <div
                class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{ totalHighRiskMortgages }} High-Risk Mortgages
                </p>
                <p class="text-sm text-gray-500">Consider reviewing rates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Unified Modals -->
    <Modal
      :is-open="showCreatePortfolio"
      title="Create New Portfolio"
      subtitle="Organize your mortgages into a portfolio"
      @close="showCreatePortfolio = false"
    >
      <form @submit.prevent="createPortfolio">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Portfolio Name</label
            >
            <input
              v-model="newPortfolio.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Investment Properties"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Owner</label
            >
            <input
              v-model="newPortfolio.owner"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe"
              required
            />
          </div>
        </div>
      </form>

      <template #footer>
        <Button
          label="Cancel"
          variant="secondary"
          @click="showCreatePortfolio = false"
        />
        <Button
          label="Create Portfolio"
          type="submit"
          :loading="isCreatingPortfolio"
          loading-text="Creating..."
          @click="createPortfolio"
        />
      </template>
    </Modal>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  getAllPortfolios,
  getPortfolioWithSummary,
  createPortfolio as createPortfolioInRepository,
} from "../services/application/services/PortfolioApplicationService";
import type { PortfolioWithSummary } from "../services/application/services/PortfolioApplicationService";
// Repository is handled internally by PortfolioApplicationService
import { toEuros } from "../../core/domain";
import { routes } from "../../router/routes";
import { DashboardLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import MetricCard from "../components/MetricCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import EmptyState from "../components/EmptyState.vue";
import Modal from "../components/Modal.vue";
import Button from "../components/Button.vue";

// State
const portfolios = ref<PortfolioWithSummary[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showCreatePortfolio = ref(false);
const isCreatingPortfolio = ref(false);

const newPortfolio = ref({
  name: "",
  owner: "",
});

// Computed properties
const totalPortfolios = computed(() => portfolios.value.length);
const totalPrincipal = computed(() => {
  return portfolios.value.reduce(
    (total, p) => total + toEuros(p.summary.totalPrincipal),
    0
  );
});
const totalMonthlyPayment = computed(() => {
  return portfolios.value.reduce(
    (total, p) => total + toEuros(p.summary.totalMonthlyPayment),
    0
  );
});
const averageRate = computed(() => {
  if (portfolios.value.length === 0) return 0;
  const totalRate = portfolios.value.reduce(
    (total, p) => total + p.summary.averageInterestRate,
    0
  );
  return totalRate / portfolios.value.length;
});
const totalMortgages = computed(() => {
  return portfolios.value.reduce(
    (total, p) => total + p.summary.activeMortgages,
    0
  );
});
const totalRefinancingOpportunities = computed(() => {
  return portfolios.value.reduce(
    (total, p) => total + p.optimization.refinancingOpportunities,
    0
  );
});
const totalHighRiskMortgages = computed(() => {
  return portfolios.value.reduce(
    (total, p) => total + p.optimization.highRiskMortgages,
    0
  );
});
const totalOptimizations = computed(() => {
  return totalRefinancingOpportunities.value + totalHighRiskMortgages.value;
});
const recentPortfolios = computed(() => {
  return portfolios.value.slice(0, 3);
});

// Load data on mount
onMounted(async () => {
  await loadPortfolios();
});

async function loadPortfolios() {
  isLoading.value = true;
  error.value = null;

  try {
    const result = await getAllPortfolios();

    if (result.success) {
      // Load summaries for each portfolio
      const summaryPromises = result.data.map(async (portfolio) => {
        const summaryResult = await getPortfolioWithSummary(
          portfolio.id
        );
        return summaryResult.success ? summaryResult.data : null;
      });

      const summaries = await Promise.all(summaryPromises);
      portfolios.value = summaries.filter(
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

  isCreatingPortfolio.value = true;

  try {
    const result = await createPortfolioInRepository({
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
    isCreatingPortfolio.value = false;
  }
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
