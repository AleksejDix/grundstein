<template>
  <FormLayout>
    <template #header>
      <PageHeader
        title="Edit Portfolio"
        subtitle="Update your portfolio information"
      />
    </template>

    <LoadingSpinner v-if="isLoading" message="Loading portfolio..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <form v-else-if="portfolio" @submit.prevent="updatePortfolio">
      <div class="space-y-6">
        <!-- Portfolio Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Name
          </label>
          <input
            v-model="portfolioForm.name"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Investment Properties"
            required
          />
        </div>

        <!-- Owner -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Owner
          </label>
          <input
            v-model="portfolioForm.owner"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., John Doe"
            required
          />
        </div>
      </div>
    </form>

    <template #footer>
      <RouterLink
        :to="routes.portfolios.show(portfolio.id)"
        class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </RouterLink>
      <Button
        type="submit"
        label="Update Portfolio"
        size="lg"
        class="flex-1"
        :loading="isUpdating"
        loading-text="Updating..."
      />
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { portfolioApplicationService } from "../services/application/services/PortfolioApplicationService";
import type { MortgagePortfolio } from "../services/application/services/PortfolioApplicationService";
import { routes } from "../../router/routes";
import { FormLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import Button from "../components/Button.vue";

const route = useRoute();
const router = useRouter();

// State
const portfolio = ref<MortgagePortfolio | null>(null);
const isLoading = ref(true);
const isUpdating = ref(false);
const error = ref<string | null>(null);

// Form state
const portfolioForm = ref({
  name: "",
  owner: "",
});

// Load portfolio on mount
onMounted(async () => {
  await loadPortfolio();
});

async function loadPortfolio() {
  const portfolioId = route.params.id as string;

  try {
    const result = await portfolioApplicationService.getPortfolio(portfolioId);

    if (result.success) {
      portfolio.value = result.data;
      portfolioForm.value = {
        name: result.data.name,
        owner: result.data.owner,
      };
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

async function updatePortfolio() {
  if (
    !portfolio.value ||
    !portfolioForm.value.name.trim() ||
    !portfolioForm.value.owner.trim()
  ) {
    return;
  }

  isUpdating.value = true;

  try {
    const result = await portfolioApplicationService.updatePortfolio(
      portfolio.value.id,
      {
        name: portfolioForm.value.name.trim(),
        owner: portfolioForm.value.owner.trim(),
      }
    );

    if (result.success) {
      // Redirect to the updated portfolio
      router.push(routes.portfolios.show(portfolio.value.id));
    } else {
      error.value = `Failed to update portfolio: ${result.error}`;
    }
  } catch (err) {
    error.value = "Failed to update portfolio";
    console.error("Portfolio update error:", err);
  } finally {
    isUpdating.value = false;
  }
}
</script>
