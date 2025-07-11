<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-6"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.95-.45 3.73-1.28 5.31-2.38C19.77 17 22 13.55 22 9V7l-10-5z"
            />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Get Debt-Free Faster
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          See exactly what you owe and how to pay it off sooner
        </p>
      </div>

      <!-- Main Calculator Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Input Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">I want to borrow</span>
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >€</span
                >
                <input
                  v-model.number="loanAmount"
                  type="number"
                  class="bg-blue-50 border-2 border-blue-200 rounded-lg px-8 py-2 text-lg font-semibold text-gray-900 focus:border-blue-400 focus:outline-none"
                  placeholder="100,000"
                />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">at</span>
              <div class="relative">
                <input
                  v-model.number="interestRate"
                  type="number"
                  step="0.1"
                  class="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2 text-lg font-semibold text-gray-900 focus:border-blue-400 focus:outline-none w-20"
                  placeholder="5.6"
                />
                <span
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >%</span
                >
              </div>
              <span class="text-lg text-gray-700">interest rate</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">for</span>
              <div class="relative">
                <input
                  v-model.number="termYears"
                  type="number"
                  class="bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2 text-lg font-semibold text-gray-900 focus:border-green-400 focus:outline-none w-20"
                  placeholder="7"
                />
              </div>
              <span class="text-lg text-gray-700">years</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">with</span>
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >€</span
                >
                <input
                  v-model.number="extraPayment"
                  type="number"
                  class="bg-yellow-50 border-2 border-yellow-200 rounded-lg px-8 py-2 text-lg font-semibold text-gray-900 focus:border-yellow-400 focus:outline-none w-32"
                  placeholder="0"
                />
              </div>
              <span class="text-lg text-gray-700">monthly extra payments</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">with</span>
              <div class="relative">
                <input
                  v-model.number="extraPaymentRights"
                  type="number"
                  class="bg-purple-50 border-2 border-purple-200 rounded-lg px-4 py-2 text-lg font-semibold text-gray-900 focus:border-purple-400 focus:outline-none w-20"
                  placeholder="100"
                />
                <span
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >%</span
                >
              </div>
              <span class="text-lg text-gray-700">extra payment rights</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">starting on</span>
              <input
                v-model="startDate"
                type="date"
                class="bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 text-lg text-gray-900 focus:border-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <!-- Quick Presets -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Quick Scenarios
            </h3>
            <div class="space-y-3">
              <button
                @click="setPreset('firstHome')"
                class="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div class="font-semibold text-blue-900">First Home</div>
                <div class="text-sm text-blue-700">€300K • 4.5% • 25 years</div>
              </button>
              <button
                @click="setPreset('investment')"
                class="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div class="font-semibold text-green-900">
                  Investment Property
                </div>
                <div class="text-sm text-green-700">
                  €500K • 5.2% • 20 years
                </div>
              </button>
              <button
                @click="setPreset('refinance')"
                class="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <div class="font-semibold text-purple-900">Refinancing</div>
                <div class="text-sm text-purple-700">
                  €200K • 3.8% • 15 years
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Calculate Button -->
        <div class="text-center mt-8">
          <button
            @click="calculate"
            class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg transform transition hover:scale-105"
          >
            Show me the numbers
          </button>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="showResults" class="space-y-6">
        <!-- Your Path to Debt Freedom -->
        <div
          class="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200"
        >
          <div class="flex items-center gap-2 mb-6">
            <svg
              class="w-6 h-6 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.95-.45 3.73-1.28 5.31-2.38C19.77 17 22 13.55 22 9V7l-10-5z"
              />
            </svg>
            <h3 class="text-xl font-bold text-red-900">
              Your Path to Debt Freedom
            </h3>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-red-600 mb-2">
                {{ formatEuros(results.currentBalance) }}
              </div>
              <div class="text-sm font-medium text-red-800">
                Current Balance
              </div>
              <div class="text-xs text-red-600">Still owe</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">
                {{ results.remainingPayments }}
              </div>
              <div class="text-sm font-medium text-orange-800">payments</div>
              <div class="text-xs text-orange-600">Payments Left</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-600 mb-2">
                {{ formatEuros(results.totalInterest) }}
              </div>
              <div class="text-sm font-medium text-yellow-800">
                Interest Left
              </div>
              <div class="text-xs text-yellow-600">Future Interest</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {{ formatEuros(results.monthlyPayment) }}
              </div>
              <div class="text-sm font-medium text-blue-800">
                Monthly Payment
              </div>
              <div class="text-xs text-blue-600">
                {{ results.principalPercent }}% principal
              </div>
            </div>
          </div>
        </div>

        <!-- Get Debt-Free Faster with Extra Payments -->
        <div
          v-if="extraPayment > 0"
          class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
        >
          <div class="flex items-center gap-2 mb-6">
            <svg
              class="w-6 h-6 text-green-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl font-bold text-green-900">
              Get Debt-Free Faster with Extra Payments
            </h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ formatEuros(results.interestSaved) }}
              </div>
              <div class="text-sm font-medium text-green-800">
                Interest Saved
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ results.timeSaved }} months
              </div>
              <div class="text-sm font-medium text-green-800">
                Months Sooner
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ results.newPayoffDate }}
              </div>
              <div class="text-sm font-medium text-green-800">
                New Debt-Free Date
              </div>
            </div>
          </div>
        </div>

        <!-- Debt Payoff Progress -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-2 mb-6">
            <svg
              class="w-6 h-6 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 class="text-xl font-bold text-gray-900">
              Your Debt Payoff Progress
            </h3>
          </div>

          <div class="space-y-4">
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>Debt Paid Off</span>
              <span>{{ results.progressPercent }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4">
              <div
                class="bg-gradient-to-r from-red-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                :style="{ width: results.progressPercent + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-sm">
              <div>
                <span class="font-medium text-gray-900">Original Loan:</span>
                <span class="text-gray-600 ml-1">{{
                  formatEuros(loanAmount)
                }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-900">Monthly Payment:</span>
                <span class="text-gray-600 ml-1">{{
                  formatEuros(results.monthlyPayment)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Plan Your Extra Payment Strategy -->
        <div
          class="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-200"
        >
          <div class="flex items-center gap-2 mb-6">
            <svg
              class="w-6 h-6 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 class="text-xl font-bold text-green-900">
              Plan Your Extra Payment Strategy
            </h3>
          </div>

          <div class="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
              <svg
                class="w-5 h-5 text-green-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div class="font-semibold text-green-900">
                  German Mortgage Advantage:
                </div>
                <div class="text-sm text-green-800">
                  Unlike many countries, German mortgages typically allow 100%
                  extra payment rights - you can pay off your entire loan at any
                  time without penalties!
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Your Annual Extra Payment Budget
              </label>
              <div class="flex items-center gap-4">
                <div class="relative flex-1">
                  <span
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >€</span
                  >
                  <input
                    v-model.number="yearlyExtraBudget"
                    type="number"
                    class="w-full bg-white border-2 border-green-200 rounded-lg px-8 py-3 text-lg focus:border-green-400 focus:outline-none"
                    placeholder="10,000"
                  />
                </div>
                <button
                  @click="addExtraPayment"
                  class="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Add Extra Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// Form data
const loanAmount = ref(100000);
const interestRate = ref(5.6);
const termYears = ref(7);
const extraPayment = ref(0);
const extraPaymentRights = ref(100);
const startDate = ref("2023-01-01");
const yearlyExtraBudget = ref(0);

// Results
const showResults = ref(false);

// Presets
function setPreset(type: string) {
  switch (type) {
    case "firstHome":
      loanAmount.value = 300000;
      interestRate.value = 4.5;
      termYears.value = 25;
      extraPayment.value = 0;
      break;
    case "investment":
      loanAmount.value = 500000;
      interestRate.value = 5.2;
      termYears.value = 20;
      extraPayment.value = 0;
      break;
    case "refinance":
      loanAmount.value = 200000;
      interestRate.value = 3.8;
      termYears.value = 15;
      extraPayment.value = 0;
      break;
  }
}

// Calculations
const results = computed(() => {
  const monthlyRate = interestRate.value / 100 / 12;
  const totalMonths = termYears.value * 12;

  // Calculate monthly payment
  const monthlyPayment =
    (loanAmount.value *
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Calculate remaining balance (assuming we're at the start)
  const currentBalance = loanAmount.value;

  // Calculate total interest without extra payments
  const totalInterestWithoutExtra =
    monthlyPayment * totalMonths - loanAmount.value;

  // Calculate with extra payments
  let balance = loanAmount.value;
  let totalPaid = 0;
  let months = 0;

  while (balance > 0 && months < totalMonths) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const totalMonthlyPayment = monthlyPayment + extraPayment.value;

    balance = Math.max(0, balance - principalPayment - extraPayment.value);
    totalPaid += totalMonthlyPayment;
    months++;
  }

  const interestSaved =
    totalInterestWithoutExtra - (totalPaid - loanAmount.value);
  const timeSaved = totalMonths - months;

  // Calculate new payoff date
  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + months);

  const principalPercent = Math.round(
    ((monthlyPayment - currentBalance * monthlyRate) / monthlyPayment) * 100
  );
  const progressPercent = Math.round(
    ((loanAmount.value - currentBalance) / loanAmount.value) * 100
  );

  return {
    monthlyPayment,
    currentBalance,
    totalInterest: totalInterestWithoutExtra,
    remainingPayments: totalMonths,
    interestSaved: Math.max(0, interestSaved),
    timeSaved,
    newPayoffDate: newPayoffDate.toLocaleDateString("de-DE", {
      month: "short",
      year: "numeric",
    }),
    principalPercent,
    progressPercent,
  };
});

function calculate() {
  showResults.value = true;
  // Smooth scroll to results
  setTimeout(() => {
    const resultsEl = document.querySelector(".space-y-6");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
}

function addExtraPayment() {
  if (yearlyExtraBudget.value > 0) {
    extraPayment.value = Math.round(yearlyExtraBudget.value / 12);
    calculate();
  }
}

function formatEuros(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
</script>
