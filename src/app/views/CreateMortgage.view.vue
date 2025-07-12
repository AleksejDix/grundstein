<template>
  <FormLayout>
    <template #header>
      <PageHeader
        title="Create Your Mortgage"
        subtitle="Configure your mortgage parameters and see detailed calculations"
      />
    </template>

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
              >Zinssatz (Annual Interest Rate)</label
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

          <!-- Zinsbindung (Fixed Rate Period) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Zinsbindung (Fixed Rate Period)</label
            >
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
            <p class="text-xs text-gray-500 mt-1">
              Typical German mortgages have 10-year fixed rate periods
            </p>
          </div>

          <!-- Monthly Payment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Gewünschte monatliche Rate</label
            >
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
            <p class="text-xs text-gray-500 mt-1">
              How much do you want to pay monthly?
            </p>
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

          <!-- Loan Start Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Loan Start Date</label
            >
            <input
              v-model="mortgageForm.startDate"
              type="date"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p class="text-xs text-gray-500 mt-1">
              When did you first take out this mortgage?
            </p>
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
                <h4 class="font-medium text-gray-900">Current Balance</h4>
                <p class="text-xl font-bold text-blue-600">
                  {{ formatCurrency(calculationResults.currentBalance) }}
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900">Months Elapsed</h4>
                <p class="text-xl font-bold text-green-600">
                  {{ calculationResults.elapsedMonths }} /
                  {{ calculationResults.totalMonths }}
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900">Remaining Months</h4>
                <p class="text-xl font-bold text-orange-600">
                  {{ calculationResults.remainingMonths }}
                </p>
              </div>
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900">Payoff Date</h4>
                <p class="text-xl font-bold text-purple-600">
                  {{ calculationResults.payoffDate }}
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

    <template #footer>
      <div class="flex space-x-3">
        <Button
          label="Calculate Mortgage"
          size="lg"
          class="flex-1"
          @click="calculateMortgage"
        />
        <Button
          label="Reset"
          variant="secondary"
          size="lg"
          @click="resetForm"
        />
      </div>
    </template>

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
  </FormLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { portfolioApplicationService } from "../services/application/services/PortfolioApplicationService";
import type { MortgagePortfolio } from "../services/application/services/PortfolioApplicationService";
import { routes } from "../../router/routes";
import { FormLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import Modal from "../components/Modal.vue";
import Button from "../components/Button.vue";

const router = useRouter();

// Form state
const mortgageForm = ref({
  amount: 300000,
  interestRate: 3.5,
  fixedRatePeriod: 10, // Zinsbindung in years
  monthlyPayment: 1500, // Desired monthly payment
  market: "DE" as "DE" | "CH",
  bank: "",
  name: "",
  startDate: new Date().toISOString().split("T")[0], // Default to today
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
  elapsedMonths: number;
  remainingMonths: number;
  currentBalance: number;
  payoffDate: string;
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
  // Basic validation
  if (!mortgageForm.value.amount || mortgageForm.value.amount <= 0) {
    alert("Please enter a valid loan amount");
    return;
  }

  if (
    !mortgageForm.value.interestRate ||
    mortgageForm.value.interestRate <= 0
  ) {
    alert("Please enter a valid interest rate");
    return;
  }

  if (
    !mortgageForm.value.monthlyPayment ||
    mortgageForm.value.monthlyPayment <= 0
  ) {
    alert("Please enter a valid monthly payment amount");
    return;
  }

  if (!mortgageForm.value.name || mortgageForm.value.name.trim() === "") {
    alert("Please enter a mortgage name");
    return;
  }

  if (!mortgageForm.value.bank || mortgageForm.value.bank.trim() === "") {
    alert("Please enter a bank/lender name");
    return;
  }

  isCalculating.value = true;

  try {
    // Simulate calculation (replace with actual domain calculation)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const monthlyRate = mortgageForm.value.interestRate / 100 / 12;

    // For German mortgages, calculate total months based on monthly payment
    // If monthly payment is specified, calculate how long it takes to pay off
    let totalMonths: number;
    let monthlyPayment: number;

    if (mortgageForm.value.monthlyPayment > 0) {
      // User specified monthly payment - calculate total months
      monthlyPayment = mortgageForm.value.monthlyPayment;

      // Calculate total months using payment formula
      // monthlyPayment = (amount * monthlyRate * (1 + monthlyRate)^n) / ((1 + monthlyRate)^n - 1)
      // Solve for n (total months)
      const principal = mortgageForm.value.amount;
      const rate = monthlyRate;
      const payment = monthlyPayment;

      if (payment <= principal * rate) {
        // Payment too low to cover interest
        throw new Error("Monthly payment too low to cover interest");
      }

      // Calculate months: n = log(1 + (P*r)/(M-P*r)) / log(1+r)
      totalMonths =
        Math.log(1 + (principal * rate) / (payment - principal * rate)) /
        Math.log(1 + rate);
      totalMonths = Math.ceil(totalMonths); // Round up to whole months
    } else {
      // Fallback to 25 years if no monthly payment specified
      totalMonths = 25 * 12;
      monthlyPayment =
        (mortgageForm.value.amount *
          monthlyRate *
          Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const totalAmount = monthlyPayment * totalMonths;
    const totalInterest = totalAmount - mortgageForm.value.amount;
    const principalPayment =
      monthlyPayment - mortgageForm.value.amount * monthlyRate;
    const interestPayment = mortgageForm.value.amount * monthlyRate;

    // Calculate elapsed months from start date
    const startDate = new Date(mortgageForm.value.startDate);
    const today = new Date();
    const elapsedMonths = Math.max(
      0,
      (today.getFullYear() - startDate.getFullYear()) * 12 +
        (today.getMonth() - startDate.getMonth())
    );

    // Calculate current balance (simplified amortization)
    let currentBalance = mortgageForm.value.amount;
    for (
      let month = 1;
      month <= Math.min(elapsedMonths, totalMonths);
      month++
    ) {
      const monthlyInterest = currentBalance * monthlyRate;
      const monthlyPrincipal = monthlyPayment - monthlyInterest;
      currentBalance = Math.max(0, currentBalance - monthlyPrincipal);
    }

    const remainingMonths = Math.max(0, totalMonths - elapsedMonths);
    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + totalMonths);

    calculationResults.value = {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalMonths,
      elapsedMonths,
      remainingMonths,
      currentBalance: Math.round(currentBalance * 100) / 100,
      payoffDate: payoffDate.toLocaleDateString(),
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
    fixedRatePeriod: 10,
    monthlyPayment: 1500,
    market: "DE",
    bank: "",
    name: "",
    startDate: new Date().toISOString().split("T")[0], // Default to today
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
      router.push(routes.portfolios.show(result.data.id));
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
