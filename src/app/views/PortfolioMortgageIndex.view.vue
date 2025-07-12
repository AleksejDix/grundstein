<template>
  <PageLayout>
    <LoadingSpinner v-if="isLoading" message="Loading portfolio mortgages..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else>
      <PageHeader
        :title="`${portfolio?.name || 'Portfolio'} - Mortgages`"
        :subtitle="`Manage mortgages in ${portfolio?.name || 'this portfolio'}`"
      >
        <template #actions>
          <RouterLink
            :to="routes.portfolios.mortgages.create(portfolioId)"
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

      <EmptyState
        v-if="mortgages.length === 0"
        title="No Mortgages in Portfolio"
        description="This portfolio doesn't have any mortgages yet. Add your first mortgage to get started."
      >
        <template #actions>
          <RouterLink
            :to="routes.portfolios.mortgages.create(portfolioId)"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            Add First Mortgage
          </RouterLink>
        </template>
      </EmptyState>

      <!-- Mortgages Grid -->
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
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { routes } from "../../router/routes";
import PageLayout from "../components/PageLayout.vue";
import PageHeader from "../components/PageHeader.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import EmptyState from "../components/EmptyState.vue";

// Mock data structures - replace with actual domain types
interface Portfolio {
  id: string;
  name: string;
  owner: string;
}

interface Mortgage {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  market: "DE" | "CH";
  bank: string;
}

const route = useRoute();
const portfolioId = route.params.portfolioId as string;

// State
const portfolio = ref<Portfolio | null>(null);
const mortgages = ref<Mortgage[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Load data on mount
onMounted(async () => {
  await loadPortfolioMortgages();
});

async function loadPortfolioMortgages() {
  try {
    // TODO: Replace with actual API calls
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    portfolio.value = {
      id: portfolioId,
      name: "Investment Properties",
      owner: "John Doe",
    };

    mortgages.value = [
      {
        id: "1",
        name: "Property A",
        principal: 250000,
        interestRate: 3.5,
        termYears: 25,
        market: "DE",
        bank: "Commerzbank",
      },
      {
        id: "2",
        name: "Property B",
        principal: 180000,
        interestRate: 2.8,
        termYears: 20,
        market: "DE",
        bank: "Commerzbank",
      },
    ];
  } catch (err) {
    error.value = "Failed to load portfolio mortgages";
    console.error("Portfolio mortgages loading error:", err);
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
