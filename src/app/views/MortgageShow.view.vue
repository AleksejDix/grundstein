<template>
  <DetailLayout>
    <template #header>
      <PageHeader
        :title="mortgage?.name || 'Unnamed Mortgage'"
        :subtitle="mortgage ? `${mortgage.bank} • ${mortgage.market}` : ''"
      >
        <template #actions v-if="mortgage">
          <RouterLink
            :to="routes.mortgages.edit(mortgage.id)"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </RouterLink>
          <Button
            label="Delete"
            variant="danger"
            @click="deleteMortgage"
            :loading="isDeleting"
          />
        </template>
      </PageHeader>
    </template>

    <LoadingSpinner v-if="isLoading" message="Loading mortgage details..." />
    <ErrorAlert v-else-if="error" :message="error" />

    <template v-if="mortgage" #metrics>
      <MetricCard
        label="Principal"
        :value="formatCurrency(mortgage.principal)"
        icon-path="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
        icon-bg-color="bg-blue-100"
        icon-color="text-blue-600"
      />

      <MetricCard
        label="Monthly Payment"
        :value="formatCurrency(calculateMonthlyPayment())"
        icon-path="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
        icon-bg-color="bg-green-100"
        icon-color="text-green-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Interest Rate"
        :value="`${mortgage.interestRate}%`"
        icon-path="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        icon-bg-color="bg-yellow-100"
        icon-color="text-yellow-600"
        icon-fill-rule="evenodd"
        icon-clip-rule="evenodd"
      />

      <MetricCard
        label="Zinsbindung"
        :value="`${mortgage.fixedRatePeriod} Jahre`"
        icon-path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        icon-bg-color="bg-purple-100"
        icon-color="text-purple-600"
      />
    </template>

    <template v-if="mortgage" #primary>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Loan Details</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Principal Amount:</span>
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
              <span class="text-sm text-gray-600">Zinsbindung:</span>
              <span class="text-sm font-medium"
                >{{ mortgage.fixedRatePeriod }} Jahre</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Monthly Payment:</span>
              <span class="text-sm font-medium">
                {{ formatCurrency(mortgage.monthlyPayment) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Market:</span>
              <span class="text-sm font-medium">{{
                mortgage.market === "DE" ? "Germany" : "Switzerland"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Bank/Lender:</span>
              <span class="text-sm font-medium">{{ mortgage.bank }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-if="mortgage" #sidebar>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Payment Summary</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Monthly Payment:</span>
              <span class="text-sm font-medium">{{
                formatCurrency(calculateMonthlyPayment())
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Interest:</span>
              <span class="text-sm font-medium">{{
                formatCurrency(calculateTotalInterest())
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Total Amount:</span>
              <span class="text-sm font-medium">{{
                formatCurrency(calculateTotalAmount())
              }}</span>
            </div>
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between text-base font-medium">
                <span>Cost of Borrowing:</span>
                <span>{{ formatCurrency(calculateTotalInterest()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../../router/routes";
import { DetailLayout } from "../layouts";
import PageHeader from "../components/PageHeader.vue";
import MetricCard from "../components/MetricCard.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorAlert from "../components/ErrorAlert.vue";
import Button from "../components/Button.vue";
import { portfolioApplicationService } from "../services/application/services/PortfolioApplicationService";

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
const isDeleting = ref(false);
const error = ref<string | null>(null);

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

async function deleteMortgage() {
  if (
    !mortgage.value ||
    !confirm("Are you sure you want to delete this mortgage?")
  ) {
    return;
  }

  isDeleting.value = true;

  try {
    // TODO: Replace with actual API call
    // await deleteMortgage(mortgage.value.id)

    // Mock deletion
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirect to mortgages index
    router.push(routes.mortgages.index());
  } catch (err) {
    error.value = "Failed to delete mortgage";
    console.error("Mortgage deletion error:", err);
  } finally {
    isDeleting.value = false;
  }
}

function calculateMonthlyPayment(): number {
  if (!mortgage.value) return 0;

  // If monthly payment is specified, use it directly
  if (mortgage.value.monthlyPayment > 0) {
    return mortgage.value.monthlyPayment;
  }

  // Otherwise calculate using standard formula
  const monthlyRate = mortgage.value.interestRate / 100 / 12;
  const totalMonths = mortgage.value.fixedRatePeriod * 12;

  return (
    (mortgage.value.principal *
      monthlyRate *
      Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

function calculateTotalInterest(): number {
  if (!mortgage.value) return 0;

  const monthlyPayment = calculateMonthlyPayment();
  let totalMonths: number;

  if (mortgage.value.monthlyPayment > 0) {
    // Calculate total months based on monthly payment
    const monthlyRate = mortgage.value.interestRate / 100 / 12;
    const principal = mortgage.value.principal;
    const payment = monthlyPayment;

    if (payment <= principal * monthlyRate) {
      return 0; // Payment too low
    }

    totalMonths =
      Math.log(
        1 + (principal * monthlyRate) / (payment - principal * monthlyRate)
      ) / Math.log(1 + monthlyRate);
    totalMonths = Math.ceil(totalMonths);
  } else {
    totalMonths = mortgage.value.fixedRatePeriod * 12;
  }

  return monthlyPayment * totalMonths - mortgage.value.principal;
}

function calculateTotalAmount(): number {
  if (!mortgage.value) return 0;

  return mortgage.value.principal + calculateTotalInterest();
}

function formatCurrency(amount: number): string {
  return `€${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
</script>
