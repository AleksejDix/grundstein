<template>
  <FormLayout>
    <template #header>
      <PageHeader
        title="Edit Mortgage"
        subtitle="Update your mortgage information"
      />
    </template>

    <LoadingSpinner v-if="isLoading" message="Loading mortgage..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <form v-else-if="mortgage" @submit.prevent="updateMortgage">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Input Section -->
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Mortgage Details
          </h2>

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
                required
              />
              <span
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >%</span
              >
            </div>
          </div>

          <!-- Zinsbindung (Fixed Rate Period) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Zinsbindung (Fixed Rate Period)
            </label>
            <select
              v-model.number="mortgageForm.fixedRatePeriod"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="5">5 Jahre</option>
              <option value="10">10 Jahre</option>
              <option value="15">15 Jahre</option>
              <option value="20">20 Jahre</option>
              <option value="25">25 Jahre</option>
              <option value="30">30 Jahre</option>
            </select>
          </div>

          <!-- Monthly Payment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gewünschte monatliche Rate
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >€</span
              >
              <input
                v-model.number="mortgageForm.monthlyPayment"
                type="number"
                class="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="400"
                required
              />
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
              required
            />
          </div>

          <!-- Mortgage Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mortgage Name
            </label>
            <input
              v-model="mortgageForm.name"
              type="text"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <!-- Preview Section -->
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">
            Updated Values
          </h2>

          <div class="bg-gray-50 rounded-xl p-6">
            <div class="space-y-4">
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
                <span class="text-sm text-gray-600">Zinsbindung:</span>
                <span class="text-sm font-medium"
                  >{{ mortgageForm.fixedRatePeriod }} Jahre</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Monthly Payment:</span>
                <span class="text-sm font-medium">
                  {{ formatCurrency(mortgageForm.monthlyPayment) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Market:</span>
                <span class="text-sm font-medium">{{
                  mortgageForm.market
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Bank:</span>
                <span class="text-sm font-medium">{{ mortgageForm.bank }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <RouterLink
        :to="routes.mortgages.show(mortgage.id)"
        class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-center text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </RouterLink>
      <Button
        type="submit"
        label="Update Mortgage"
        size="lg"
        class="flex-1"
        :loading="isUpdating"
        loading-text="Updating..."
        @click="updateMortgage"
      />
    </template>
  </FormLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../../router/routes";
import { FormLayout } from "../layouts";
import { portfolioApplicationService } from "../services/application/services/PortfolioApplicationService";
import PageHeader from "../components/PageHeader.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import Button from "../components/Button.vue";

// Mock data structure - replace with actual domain types
interface Mortgage {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  fixedRatePeriod: number;
  monthlyPayment: number;
  market: "DE" | "CH";
  bank: string;
}

const route = useRoute();
const router = useRouter();

// State
const mortgage = ref<Mortgage | null>(null);
const isLoading = ref(true);
const isUpdating = ref(false);
const error = ref<string | null>(null);

// Form state
const mortgageForm = ref({
  name: "",
  principal: 0,
  interestRate: 0,
  fixedRatePeriod: 10,
  monthlyPayment: 0,
  market: "DE" as "DE" | "CH",
  bank: "",
});

// Load mortgage on mount
onMounted(async () => {
  await loadMortgage();
});

async function loadMortgage() {
  const mortgageId = route.params.id as string;

  try {
    // Find mortgage across all portfolios
    const result = await portfolioApplicationService.getAllPortfolios();

    if (result.success) {
      let foundMortgage = null;

      for (const portfolio of result.data) {
        const portfolioResult =
          await portfolioApplicationService.getPortfolioWithSummary(
            portfolio.id
          );
        if (portfolioResult.success) {
          foundMortgage = portfolioResult.data.portfolio.mortgages.find(
            (m: any) => m.id === mortgageId
          );
          if (foundMortgage) break;
        }
      }

      if (foundMortgage) {
        mortgage.value = {
          id: foundMortgage.id,
          name: foundMortgage.name,
          principal: foundMortgage.principal,
          interestRate: foundMortgage.interestRate,
          fixedRatePeriod: foundMortgage.fixedRatePeriod || 10,
          monthlyPayment: foundMortgage.monthlyPayment || 0,
          market: foundMortgage.market,
          bank: foundMortgage.bank || "Unknown Bank",
        };

        mortgageForm.value = {
          name: mortgage.value.name,
          principal: mortgage.value.principal,
          interestRate: mortgage.value.interestRate,
          fixedRatePeriod: mortgage.value.fixedRatePeriod || 10,
          monthlyPayment: mortgage.value.monthlyPayment || 0,
          market: mortgage.value.market,
          bank: mortgage.value.bank,
        };
      } else {
        error.value = "Mortgage not found";
      }
    } else {
      error.value = result.error;
    }
  } catch (err) {
    error.value = "Failed to load mortgage";
    console.error("Mortgage loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

async function updateMortgage() {
  if (!mortgage.value) return;

  isUpdating.value = true;

  try {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirect to mortgage details
    router.push(routes.mortgages.show(mortgage.value.id));
  } catch (err) {
    error.value = "Failed to update mortgage";
    console.error("Mortgage update error:", err);
  } finally {
    isUpdating.value = false;
  }
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
