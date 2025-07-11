<template>
  <DefaultLayout>
    <template #header>
      <PageHeader
        title="All Mortgages"
        subtitle="Manage all your mortgages across portfolios"
      >
        <template #actions>
          <RouterLink
            :to="routes.mortgages.create()"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Mortgage
          </RouterLink>
        </template>
      </PageHeader>
    </template>

    <LoadingSpinner v-if="isLoading" message="Loading mortgages..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <EmptyState
      v-else-if="mortgages.length === 0"
      title="No Mortgages Found"
      description="You haven't created any mortgages yet. Start by creating your first mortgage."
    >
      <template #icon>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </template>
      <template #actions>
        <RouterLink
          :to="routes.mortgages.create()"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Create First Mortgage
        </RouterLink>
      </template>
    </EmptyState>

    <!-- Mortgages List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="mortgage in mortgages"
        :key="mortgage.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ mortgage.name || "Unnamed Mortgage" }}
          </h3>
          <span class="text-sm text-gray-500">
            {{ mortgage.market }}
          </span>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Principal:</span>
            <span class="text-sm font-medium">{{
              formatCurrency(mortgage.principal)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Interest Rate:</span>
            <span class="text-sm font-medium"
              >{{ mortgage.interestRate }}%</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Term:</span>
            <span class="text-sm font-medium"
              >{{ mortgage.termYears }} years</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Bank:</span>
            <span class="text-sm font-medium">{{ mortgage.bank }}</span>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex space-x-3">
            <RouterLink
              :to="routes.mortgages.show(mortgage.id)"
              class="flex-1 text-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Details
            </RouterLink>
            <RouterLink
              :to="routes.mortgages.edit(mortgage.id)"
              class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Edit
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { routes } from "../router/routes";
import { DefaultLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import EmptyState from "../components/EmptyState.vue";
import { portfolioApplicationService } from "../application/services/PortfolioApplicationService";

// Mortgage interface for display
interface Mortgage {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  market: "DE" | "CH";
  bank: string;
  portfolioId?: string;
  portfolioName?: string;
}

// State
const mortgages = ref<Mortgage[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Load mortgages on mount
onMounted(async () => {
  await loadMortgages();
});

async function loadMortgages() {
  try {
    // Load all mortgages from all portfolios
    const result = await portfolioApplicationService.getAllPortfolios();

    if (result.success) {
      const allMortgages = [];
      for (const portfolio of result.data) {
        const portfolioResult =
          await portfolioApplicationService.getPortfolioWithSummary(
            portfolio.id
          );
        if (portfolioResult.success) {
          // Extract mortgages from each portfolio
          const portfolioMortgages =
            portfolioResult.data.portfolio.mortgages.map((mortgage: any) => ({
              id: mortgage.id,
              name: mortgage.name,
              principal: mortgage.principal,
              interestRate: mortgage.interestRate,
              termYears: mortgage.termYears,
              market: mortgage.market,
              bank: mortgage.bank || "Unknown Bank",
              portfolioId: portfolio.id,
              portfolioName: portfolio.name,
            }));
          allMortgages.push(...portfolioMortgages);
        }
      }
      mortgages.value = allMortgages;
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = "Failed to load mortgages";
    console.error("Mortgages loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
