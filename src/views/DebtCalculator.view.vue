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
                  placeholder="5,6"
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
                  placeholder="100,0"
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
              <div class="text-xs text-orange-500">
                Save {{ formatDate(results.debtFreeDate) }}
              </div>
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
                {{ formatDate(results.newPayoffDate) }}
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

        <!-- Payment Schedule -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <svg
                class="w-6 h-6 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm2-6H3v16h18V3z"
                />
              </svg>
              <h3 class="text-xl font-bold text-gray-900">Payment Schedule</h3>
            </div>
            <div class="flex gap-2">
              <button
                @click="showScheduleType = 'table'"
                :class="
                  showScheduleType === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                "
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Table View
              </button>
              <button
                @click="showScheduleType = 'chart'"
                :class="
                  showScheduleType === 'chart'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                "
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Chart View
              </button>
            </div>
          </div>

          <!-- Table View -->
          <div v-if="showScheduleType === 'table'" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 font-medium text-gray-900">
                    Payment #
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-gray-900">
                    Date
                  </th>
                  <th class="text-right py-3 px-4 font-medium text-gray-900">
                    Payment
                  </th>
                  <th class="text-right py-3 px-4 font-medium text-gray-900">
                    Principal
                  </th>
                  <th class="text-right py-3 px-4 font-medium text-gray-900">
                    Interest
                  </th>
                  <th class="text-right py-3 px-4 font-medium text-gray-900">
                    Extra
                  </th>
                  <th class="text-right py-3 px-4 font-medium text-gray-900">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(payment, index) in paymentSchedule.slice(
                    0,
                    showAllPayments ? undefined : 12
                  )"
                  :key="index"
                  :class="
                    payment.isPast
                      ? 'bg-green-50'
                      : index % 2 === 0
                      ? 'bg-gray-50'
                      : 'bg-white'
                  "
                  class="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <td class="py-3 px-4 font-medium">
                    {{ payment.paymentNumber }}
                  </td>
                  <td class="py-3 px-4 text-gray-600">{{ payment.date }}</td>
                  <td class="py-3 px-4 text-right font-semibold">
                    {{ formatEuros(payment.totalPayment) }}
                  </td>
                  <td class="py-3 px-4 text-right text-blue-600">
                    {{ formatEuros(payment.principal) }}
                  </td>
                  <td class="py-3 px-4 text-right text-red-600">
                    {{ formatEuros(payment.interest) }}
                  </td>
                  <td class="py-3 px-4 text-right text-green-600">
                    {{ formatEuros(payment.extraPayment) }}
                  </td>
                  <td class="py-3 px-4 text-right font-semibold">
                    {{ formatEuros(payment.remainingBalance) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="mt-4 text-center">
              <button
                @click="showAllPayments = !showAllPayments"
                class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                {{
                  showAllPayments
                    ? "Show Less"
                    : `Show All ${paymentSchedule.length} Payments`
                }}
              </button>
            </div>
          </div>

          <!-- Chart View -->
          <div v-if="showScheduleType === 'chart'" class="space-y-6">
            <!-- Principal vs Interest Chart -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">
                Principal vs Interest Over Time
              </h4>
              <div
                class="relative h-64 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg p-4"
              >
                <div class="absolute inset-4">
                  <svg class="w-full h-full" viewBox="0 0 400 200">
                    <!-- Chart lines -->
                    <polyline
                      :points="principalChartPoints"
                      fill="none"
                      stroke="#3B82F6"
                      stroke-width="3"
                      class="drop-shadow-sm"
                    />
                    <polyline
                      :points="interestChartPoints"
                      fill="none"
                      stroke="#EF4444"
                      stroke-width="3"
                      class="drop-shadow-sm"
                    />
                    <!-- Grid lines -->
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 20"
                          fill="none"
                          stroke="#E5E7EB"
                          stroke-width="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="400" height="200" fill="url(#grid)" />
                  </svg>
                </div>
                <div class="absolute top-4 right-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-blue-500 rounded"></div>
                    <span class="text-sm text-gray-700">Principal</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-1 bg-red-500 rounded"></div>
                    <span class="text-sm text-gray-700">Interest</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Balance Reduction Chart -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">
                Loan Balance Over Time
              </h4>
              <div
                class="relative h-48 bg-gradient-to-r from-red-50 to-green-50 rounded-lg p-4"
              >
                <div class="absolute inset-4">
                  <svg class="w-full h-full" viewBox="0 0 400 160">
                    <!-- Balance line -->
                    <polyline
                      :points="balanceChartPoints"
                      fill="none"
                      stroke="#059669"
                      stroke-width="4"
                      class="drop-shadow-sm"
                    />
                    <!-- Fill area under the curve -->
                    <polygon
                      :points="balanceChartPoints + ' 400,160 0,160'"
                      fill="url(#balanceGradient)"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient
                        id="balanceGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          style="stop-color: #059669; stop-opacity: 0.8"
                        />
                        <stop
                          offset="100%"
                          style="stop-color: #059669; stop-opacity: 0.1"
                        />
                      </linearGradient>
                    </defs>
                    <!-- Grid -->
                    <rect width="400" height="160" fill="url(#grid)" />
                  </svg>
                </div>
                <div class="absolute bottom-4 left-4 text-sm text-gray-600">
                  <div>Start: {{ formatEuros(loanAmount) }}</div>
                  <div>Current: {{ formatEuros(results.currentBalance) }}</div>
                  <div class="text-green-600 font-semibold">
                    Paid Down: {{ results.progressPercent }}%
                  </div>
                </div>
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
                  Unlike many countries, German mortgages typically allow
                  {{ extraPaymentRights }}% extra payment rights - you can pay
                  off your entire loan at any time without penalties!
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

// Payment Schedule UI
const showScheduleType = ref("table");
const showAllPayments = ref(false);

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

  // Calculate how many months have passed since start date
  const startDateObj = new Date(startDate.value);
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDateObj.getFullYear()) * 12 +
      (currentDate.getMonth() - startDateObj.getMonth())
  );

  // Calculate current balance by simulating payments made so far
  let currentBalance = loanAmount.value;
  let totalInterestPaid = 0;

  for (let month = 1; month <= monthsElapsed && currentBalance > 0; month++) {
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    totalInterestPaid += interestPayment;
    currentBalance = Math.max(
      0,
      currentBalance - principalPayment - extraPayment.value
    );
  }

  // Calculate remaining payments
  const remainingPayments = Math.max(0, totalMonths - monthsElapsed);

  // Calculate remaining interest if no extra payments
  let remainingInterest = 0;
  let tempBalance = currentBalance;
  for (let month = 0; month < remainingPayments && tempBalance > 0; month++) {
    const interestPayment = tempBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingInterest += interestPayment;
    tempBalance = Math.max(0, tempBalance - principalPayment);
  }

  // Calculate with extra payments scenario
  let balanceWithExtra = currentBalance;
  let monthsWithExtra = 0;
  let totalInterestWithExtra = 0;

  while (balanceWithExtra > 0 && monthsWithExtra < remainingPayments) {
    const interestPayment = balanceWithExtra * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;

    totalInterestWithExtra += interestPayment;
    balanceWithExtra = Math.max(
      0,
      balanceWithExtra - principalPayment - extraPayment.value
    );
    monthsWithExtra++;
  }

  const interestSaved = remainingInterest - totalInterestWithExtra;
  const timeSaved = remainingPayments - monthsWithExtra;

  // Calculate payoff dates
  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + monthsWithExtra);

  const originalPayoffDate = new Date();
  originalPayoffDate.setMonth(
    originalPayoffDate.getMonth() + remainingPayments
  );

  // Calculate percentages
  const currentInterestPayment = currentBalance * monthlyRate;
  const principalPercent = Math.round(
    ((monthlyPayment - currentInterestPayment) / monthlyPayment) * 100
  );
  const progressPercent = Math.round(
    ((loanAmount.value - currentBalance) / loanAmount.value) * 100
  );

  return {
    monthlyPayment,
    currentBalance,
    totalInterest: remainingInterest,
    remainingPayments,
    interestSaved: Math.max(0, interestSaved),
    timeSaved,
    newPayoffDate,
    debtFreeDate: originalPayoffDate,
    principalPercent,
    progressPercent,
  };
});

