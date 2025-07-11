<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <RouterLink to="/" class="flex items-center space-x-3">
              <div
                class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.95-.45 3.73-1.28 5.31-2.38C19.77 17 22 13.55 22 9V7l-10-5z"
                  />
                </svg>
              </div>
              <span class="text-xl font-bold text-gray-900">Grundstein</span>
            </RouterLink>
          </div>
          <div class="flex items-center space-x-6">
            <RouterLink
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >Dashboard</RouterLink
            >
            <RouterLink
              to="/portfolio"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >Portfolio</RouterLink
            >
            <RouterLink
              to="/create-mortgage"
              class="text-blue-600 font-medium px-3 py-2 text-sm"
              >Create Mortgage</RouterLink
            >
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Create Your Mortgage
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Configure your mortgage parameters and see detailed calculations
        </p>
      </div>

      <!-- Main Form -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <form @submit.prevent="calculateMortgage">
          <div class="grid md:grid-cols-2 gap-8">
            <!-- Input Section -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Mortgage Details
              </h2>

              <!-- Loan Amount -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Loan Amount</label
                >
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >€</span
                  >
                  <input
                    v-model.number="mortgageForm.amount"
                    type="number"
                    class="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="300,000"
                    required
                  />
                </div>
              </div>

              <!-- Interest Rate -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Annual Interest Rate</label
                >
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
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Loan Term</label
                >
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
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Market</label
                >
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
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Bank/Lender</label
                >
                <input
                  v-model="mortgageForm.bank"
                  type="text"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Deutsche Bank"
                  required
                />
              </div>

              <!-- Mortgage Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Mortgage Name</label
                >
                <input
                  v-model="mortgageForm.name"
                  type="text"
                  class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Primary Home Mortgage"
                  required
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  label="Calculate Mortgage"
                  size="lg"
                  class="flex-1"
                />
                <Button
                  label="Reset"
                  variant="secondary"
                  size="lg"
                  @click="resetForm"
                />
              </div>
            </div>

            <!-- Results Section -->
            <div class="space-y-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">
                Calculation Results
              </h2>

              <!-- Loading State -->
              <div v-if="isCalculating" class="text-center py-8">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
                ></div>
                <p class="text-gray-500 mt-2">Calculating...</p>
              </div>

              <!-- Results -->
              <div v-else-if="calculationResults" class="space-y-6">
                <!-- Monthly Payment -->
                <div class="bg-blue-50 rounded-xl p-6">
                  <h3 class="text-lg font-semibold text-blue-900 mb-2">
                    Monthly Payment
                  </h3>
                  <p class="text-3xl font-bold text-blue-600">
                    {{ formatCurrency(calculationResults.monthlyPayment) }}
                  </p>
                  <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-gray-600">Principal:</span>
                      <span class="font-medium ml-2">{{
                        formatCurrency(calculationResults.principalPayment)
                      }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Interest:</span>
                      <span class="font-medium ml-2">{{
                        formatCurrency(calculationResults.interestPayment)
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Total Cost -->
                <div class="bg-gray-50 rounded-xl p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    Total Cost
                  </h3>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Total Interest:</span>
                      <span class="font-medium">{{
                        formatCurrency(calculationResults.totalInterest)
                      }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Total Amount:</span>
                      <span class="font-bold">{{
                        formatCurrency(calculationResults.totalAmount)
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Key Metrics -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900">Total Months</h4>
                    <p class="text-xl font-bold text-gray-600">
                      {{ calculationResults.totalMonths }}
                    </p>
                  </div>
                  <div class="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 class="font-medium text-gray-900">Interest Rate</h4>
                    <p class="text-xl font-bold text-gray-600">
                      {{ mortgageForm.interestRate }}%
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="space-y-3">
                  <Button
                    label="Add to Portfolio"
                    size="lg"
                    class="w-full"
                    @click="showPortfolioSelection = true"
                  />
                  <Button
                    label="Save as Draft"
                    variant="secondary"
                    size="lg"
                    class="w-full"
                    @click="saveDraft"
                  />
                </div>
              </div>

              <!-- Initial State -->
              <div v-else class="text-center py-12">
                <div
                  class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg
                    class="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p class="text-gray-500">
                  Fill in the mortgage details to see calculations
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Portfolio Selection Modal -->
    <Modal
      :is-open="showPortfolioSelection"
      title="Add to Portfolio"
      subtitle="Select which portfolio to add this mortgage to"
      @close="showPortfolioSelection = false"
    >
      <div class="space-y-4">
        <div v-if="portfolios.length === 0" class="text-center py-8">
          <p class="text-gray-500 mb-4">
            No portfolios found. Create one first.
          </p>
          <Button label="Create Portfolio" @click="createPortfolioFirst" />
        </div>
        <div v-else>
          <div
            v-for="portfolio in portfolios"
            :key="portfolio.id"
            class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            @click="selectPortfolio(portfolio)"
          >
            <h3 class="font-medium text-gray-900">{{ portfolio.name }}</h3>
            <p class="text-sm text-gray-500">{{ portfolio.owner }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          variant="secondary"
          @click="showPortfolioSelection = false"
        />
        <Button
          label="Create New Portfolio"
          @click="showCreatePortfolio = true"
        />
      </template>
    </Modal>

    <!-- Create Portfolio Modal -->
    <Modal
      :is-open="showCreatePortfolio"
      title="Create New Portfolio"
      subtitle="Create a portfolio for this mortgage"
      @close="showCreatePortfolio = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Portfolio Name</label
          >
          <input
            v-model="newPortfolio.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Real Estate Portfolio"
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

      <template #footer>
        <Button
          label="Cancel"
          variant="secondary"
          @click="showCreatePortfolio = false"
        />
        <Button
          label="Create & Add Mortgage"
          :loading="isCreatingPortfolio"
          loading-text="Creating..."
          @click="createPortfolioAndAddMortgage"
        />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { portfolioApplicationService } from "../application/services/PortfolioApplicationService";
import type { MortgagePortfolio } from "../application/services/PortfolioApplicationService";
import Modal from "../components/Modal.vue";
import Button from "../components/Button.vue";

const router = useRouter();

// Form state
const mortgageForm = ref({
  amount: 300000,
  interestRate: 3.5,
  termYears: 25,
  market: "DE" as "DE" | "CH",
  bank: "",
  name: "",
});

// Calculation state
const isCalculating = ref(false);
const calculationResults = ref<{
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  totalInterest: number;
  totalAmount: number;
  totalMonths: number;
} | null>(null);

// Portfolio management
const portfolios = ref<MortgagePortfolio[]>([]);
const showPortfolioSelection = ref(false);
const showCreatePortfolio = ref(false);
const isCreatingPortfolio = ref(false);
const newPortfolio = ref({
  name: "",
  owner: "",
});

// Load portfolios on mount
onMounted(async () => {
  await loadPortfolios();
});

async function loadPortfolios() {
  try {
    const result = await portfolioApplicationService.getAllPortfolios();
    if (result.success) {
      portfolios.value = result.data;
    }
  } catch (error) {
    console.error("Failed to load portfolios:", error);
  }
}

async function calculateMortgage() {
  isCalculating.value = true;

  try {
    // Simulate calculation (replace with actual domain calculation)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const monthlyRate = mortgageForm.value.interestRate / 100 / 12;
    const totalMonths = mortgageForm.value.termYears * 12;
    const monthlyPayment =
      (mortgageForm.value.amount *
        monthlyRate *
        Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalAmount = monthlyPayment * totalMonths;
    const totalInterest = totalAmount - mortgageForm.value.amount;
    const principalPayment =
      monthlyPayment - mortgageForm.value.amount * monthlyRate;
    const interestPayment = mortgageForm.value.amount * monthlyRate;

    calculationResults.value = {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalMonths,
    };
  } catch (error) {
    console.error("Calculation failed:", error);
  } finally {
    isCalculating.value = false;
  }
}

function resetForm() {
  mortgageForm.value = {
    amount: 300000,
    interestRate: 3.5,
    termYears: 25,
    market: "DE",
    bank: "",
    name: "",
  };
  calculationResults.value = null;
}

function saveDraft() {
  // TODO: Implement draft saving
  console.log("Save draft:", mortgageForm.value, calculationResults.value);
}

function selectPortfolio(portfolio: MortgagePortfolio) {
  // TODO: Add mortgage to selected portfolio
  console.log("Add to portfolio:", portfolio.name, mortgageForm.value);
  showPortfolioSelection.value = false;
}

function createPortfolioFirst() {
  showPortfolioSelection.value = false;
  showCreatePortfolio.value = true;
}

async function createPortfolioAndAddMortgage() {
  if (!newPortfolio.value.name.trim() || !newPortfolio.value.owner.trim()) {
    return;
  }

  isCreatingPortfolio.value = true;

  try {
    // Create portfolio
    const result = await portfolioApplicationService.createPortfolio({
      name: newPortfolio.value.name.trim(),
      owner: newPortfolio.value.owner.trim(),
    });

    if (result.success) {
      // TODO: Add mortgage to the new portfolio
      console.log("Portfolio created and mortgage added:", result.data);

      // Reset and close
      newPortfolio.value = { name: "", owner: "" };
      showCreatePortfolio.value = false;

      // Redirect to portfolio
      router.push({ name: "portfolio-detail", params: { id: result.data.id } });
    }
  } catch (error) {
    console.error("Failed to create portfolio:", error);
  } finally {
    isCreatingPortfolio.value = false;
  }
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
</script>
