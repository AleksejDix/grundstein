<template>
  <PageLayout>
    <div class="max-w-4xl mx-auto">
      <PageHeader
        title="Add Mortgage to Portfolio"
        :subtitle="`Create a new mortgage for ${
          portfolio?.name || 'this portfolio'
        }`"
      />

      <LoadingSpinner v-if="isLoading" message="Loading portfolio..." />
      <ErrorAlert v-else-if="error" :message="error" />

      <!-- Form -->
      <div v-else class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="createMortgage">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Input Section -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Mortgage Details
              </h2>

              <!-- Mortgage Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mortgage Name
                </label>
                <input
                  v-model="mortgageForm.name"
                  type="text"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Investment Property A"
                  required
                />
              </div>

              <!-- Loan Amount -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >€</span
                  >
                  <input
                    v-model.number="mortgageForm.principal"
                    type="number"
                    class="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="300,000"
                    required
                  />
                </div>
              </div>

              <!-- Interest Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Annual Interest Rate
                </label>
                <div class="relative">
                  <input
                    v-model.number="mortgageForm.interestRate"
                    type="number"
                    step="0.01"
                    class="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3.5"
                    required
                  />
                  <span
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >%</span
                  >
                </div>
              </div>

              <!-- Loan Term -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Loan Term
                </label>
                <div class="relative">
                  <input
                    v-model.number="mortgageForm.termYears"
                    type="number"
                    class="w-full pr-16 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                    required
                  />
                  <span
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >years</span
                  >
                </div>
              </div>

              <!-- Market -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Market
                </label>
                <select
                  v-model="mortgageForm.market"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="DE">Germany (DE)</option>
                  <option value="CH">Switzerland (CH)</option>
                </select>
              </div>

              <!-- Bank -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bank/Lender
                </label>
                <input
                  v-model="mortgageForm.bank"
                  type="text"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Deutsche Bank"
                  required
                />
              </div>
            </div>

            <!-- Portfolio Info Section -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Portfolio Information
              </h2>

              <div class="bg-blue-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">
                  Adding to Portfolio
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-blue-700">Portfolio Name:</span>
                    <span class="text-sm font-medium text-blue-900">{{
                      portfolio?.name
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-blue-700">Owner:</span>
                    <span class="text-sm font-medium text-blue-900">{{
                      portfolio?.owner
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Mortgage Summary
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Principal:</span>
                    <span class="text-sm font-medium">{{
                      formatCurrency(mortgageForm.principal)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Interest Rate:</span>
                    <span class="text-sm font-medium"
                      >{{ mortgageForm.interestRate }}%</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Term:</span>
                    <span class="text-sm font-medium"
                      >{{ mortgageForm.termYears }} years</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Market:</span>
                    <span class="text-sm font-medium">{{
                      mortgageForm.market
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-4 pt-8 mt-8 border-t border-gray-200">
            <RouterLink
              :to="routes.portfolios.mortgages.index(portfolioId)"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </RouterLink>
            <Button
              type="submit"
              label="Add to Portfolio"
              size="lg"
              class="flex-1"
              :loading="isCreating"
              loading-text="Adding..."
            />
          </div>
        </form>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../../router/routes";
import PageLayout from "../components/PageLayout.vue";
import PageHeader from "../components/PageHeader.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import Button from "../components/Button.vue";

// Mock data structures - replace with actual domain types
interface Portfolio {
  id: string;
  name: string;
  owner: string;
}

const route = useRoute();
const router = useRouter();
const portfolioId = route.params.portfolioId as string;

// State
const portfolio = ref<Portfolio | null>(null);
const isLoading = ref(true);
const isCreating = ref(false);
const error = ref<string | null>(null);

// Form state
const mortgageForm = ref({
  name: "",
  principal: 250000,
  interestRate: 3.5,
  termYears: 25,
  market: "DE" as "DE" | "CH",
  bank: "",
});

// Load portfolio on mount
onMounted(async () => {
  await loadPortfolio();
});

async function loadPortfolio() {
  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    portfolio.value = {
      id: portfolioId,
      name: "Investment Properties",
      owner: "John Doe",
    };
  } catch (err) {
    error.value = "Failed to load portfolio";
    console.error("Portfolio loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

async function createMortgage() {
  if (!portfolio.value) return;

  isCreating.value = true;

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to portfolio mortgages
    router.push(routes.portfolios.mortgages.index(portfolioId));
  } catch (err) {
    error.value = "Failed to create mortgage";
    console.error("Mortgage creation error:", err);
  } finally {
    isCreating.value = false;
  }
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