// Payment Schedule computation
const paymentSchedule = computed(() => {
  const monthlyRate = interestRate.value / 100 / 12;
  const totalMonths = termYears.value * 12;
  const monthlyPayment =
    (loanAmount.value *
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  const startDateObj = new Date(startDate.value);
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDateObj.getFullYear()) * 12 +
      (currentDate.getMonth() - startDateObj.getMonth())
  );

  const schedule = [];
  let balance = loanAmount.value;

  for (let month = 1; month <= totalMonths && balance > 0; month++) {
    const paymentDate = new Date(startDateObj);
    paymentDate.setMonth(paymentDate.getMonth() + month - 1);

    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    const extraPaymentAmount = extraPayment.value;
    const totalPayment = monthlyPayment + extraPaymentAmount;

    balance = Math.max(0, balance - principalPayment - extraPaymentAmount);

    schedule.push({
      paymentNumber: month,
      date: paymentDate.toLocaleDateString("de-DE", {
        month: "short",
        year: "numeric",
      }),
      totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      extraPayment: extraPaymentAmount,
      remainingBalance: balance,
      isPast: month <= monthsElapsed,
    });
  }

  return schedule;
});

// Chart data computations
const principalChartPoints = computed(() => {
  const schedule = paymentSchedule.value;
  const maxPrincipal = Math.max(...schedule.map((p) => p.principal));

  return schedule
    .map((payment, index) => {
      const x = (index / Math.max(schedule.length - 1, 1)) * 400;
      const y = 200 - (payment.principal / maxPrincipal) * 180;
      return `${x},${y}`;
    })
    .join(" ");
});

const interestChartPoints = computed(() => {
  const schedule = paymentSchedule.value;
  const maxInterest = Math.max(...schedule.map((p) => p.interest));

  return schedule
    .map((payment, index) => {
      const x = (index / Math.max(schedule.length - 1, 1)) * 400;
      const y = 200 - (payment.interest / maxInterest) * 180;
      return `${x},${y}`;
    })
    .join(" ");
});

const balanceChartPoints = computed(() => {
  const schedule = paymentSchedule.value;
  const maxBalance = loanAmount.value;

  // Add starting point
  const points = [`0,${160 - (maxBalance / maxBalance) * 140}`];

  schedule.forEach((payment, index) => {
    const x = ((index + 1) / schedule.length) * 400;
    const y = 160 - (payment.remainingBalance / maxBalance) * 140;
    points.push(`${x},${y}`);
  });

  return points.join(" ");
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

function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
}
</script>
