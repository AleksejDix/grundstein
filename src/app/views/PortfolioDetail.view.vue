<template>
  <DetailLayout>
    <template #header>
      <PageHeader
        :title="portfolio?.name || 'Portfolio Details'"
        :subtitle="portfolio?.owner || ''"
      >
        <template #actions v-if="portfolio">
          <button
            @click="showAddMortgage = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Mortgage
          </button>
        </template>
      </PageHeader>
    </template>

    <LoadingSpinner v-if="isLoading" message="Loading portfolio details..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <template v-if="portfolioData" #metrics>
      <MetricCard
        label="Total Principal"
        :value="formatCurrency(portfolioData.summary.totalPrincipal)"
        icon-path="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
        icon-bg-color="bg-blue-100"
        icon-color="text-blue-600"
      />

      <MetricCard
        label="Monthly Payment"
        :value="formatCurrency(portfolioData.summary.totalMonthlyPayment)"
        icon-path="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        icon-bg-color="bg-green-100"
        icon-color="text-green-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Avg. Interest Rate"
        :value="`${portfolioData.summary.averageInterestRate.toFixed(2)}%`"
        icon-path="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        icon-bg-color="bg-yellow-100"
        icon-color="text-yellow-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Active Mortgages"
        :value="portfolioData.summary.activeMortgages.toString()"
        icon-path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        icon-bg-color="bg-purple-100"
        icon-color="text-purple-600"
      />
    </template>

    <template #primary>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Mortgages</h2>
        </div>

        <EmptyState
          v-if="portfolio?.mortgages.length === 0"
          title="No Mortgages"
          description="This portfolio doesn't contain any mortgages yet."
        >
          <template #actions>
            <button
              @click="showAddMortgage = true"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add First Mortgage
            </button>
          </template>
        </EmptyState>

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
                v-for="mortgage in portfolio?.mortgages || []"
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
    </template>

    <template v-if="portfolioData" #secondary>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Mortgages</h2>
        </div>

        <EmptyState
          v-if="portfolio?.mortgages.length === 0"
          title="No Mortgages"
          description="This portfolio doesn't contain any mortgages yet."
          icon="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
        >
          <template #actions>
            <Button label="Add Mortgage" @click="showAddMortgage = true" />
          </template>
        </EmptyState>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mortgage
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Principal
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rate
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monthly Payment
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
              <tr v-for="mortgage in portfolio?.mortgages || []" :key="mortgage.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">
                    {{ mortgage.name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ mortgage.bank }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(0) }} {{/* TODO: mortgage.configuration.amount */}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ 0 }}% {{/* TODO: mortgage.configuration.annualRate */}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(0) }} {{/* TODO: mortgage.configuration.monthlyPayment */}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Active
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <RouterLink
                    :to="routes.mortgages.show(mortgage.id)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </RouterLink>
                  <RouterLink
                    :to="routes.mortgages.edit(mortgage.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Add Mortgage Modal Placeholder -->
    <Modal
      :is-open="showAddMortgage"
      title="Add New Mortgage"
      subtitle="Create a new mortgage in this portfolio"
      @close="showAddMortgage = false"
    >
      <p class="text-gray-600 mb-4">
        Mortgage creation form will be implemented here.
      </p>

      <template #footer>
        <Button
          label="Close"
          variant="secondary"
          @click="showAddMortgage = false"
        />
      </template>
    </Modal>
  </DetailLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { portfolioApplicationService } from "../services/application/services/PortfolioApplicationService";
import { routes } from "../../router/routes";
import type {
  MortgagePortfolio,
  PortfolioWithSummary,
  MortgageEntry,
} from "../services/application/services/PortfolioApplicationService";
import type { Money } from "../../core/domain";
import { toEuros } from "../../core/domain";
import { DetailLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import MetricCard from "../components/MetricCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import EmptyState from "../components/EmptyState.vue";
import Modal from "../components/Modal.vue";
import Button from "../components/Button.vue";

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
