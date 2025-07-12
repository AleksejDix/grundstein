<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            💰 Debt Management Dashboard
          </h1>
          <p class="text-lg text-gray-600">
            Complete overview of your financial obligations and optimization
            opportunities
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="initializeLoans"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Initialize Data
          </button>
          <button
            @click="refreshData"
            class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- Top Metrics Row -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-sm font-medium text-gray-600 uppercase tracking-wide"
              >
                Total Debt
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatEuros(totalSummary.totalCurrentBalance) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ totalSummary.totalLoans }} active loans
              </p>
            </div>
            <div class="bg-red-100 rounded-full p-3">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-sm font-medium text-gray-600 uppercase tracking-wide"
              >
                Monthly Payments
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatEuros(totalSummary.totalMonthlyPayments) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Combined obligation</p>
            </div>
            <div class="bg-orange-100 rounded-full p-3">
              <svg
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-sm font-medium text-gray-600 uppercase tracking-wide"
              >
                Future Interest
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatEuros(totalSummary.totalRemainingInterest) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Can be reduced</p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <svg
                class="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p
                class="text-sm font-medium text-gray-600 uppercase tracking-wide"
              >
                Debt-Free By
              </p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ totalSummary.averageDebtFreeDate }}
              </p>
              <p class="text-sm text-gray-500 mt-1">Target completion</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Charts Section (Left) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Debt Balance Over Time Chart -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              📊 Debt Balance Over Time
            </h3>
            <div class="h-64">
              <DebtBalanceChart
                v-if="loanOverview.length > 0"
                :loans="chartData"
              />
              <div
                v-else
                class="h-full flex items-center justify-center bg-gray-50 rounded-lg"
              >
                <div class="text-center text-gray-500">
                  <svg
                    class="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                  <p class="font-medium">No loan data available</p>
                  <p class="text-sm mt-1">
                    Initialize sample loans to see the chart
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Breakdown Chart -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              🥧 Monthly Payment Breakdown
            </h3>
            <div class="grid grid-cols-2 gap-6">
              <div class="h-48">
                <PaymentBreakdownChart
                  v-if="loanOverview.length > 0"
                  :breakdown="paymentBreakdown"
                />
                <div
                  v-else
                  class="h-full flex items-center justify-center bg-gray-50 rounded-lg"
                >
                  <div class="text-center text-gray-500">
                    <svg
                      class="w-12 h-12 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      ></path>
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      ></path>
                    </svg>
                    <p class="text-sm">No data available</p>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-gray-700"
                      >Principal</span
                    >
                  </div>
                  <span class="text-sm font-bold text-blue-600">{{
                    formatEuros(totalSummary.totalMonthlyPayments * 0.6)
                  }}</span>
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span class="text-sm font-medium text-gray-700"
                      >Interest</span
                    >
                  </div>
                  <span class="text-sm font-bold text-red-600">{{
                    formatEuros(totalSummary.totalMonthlyPayments * 0.4)
                  }}</span>
                </div>
                <div class="pt-2 border-t border-gray-200">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-900"
                      >Total Monthly</span
                    >
                    <span class="text-sm font-bold text-gray-900">{{
                      formatEuros(totalSummary.totalMonthlyPayments)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loan Summary (Right) -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              ⚡ Quick Stats
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Highest Interest Rate</span>
                <span class="font-semibold text-red-600">7.2%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Largest Loan</span>
                <span class="font-semibold text-gray-900">{{
                  formatEuros(
                    Math.max(...loanOverview.map((l) => l.loanAmount))
                  )
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Longest Term</span>
                <span class="font-semibold text-gray-900"
                  >{{
                    Math.max(
                      ...loanOverview.map((l) => Math.round(l.termMonths / 12))
                    )
                  }}
                  years</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600"
                  >Total Interest Savings Potential</span
                >
                <span class="font-semibold text-green-600">{{
                  formatEuros(totalSummary.totalRemainingInterest * 0.15)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Optimization Opportunities -->
          <div
            class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
          >
            <h3 class="text-lg font-semibold text-green-900 mb-4">
              💡 Optimization Opportunities
            </h3>
            <div class="space-y-3">
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-green-800">
                    Extra Payments
                  </p>
                  <p class="text-xs text-green-700">
                    Add €200/month to save ~€15,000 in interest
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-green-800">Refinancing</p>
                  <p class="text-xs text-green-700">
                    Lower rates could reduce monthly payments
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="text-sm font-medium text-green-800">
                    Debt Avalanche
                  </p>
                  <p class="text-xs text-green-700">
                    Focus extra payments on highest interest loans
                  </p>
                </div>
              </div>
            </div>
            <button
              class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4 rounded-lg transition"
            >
              Create Optimization Plan
            </button>
          </div>

          <!-- Loan Progress -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              🎯 Progress Overview
            </h3>
            <div class="space-y-4">
              <div
                v-for="loan in loanOverview.slice(0, 3)"
                :key="loan.id"
                class="space-y-2"
              >
                <div class="flex justify-between text-sm">
                  <span class="font-medium text-gray-700">{{ loan.name }}</span>
                  <span class="text-gray-600"
                    >{{
                      Math.round(
                        (1 - loan.calculated.currentBalance / loan.loanAmount) *
                          100
                      )
                    }}%</span
                  >
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    :style="{
                      width:
                        Math.round(
                          (1 -
                            loan.calculated.currentBalance / loan.loanAmount) *
                            100
                        ) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Individual Loans Overview -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">📋 Your Loans</h2>
          <button
            @click="initializeLoans"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Initialize Sample Loans
          </button>
        </div>

        <div
          v-if="loanOverview.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <p class="mb-4">
            No loans found. Click "Initialize Sample Loans" to load your
            scenarios.
          </p>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="loan in loanOverview"
            :key="loan.id"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-1">
                  {{ loan.name }}
                </h3>
                <p class="text-sm text-gray-600">{{ loan.notes }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">
                  Started {{ formatDate(loan.startDate) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ loan.interestRate }}% •
                  {{ Math.round(loan.termMonths / 12) }} years
                </div>
              </div>
            </div>

            <div class="grid md:grid-cols-5 gap-4">
              <div class="text-center">
                <div class="text-lg font-bold text-red-600">
                  {{ formatEuros(loan.calculated.currentBalance) }}
                </div>
                <div class="text-xs text-gray-600">Current Balance</div>
              </div>

              <div class="text-center">
                <div class="text-lg font-bold text-orange-600">
                  {{ loan.calculated.remainingPayments }}
                </div>
                <div class="text-xs text-gray-600">Payments Left</div>
              </div>

              <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">
                  {{ formatEuros(loan.calculated.remainingInterest) }}
                </div>
                <div class="text-xs text-gray-600">Interest Left</div>
              </div>

              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">
                  {{ formatEuros(loan.calculated.monthlyPayment) }}
                </div>
                <div class="text-xs text-gray-600">Monthly Payment</div>
              </div>

              <div class="text-center">
                <div class="text-lg font-bold text-green-600">
                  {{ loan.calculated.debtFreeDate }}
                </div>
                <div class="text-xs text-gray-600">Debt-Free Date</div>
              </div>
            </div>

            <!-- Extra Payments Summary -->
            <div
              v-if="Object.keys(loan.extraPayments).length > 0"
              class="mt-4 p-3 bg-gray-50 rounded-lg"
            >
              <div class="text-sm font-medium text-gray-700 mb-2">
                Extra Payments:
              </div>
              <div class="text-sm text-gray-600">
                {{ getExtraPaymentsSummary(loan.extraPayments) }}
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 flex gap-3 justify-end">
              <router-link
                :to="`/modern?edit=${loan.id}`"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                ✏️ Edit Mortgage
              </router-link>
              <button
                @click="deleteLoan(loan.id)"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Scenario Analysis: €70k Loan -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          🤔 Economic Decision: Take €70k Loan at 7.2%?
        </h2>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Current Scenario -->
          <div class="border-2 border-gray-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">
              ✅ Current Situation (Without New Loan)
            </h3>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Debt:</span>
                <span class="font-semibold">{{
                  formatEuros(currentScenario.totalDebt)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Monthly Payments:</span>
                <span class="font-semibold">{{
                  formatEuros(currentScenario.monthlyPayments)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Interest Cost:</span>
                <span class="font-semibold">{{
                  formatEuros(currentScenario.totalInterest)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Debt-Free By:</span>
                <span class="font-semibold">{{
                  currentScenario.debtFreeDate
                }}</span>
              </div>
            </div>
          </div>

          <!-- New Loan Scenario -->
          <div class="border-2 border-orange-200 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">
              ⚠️ With €70k New Loan (7.2%, Aug 2025)
            </h3>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Total Debt:</span>
                <span class="font-semibold">{{
                  formatEuros(withNewLoanScenario.totalDebt)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Monthly Payments:</span>
                <span class="font-semibold">{{
                  formatEuros(withNewLoanScenario.monthlyPayments)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Total Interest Cost:</span>
                <span class="font-semibold">{{
                  formatEuros(withNewLoanScenario.totalInterest)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Debt-Free By:</span>
                <span class="font-semibold">{{
                  withNewLoanScenario.debtFreeDate
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Economic Analysis -->
        <div class="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 class="text-lg font-semibold text-blue-900 mb-4 text-center">
            📊 Economic Impact Analysis
          </h3>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="text-center">
              <div
                class="text-2xl font-bold mb-1"
                :class="
                  economicAnalysis.additionalCost > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                "
              >
                {{ economicAnalysis.additionalCost > 0 ? "+" : ""
                }}{{ formatEuros(economicAnalysis.additionalCost) }}
              </div>
              <div class="text-sm text-gray-700">Additional Total Cost</div>
            </div>

            <div class="text-center">
              <div
                class="text-2xl font-bold mb-1"
                :class="
                  economicAnalysis.additionalMonthly > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                "
              >
                {{ economicAnalysis.additionalMonthly > 0 ? "+" : ""
                }}{{ formatEuros(economicAnalysis.additionalMonthly) }}
              </div>
              <div class="text-sm text-gray-700">
                Additional Monthly Payment
              </div>
            </div>

            <div class="text-center">
              <div
                class="text-2xl font-bold mb-1"
                :class="
                  economicAnalysis.recommendation === 'AVOID'
                    ? 'text-red-600'
                    : 'text-green-600'
                "
              >
                {{ economicAnalysis.recommendation }}
              </div>
              <div class="text-sm text-gray-700">Recommendation</div>
            </div>
          </div>

          <div class="mt-4 p-4 bg-white rounded-lg">
            <p class="text-sm text-gray-700 text-center">
              {{ economicAnalysis.explanation }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="text-center">
        <router-link
          to="/modern"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition mr-4"
        >
          🏠 Add New Mortgage
        </router-link>
        <router-link
          to="/mortgage"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition mr-4"
        >
          🧮 Calculator
        </router-link>
        <button
          @click="refreshData"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DebtBalanceChart from "../components/portfolio/DebtBalanceChart.vue";
import PaymentBreakdownChart from "../components/portfolio/PaymentBreakdownChart.vue";

const loanOverview = ref<any[]>([]);

// Load data
function loadData() {
  loanOverview.value = [];
}

// Initialize sample loans
function initializeLoans() {
  loadData();
}

// Refresh data
function refreshData() {
  loadData();
}

// Delete loan
function deleteLoan(loanId: string) {
  if (
    confirm(
      "Are you sure you want to delete this mortgage? This action cannot be undone."
    )
  ) {
    loadData(); // Refresh the list
  }
}

// Computed values
const totalSummary = computed(() => {
  return {
    totalCurrentBalance: 0,
    totalLoans: loanOverview.value.length,
    totalMonthlyPayments: 0,
    totalRemainingInterest: 0,
    averageDebtFreeDate: "2030",
    totalDebt: 0,
    totalMonthlyPayment: 0,
    totalInterestPaid: 0,
  };
});

// Chart data
const chartData = computed(() => {
  return loanOverview.value.map((loan) => ({
    id: loan.id,
    name: loan.name,
    loanAmount: loan.loanAmount,
    interestRate: loan.interestRate,
    termMonths: loan.termMonths,
    currentBalance: loan.calculated.currentBalance,
    monthlyPayment: loan.calculated.monthlyPayment,
  }));
});

const paymentBreakdown = computed(() => {
  const total = totalSummary.value.totalMonthlyPayments;
  // Rough approximation: early payments are typically 60% principal, 40% interest
  const principal = total * 0.6;
  const interest = total * 0.4;
  return { principal, interest, total };
});

// Scenario calculations
const currentScenario = computed(() => {
  const summary = totalSummary.value;
  return {
    totalDebt: summary.totalCurrentBalance,
    monthlyPayments: summary.totalMonthlyPayments,
    totalInterest: summary.totalRemainingInterest,
    debtFreeDate: summary.averageDebtFreeDate,
  };
});

const withNewLoanScenario = computed(() => {
  const current = currentScenario.value;

  return {
    totalDebt: current.totalDebt,
    monthlyPayments: current.monthlyPayments,
    totalInterest: current.totalInterest,
    debtFreeDate: current.debtFreeDate,
  };
});

const economicAnalysis = computed(() => {
  const current = currentScenario.value;
  const withNew = withNewLoanScenario.value;

  const additionalCost = withNew.totalInterest - current.totalInterest;
  const additionalMonthly = withNew.monthlyPayments - current.monthlyPayments;

  let recommendation = "CONSIDER";
  let explanation =
    "The new loan adds significant debt. Consider if the benefits justify the costs.";

  if (additionalCost > 15000) {
    recommendation = "AVOID";
    explanation = `The €70k loan would cost you an additional ${formatEuros(
      additionalCost
    )} in interest. Unless absolutely necessary, avoid this loan.`;
  } else if (additionalMonthly > 1000) {
    recommendation = "CAUTION";
    explanation = `Monthly payments would increase by ${formatEuros(
      additionalMonthly
    )}. Ensure your budget can handle this increase.`;
  } else {
    recommendation = "ACCEPTABLE";
    explanation = `The additional cost is manageable. Consider if you really need the €70k and if there are better alternatives.`;
  }

  return {
    additionalCost,
    additionalMonthly,
    recommendation,
    explanation,
  };
});

// Utility functions
function formatEuros(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    month: "short",
    year: "numeric",
  });
}

function getExtraPaymentsSummary(
  extraPayments: Record<number, number>
): string {
  const payments = Object.entries(extraPayments);
  if (payments.length === 0) return "None";

  const total = Object.values(extraPayments).reduce(
    (sum, amount) => sum + amount,
    0
  );

  if (payments.length === 1) {
    const [month, amount] = payments[0];
    return `${formatEuros(amount)} in month ${month}`;
  } else if (payments.length <= 5) {
    return `${payments.length} payments totaling ${formatEuros(total)}`;
  } else {
    return `€184/month extra payments (${formatEuros(total)} total)`;
  }
}

// Initialize
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
