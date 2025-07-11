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
          {{ savedLoanId ? "✏️ Edit Mortgage" : "Get Debt-Free Faster" }}
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{
            savedLoanId
              ? `Editing: ${mortgageName}`
              : "See exactly what you owe and how to pay it off sooner"
          }}
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
                  v-model.number="adapter.inputs.loan"
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
                  v-model.number="adapter.inputs.interestRate"
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
              <EditableAmount
                v-model="adapter.inputs.monthlyPayment"
                class="inline-block mx-2"
                prefix="€"
                :min="100"
                :max="50000"
                placeholder="auto"
              />
              <span class="text-lg text-gray-700">monthly payments</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">with</span>
              <EditablePercentage
                v-model="adapter.sondertilgungMaxPercent.value"
                class="inline-block mx-2"
                :min="0"
                :max="100"
                suffix="% annual"
              />
              <span class="text-lg text-gray-700">extra payment rights</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">vs ETF investing at</span>
              <EditablePercentage
                v-model="etfReturnRate"
                class="inline-block mx-2"
                :min="0"
                :max="20"
                suffix="% annual"
              />
              <span class="text-lg text-gray-700">expected return</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-lg text-gray-700">starting on</span>
              <input
                v-model="adapter.inputs.startDate"
                type="date"
                class="inline-block mx-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
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
                @click="setPreset('smallLoan')"
                class="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <div class="font-semibold text-blue-900">
                  Small Loan Example
                </div>
                <div class="text-sm text-blue-700">
                  €15K • 8% • 10 years • €182/month extra
                </div>
              </button>
              <button
                @click="setPreset('largeLoan')"
                class="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <div class="font-semibold text-green-900">
                  Large Loan Example
                </div>
                <div class="text-sm text-green-700">
                  €100K • 5.6% • 7 years • €17K in month 2
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Calculate Button -->
        <div class="text-center mb-8">
          <button
            @click="calculate"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            :disabled="!isValidInput"
          >
            Show me the numbers
          </button>
        </div>

        <!-- Save/Load Actions -->
        <div v-if="showResults" class="text-center mb-8">
          <div class="flex justify-center gap-4 flex-wrap">
            <button
              @click="showSaveDialog"
              :class="[
                'font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm',
                isSaved
                  ? 'bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg',
              ]"
            >
              {{ isSaved ? "✅ Mortgage Saved" : "💾 Save This Mortgage" }}
            </button>

            <router-link
              to="/debt-overview"
              class="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm shadow-lg"
            >
              📊 View Portfolio Dashboard
            </router-link>

            <button
              @click="resetToNew"
              class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-sm shadow-lg"
            >
              🆕 Calculate New Mortgage
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-center mb-8">
          <div
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          >
            {{ errorMessage }}
          </div>
        </div>

        <!-- Results Display -->
        <div
          v-if="showResults && adapter.presentation.value.isValid"
          class="space-y-6"
        >
          <!-- Debt Payoff Focus -->
          <div class="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <h3 class="text-2xl font-bold text-red-800 mb-6 text-center">
              🎯 Your Path to Debt Freedom
            </h3>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center relative group">
                <div class="text-3xl font-bold text-red-700">
                  {{ formatEuros(getProjectedBalance()) }}
                </div>
                <div class="text-sm text-red-600 font-medium">
                  Current Balance
                </div>
                <div class="text-xs text-red-500">Still owe</div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">💰 What you still owe</div>
                  This is your remaining debt after accounting for extra
                  payments. The goal is to get this to €0 as quickly as possible
                  to stop paying interest.
                </div>
              </div>

              <div class="text-center relative group">
                <div class="text-3xl font-bold text-orange-600">
                  {{ getProjectedRemainingPayments() }}
                </div>
                <div class="text-sm text-orange-600 font-medium">
                  Payments Left
                </div>
                <div class="text-xs text-orange-500">
                  {{ getProjectedDebtFreeDate() }}
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">
                    📅 Your debt-free countdown
                  </div>
                  This is how many more monthly payments you need to make before
                  you're completely debt-free. Extra payments reduce this
                  number!
                </div>
              </div>

              <div class="text-center relative group">
                <div class="text-3xl font-bold text-yellow-600">
                  {{ formatEuros(getProjectedRemainingInterest()) }}
                </div>
                <div class="text-sm text-yellow-600 font-medium">
                  Interest Left
                </div>
                <div class="text-xs text-yellow-500">
                  With planned extra payments
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">
                    ⚡ Interest you'll still pay
                  </div>
                  This is the total interest cost remaining on your loan. Every
                  extra payment reduces this amount - it's money saved that
                  stays in your pocket!
                </div>
              </div>

              <div class="text-center relative group">
                <div class="text-3xl font-bold text-indigo-600">
                  {{ formatEuros(adapter.presentation.value.monthlyPayment) }}
                </div>
                <div class="text-sm text-indigo-600 font-medium">
                  Monthly Payment
                </div>
                <div class="text-xs text-indigo-500">
                  {{
                    adapter.presentation.value.principalPercentage.toFixed(1)
                  }}% principal
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">💳 Your required payment</div>
                  {{
                    adapter.presentation.value.principalPercentage.toFixed(1)
                  }}% goes to paying down your debt,
                  {{
                    (
                      100 - adapter.presentation.value.principalPercentage
                    ).toFixed(1)
                  }}% goes to interest. Higher principal % means you're building
                  equity faster!
                </div>
              </div>
            </div>
          </div>

          <!-- Get Debt-Free Faster -->
          <div
            class="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6"
          >
            <h3 class="text-xl font-bold text-green-800 mb-4 text-center">
              💚 Get Debt-Free Faster with Extra Payments
            </h3>

            <div class="grid md:grid-cols-3 gap-4 text-center">
              <div class="bg-white rounded-lg p-4 relative group">
                <div class="text-2xl font-bold text-green-600">
                  {{ formatEuros(getExtraPaymentImpact().interestSaved) }}
                </div>
                <div class="text-sm text-green-600 font-medium">
                  Interest Saved
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">💰 Money you keep!</div>
                  This is the total interest you'll avoid paying with your extra
                  payments. It's like earning this money back - an excellent
                  return on investment!
                </div>
              </div>

              <div class="bg-white rounded-lg p-4 relative group">
                <div class="text-2xl font-bold text-green-600">
                  {{ getExtraPaymentImpact().monthsReduced }}
                </div>
                <div class="text-sm text-green-600 font-medium">
                  Months Sooner
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">🚀 Time saved</div>
                  This is how many months earlier you'll be debt-free with extra
                  payments. Getting out of debt faster means more years of
                  financial freedom!
                </div>
              </div>

              <div class="bg-white rounded-lg p-4 relative group">
                <div class="text-2xl font-bold text-green-600">
                  {{ getExtraPaymentImpact().newDebtFreeDate }}
                </div>
                <div class="text-sm text-green-600 font-medium">
                  New Debt-Free Date
                </div>

                <!-- Tooltip -->
                <div
                  class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                >
                  <div class="font-semibold mb-1">🎉 Your freedom date!</div>
                  This is when you'll make your final payment and be completely
                  debt-free. Mark this date on your calendar - it's your
                  financial independence day!
                </div>
              </div>
            </div>
          </div>

          <!-- Debt Progress Visualization -->
          <div class="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4 text-gray-800 text-center">
              📊 Your Debt Payoff Progress
            </h3>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Debt Paid Off</span>
                <span class="relative group cursor-help">
                  {{ getDebtPayoffPercentage() }}%

                  <!-- Tooltip -->
                  <div
                    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-64 z-10"
                  >
                    <div class="font-semibold mb-1">📊 Your progress</div>
                    This shows what percentage of your original debt you've
                    eliminated. As you make extra payments, watch this number
                    grow toward 100%!
                  </div>
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div
                  class="bg-gradient-to-r from-red-500 to-green-500 h-4 rounded-full transition-all duration-500"
                  :style="{ width: getDebtPayoffPercentage() + '%' }"
                ></div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid md:grid-cols-2 gap-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Original Loan:</span>
                <span class="font-semibold text-gray-800">{{
                  formatEuros(adapter.inputs.loan)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Monthly Payment:</span>
                <span class="font-semibold text-gray-800">{{
                  formatEuros(adapter.presentation.value.monthlyPayment)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Plan Your Extra Payments -->
          <div class="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <h3 class="text-xl font-semibold mb-3 text-green-800">
              🇨🇭 Plan Your Extra Payment Strategy
            </h3>

            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-green-700 mb-2">
                  Your Annual Extra Payment Budget
                </label>
                <div class="text-lg font-bold text-green-800">
                  {{ formatEuros(getMaxAnnualExtraPayments()) }} per year
                </div>
                <div class="text-xs text-green-600">
                  {{ formatEuros(getMaxAnnualExtraPayments() / 12) }} per month
                  available
                </div>
              </div>

              <div>
                <button
                  @click="addExtraPayment"
                  class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
                >
                  + Add Extra Payment
                </button>
              </div>
            </div>

            <!-- Extra Payments List with ROI Analysis -->
            <div
              v-if="Object.keys(adapter.extraPayments.value).length > 0"
              class="space-y-3"
            >
              <h4 class="font-semibold text-green-800 mb-3">
                💰 Your Extra Payments vs ETF Investing:
              </h4>

              <div
                v-for="(amount, month) in adapter.extraPayments.value"
                :key="month"
                class="bg-white p-4 rounded-lg border border-green-200 shadow-sm"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="font-semibold text-lg">
                      Month {{ month }}: {{ formatEuros(amount) }}
                    </div>
                  </div>
                  <button
                    @click="removeExtraPayment(Number(month))"
                    class="text-red-600 hover:text-red-800 font-semibold text-sm px-2 py-1 rounded"
                  >
                    ✕ Remove
                  </button>
                </div>

                <!-- ROI Comparison -->
                <div
                  class="grid md:grid-cols-2 gap-4 mb-3"
                  v-if="(() => {
                  const roi = calculateExtraPaymentROI(Number(month), amount);
                  const rec = getROIRecommendation(roi);
                  return { roi, rec };
                })() as any"
                >
                  <!-- Mortgage Option -->
                  <div
                    class="bg-green-50 p-3 rounded-lg border border-green-200"
                  >
                    <div class="text-sm font-medium text-green-800 mb-1">
                      🏠 Extra Payment Option
                    </div>
                    <div class="text-green-700">
                      Interest saved:
                      {{
                        formatEuros(
                          (() => {
                            const roi = calculateExtraPaymentROI(
                              Number(month),
                              amount
                            );
                            return roi.interestSaved;
                          })()
                        )
                      }}
                    </div>
                    <div class="text-xs text-green-600">
                      {{
                        (() => {
                          const roi = calculateExtraPaymentROI(
                            Number(month),
                            amount
                          );
                          const months = roi.timeHorizonMonths || 0;
                          const returnRate =
                            roi.mortgageAnnualReturn.toFixed(2);

                          if (months < 12) {
                            return `${returnRate}% simple return (${months} months)`;
                          } else {
                            return `${returnRate}% annual return (${(
                              months / 12
                            ).toFixed(1)} years)`;
                          }
                        })()
                      }}
                    </div>
                  </div>

                  <!-- ETF Option -->
                  <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div class="text-sm font-medium text-blue-800 mb-1">
                      📈 ETF Investment Option
                    </div>
                    <div class="text-blue-700">
                      Expected gains:
                      {{
                        formatEuros(
                          (() => {
                            const roi = calculateExtraPaymentROI(
                              Number(month),
                              amount
                            );
                            return roi.etfGains;
                          })()
                        )
                      }}
                    </div>
                    <div class="text-xs text-blue-600">
                      Expected return: {{ etfReturnRate }}% annual
                    </div>
                  </div>
                </div>

                <!-- Recommendation -->
                <div
                  class="text-center p-2 rounded-lg"
                  :class="{
                    'bg-green-100 text-green-800': (() => {
                      const roi = calculateExtraPaymentROI(
                        Number(month),
                        amount
                      );
                      return roi.isMortgageBetter;
                    })(),
                    'bg-blue-100 text-blue-800': !(() => {
                      const roi = calculateExtraPaymentROI(
                        Number(month),
                        amount
                      );
                      return roi.isMortgageBetter;
                    })(),
                  }"
                >
                  <div class="font-semibold">
                    {{
                      (() => {
                        const roi = calculateExtraPaymentROI(
                          Number(month),
                          amount
                        );
                        const rec = getROIRecommendation(roi);
                        return rec.icon + " " + rec.text;
                      })()
                    }}
                  </div>
                  <div class="text-sm">
                    {{
                      (() => {
                        const roi = calculateExtraPaymentROI(
                          Number(month),
                          amount
                        );
                        const rec = getROIRecommendation(roi);
                        return rec.advice;
                      })()
                    }}
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div class="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div class="text-lg font-bold text-gray-800">
                      {{ formatEuros(getTotalExtraPayments()) }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Total Extra Payments
                    </div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-green-700">
                      {{
                        (() => {
                          let totalInterestSaved = 0;
                          Object.entries(adapter.extraPayments.value).forEach(
                            ([month, amount]) => {
                              const roi = calculateExtraPaymentROI(
                                Number(month),
                                amount
                              );
                              totalInterestSaved += roi.interestSaved;
                            }
                          );
                          return formatEuros(totalInterestSaved);
                        })()
                      }}
                    </div>
                    <div class="text-sm text-gray-600">
                      Total Interest Saved
                    </div>
                  </div>
                  <div>
                    <div class="text-lg font-bold text-blue-700">
                      {{
                        (() => {
                          let totalETFGains = 0;
                          Object.entries(adapter.extraPayments.value).forEach(
                            ([month, amount]) => {
                              const roi = calculateExtraPaymentROI(
                                Number(month),
                                amount
                              );
                              totalETFGains += roi.etfGains;
                            }
                          );
                          return formatEuros(totalETFGains);
                        })()
                      }}
                    </div>
                    <div class="text-sm text-gray-600">Potential ETF Gains</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Schedule Section -->
          <div class="mt-8">
            <PaymentSchedule
              :loan-amount="adapter.inputs.loan"
              :interest-rate="adapter.inputs.interestRate"
              :term-months="adapter.inputs.termMonths || 84"
              v-model:extra-payments="adapter.extraPayments.value"
              :sondertilgung-max-percent="adapter.sondertilgungMaxPercent.value"
              :start-date="adapter.inputs.startDate"
            />
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="text-center mb-8">
        <router-link
          to="/debt-overview"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition mr-4"
        >
          📊 View Complete Debt Overview
        </router-link>
        <button
          @click="calculate"
          class="bg-gray-600 hover:bg-gray-700 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg transition"
        >
          Recalculate
        </button>
      </div>

      <!-- Footer -->
      <div class="text-center text-gray-500 pb-8">
        <p class="mb-2">Powered by Domain-Driven Design & TypeScript</p>
        <p class="text-sm">
          Calculations validated with Swiss mortgage standards •
          <router-link
            to="/debt-overview"
            class="text-indigo-600 hover:text-indigo-800"
          >
            View all loans comparison
          </router-link>
        </p>
      </div>
    </div>
  </div>

  <!-- Save Modal -->
  <div
    v-if="showSaveModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="showSaveModal = false"
  >
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
      <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        💾 Save Your Mortgage
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mortgage Name
          </label>
          <input
            v-model="mortgageName"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
            placeholder="e.g., Home Mortgage 2024"
            @keyup.enter="saveMortgage"
          />
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-semibold text-gray-900 mb-2">Quick Summary</h4>
          <div class="text-sm text-gray-600 space-y-1">
            <p>• Amount: {{ formatEuros(adapter.inputs.loan) }}</p>
            <p>• Rate: {{ adapter.inputs.interestRate }}%</p>
            <p>• Term: {{ termYears }} years</p>
            <p>
              • Extra Payments:
              {{ Object.keys(adapter.extraPayments.value).length }} payments
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button
          @click="showSaveModal = false"
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveMortgage"
          class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {{ savedLoanId ? "Update" : "Save" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { MortgageAdapter } from "../presentation/adapters/MortgageAdapter";
import {
  LoanStorageService,
  type StoredLoan,
} from "../services/LoanStorageService";

// Components
import EditableAmount from "../presentation/components/ui/EditableAmount.vue";
import EditablePercentage from "../presentation/components/ui/EditablePercentage.vue";
import EditableNumber from "../presentation/components/ui/EditableNumber.vue";
import MetricCard from "../presentation/components/ui/MetricCard.vue";
import PaymentSchedule from "../presentation/components/mortgage/PaymentScheduleSimple.vue";

// Create adapter instance
const adapter = new MortgageAdapter();

// Loan storage service
const loanService = new LoanStorageService();

// Route for edit parameter
const route = useRoute();

// Reactive state
const showResults = ref(false);
const errorMessage = ref("");
const etfReturnRate = ref(7); // Default 7% annual ETF return

// Save state
const mortgageName = ref("");
const isSaved = ref(false);
const savedLoanId = ref<string | null>(null);
const showSaveModal = ref(false);

// Computed values
const termYears = computed({
  get: () =>
    adapter.inputs.termMonths ? Math.round(adapter.inputs.termMonths / 12) : 7,
  set: (years) => {
    adapter.inputs.termMonths = years * 12;
  },
});

const isValidInput = computed(() => {
  return (
    adapter.inputs.loan > 0 &&
    adapter.inputs.interestRate > 0 &&
    termYears.value > 0
  );
});

// Methods
async function calculate() {
  try {
    errorMessage.value = "";
    showResults.value = false;

    // Ensure we have a term
    if (!adapter.inputs.termMonths) {
      adapter.inputs.termMonths = termYears.value * 12;
    }

    // For now, just show basic presentation results without domain analysis
    showResults.value = true;
  } catch (error) {
    errorMessage.value = "Calculation error: " + String(error);
    console.error("Calculation error:", error);
  }
}

function setPreset(presetType: string) {
  // Clear extra payments first
  adapter.extraPayments.value = {};

  switch (presetType) {
    case "smallLoan":
      // €15,000 at 8% starting 1.1.2024 with €182 extra payment every month
      adapter.inputs.loan = 15000;
      adapter.inputs.interestRate = 8;
      termYears.value = 10;
      adapter.inputs.startDate = "2024-01-01";
      adapter.sondertilgungMaxPercent.value = 100; // Unlimited extra payments

      // Add €182 extra payment every month for the loan term
      const totalMonths = 10 * 12; // 10 years
      for (let month = 1; month <= totalMonths; month++) {
        adapter.extraPayments.value[month] = 182;
      }
      break;

    case "largeLoan":
      // €100,000 at 5.6% starting 1.1.2023 with €17,000 extra payment in month 2
      adapter.inputs.loan = 100000;
      adapter.inputs.interestRate = 5.6;
      termYears.value = 7;
      adapter.inputs.startDate = "2023-01-01";
      adapter.sondertilgungMaxPercent.value = 100; // Unlimited extra payments

      // Add €17,000 extra payment in month 2
      adapter.extraPayments.value[2] = 17000;
      break;
  }
}

function addExtraPayment() {
  const month = prompt(
    "Enter payment month (1-" + (adapter.inputs.termMonths || 84) + "):"
  );
  const amount = prompt("Enter extra payment amount (€):");

  if (month && amount) {
    const monthNum = Number(month);
    const amountNum = Number(amount);

    if (
      monthNum > 0 &&
      monthNum <= (adapter.inputs.termMonths || 84) &&
      amountNum > 0
    ) {
      adapter.extraPayments.value[monthNum] = amountNum;
    }
  }
}

function removeExtraPayment(month: number) {
  delete adapter.extraPayments.value[month];
}

// ROI Analysis Functions
function calculateExtraPaymentROI(paymentMonth: number, paymentAmount: number) {
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const totalTermMonths = adapter.inputs.termMonths || 84;
  const loanAmount = adapter.inputs.loan;

  // Calculate regular monthly payment
  const regularPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalTermMonths))) /
    (Math.pow(1 + monthlyRate, totalTermMonths) - 1);

  // Get all existing extra payments EXCEPT the one we're analyzing
  const otherExtraPayments = { ...adapter.extraPayments.value };
  delete otherExtraPayments[paymentMonth];

  // Calculate balance at payment month WITH other extra payments but WITHOUT this specific payment
  let balanceAtPaymentMonth = loanAmount;
  for (let month = 1; month < paymentMonth; month++) {
    const interestPortion = balanceAtPaymentMonth * monthlyRate;
    const principalPortion = regularPayment - interestPortion;
    const existingExtraPayment = otherExtraPayments[month] || 0;
    balanceAtPaymentMonth = Math.max(
      0,
      balanceAtPaymentMonth - principalPortion - existingExtraPayment
    );

    if (balanceAtPaymentMonth === 0) break;
  }

  // If loan is already paid off by this month, no benefit from additional payment
  if (balanceAtPaymentMonth === 0) {
    return {
      interestSaved: 0,
      etfGains: 0,
      mortgageAnnualReturn: 0,
      etfAnnualReturn: 0,
      isMortgageBetter: false,
      difference: 0,
      relativeBenefit: 0,
      monthsSavedByExtraPayment: 0,
    };
  }

  // Scenario 1: Continue from payment month WITHOUT this extra payment
  let balanceWithoutThisPayment = balanceAtPaymentMonth;
  let totalInterestWithoutThisPayment = 0;
  let currentMonth = paymentMonth;

  while (
    balanceWithoutThisPayment > 0.01 &&
    currentMonth <= totalTermMonths + 240
  ) {
    const interestPortion = balanceWithoutThisPayment * monthlyRate;
    const principalPortion = Math.min(
      regularPayment - interestPortion,
      balanceWithoutThisPayment
    );
    const existingExtraPayment = otherExtraPayments[currentMonth] || 0;

    totalInterestWithoutThisPayment += interestPortion;
    balanceWithoutThisPayment = Math.max(
      0,
      balanceWithoutThisPayment - principalPortion - existingExtraPayment
    );
    currentMonth++;

    if (balanceWithoutThisPayment === 0) break;
  }

  // Scenario 2: Apply this extra payment and continue
  let balanceWithThisPayment = Math.max(
    0,
    balanceAtPaymentMonth - paymentAmount
  );
  let totalInterestWithThisPayment = 0;
  let monthCountWithPayment = paymentMonth;

  while (
    balanceWithThisPayment > 0.01 &&
    monthCountWithPayment <= totalTermMonths + 240
  ) {
    const interestPortion = balanceWithThisPayment * monthlyRate;
    const principalPortion = Math.min(
      regularPayment - interestPortion,
      balanceWithThisPayment
    );
    const existingExtraPayment = otherExtraPayments[monthCountWithPayment] || 0;

    totalInterestWithThisPayment += interestPortion;
    balanceWithThisPayment = Math.max(
      0,
      balanceWithThisPayment - principalPortion - existingExtraPayment
    );
    monthCountWithPayment++;

    if (balanceWithThisPayment === 0) break;
  }

  // Interest saved is the difference
  const interestSaved =
    totalInterestWithoutThisPayment - totalInterestWithThisPayment;

  // Calculate investment horizon and months saved
  const payoffMonthsWithoutPayment = currentMonth - paymentMonth;
  const payoffMonthsWithPayment = monthCountWithPayment - paymentMonth;
  const monthsSaved = payoffMonthsWithoutPayment - payoffMonthsWithPayment;

  // ETF returns over the same period
  const monthlyETFRate = etfReturnRate.value / 100 / 12;
  const etfValue =
    paymentAmount * Math.pow(1 + monthlyETFRate, payoffMonthsWithoutPayment);
  const etfGains = etfValue - paymentAmount;

  // Calculate returns - use simple return for short periods, annualized for longer periods
  const years = payoffMonthsWithoutPayment / 12;
  const simpleReturn =
    interestSaved > 0 ? (interestSaved / paymentAmount) * 100 : 0;

  // Only annualize if time horizon is reasonable (at least 12 months)
  const mortgageAnnualReturn =
    payoffMonthsWithoutPayment >= 12 && years > 0 && interestSaved > 0
      ? (Math.pow(1 + interestSaved / paymentAmount, 1 / years) - 1) * 100
      : simpleReturn;

  const etfAnnualReturn =
    payoffMonthsWithoutPayment >= 12 && years > 0
      ? (Math.pow(etfValue / paymentAmount, 1 / years) - 1) * 100
      : etfReturnRate.value;

  return {
    interestSaved: Math.max(0, interestSaved),
    etfGains,
    mortgageAnnualReturn,
    etfAnnualReturn,
    isMortgageBetter: interestSaved > etfGains,
    difference: Math.abs(interestSaved - etfGains),
    relativeBenefit:
      interestSaved > etfGains && etfGains > 0
        ? ((interestSaved - etfGains) / etfGains) * 100
        : etfGains > interestSaved && interestSaved > 0
        ? ((etfGains - interestSaved) / interestSaved) * 100
        : 0,
    monthsSavedByExtraPayment: monthsSaved,
    timeHorizonMonths: payoffMonthsWithoutPayment,
    isShortTerm: payoffMonthsWithoutPayment < 12,
    simpleReturn: interestSaved > 0 ? (interestSaved / paymentAmount) * 100 : 0,
  };
}

function getROIRecommendation(roi: any) {
  if (roi.isMortgageBetter) {
    return {
      color: "green",
      icon: "✅",
      text: `Extra payment wins by ${roi.relativeBenefit.toFixed(1)}%`,
      advice: "Good investment! Pay down mortgage.",
    };
  } else {
    return {
      color: "blue",
      icon: "📈",
      text: `ETF wins by ${roi.relativeBenefit.toFixed(1)}%`,
      advice: "Consider investing in ETF instead.",
    };
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

// Projected debt calculations INCLUDING all planned extra payments
function getProjectedBalance(): number {
  // Calculate balance considering ALL planned extra payments
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  // Calculate monthly payment using loan formula
  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = adapter.inputs.loan;
  const startDate = new Date(adapter.inputs.startDate || new Date());
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth())
  );

  // Simulate each month up to current date including ALL extra payments
  for (
    let month = 1;
    month <= Math.min(monthsElapsed, termMonths) && balance > 0;
    month++
  ) {
    const monthlyInterest = balance * monthlyRate;
    const principalPayment = monthlyPayment - monthlyInterest;
    const extraPayment = adapter.extraPayments.value[month] || 0;

    balance = Math.max(0, balance - principalPayment - extraPayment);
  }

  return balance;
}

function getProjectedRemainingPayments(): string {
  // Calculate remaining payments considering ALL future extra payments
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = getProjectedBalance();
  const startDate = new Date(adapter.inputs.startDate || new Date());
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth())
  );

  if (balance <= 0) return "0 payments";

  let remainingMonths = 0;
  let currentMonth = monthsElapsed + 1;

  // Simulate remaining months with planned extra payments
  while (balance > 0.01 && currentMonth <= termMonths + 120) {
    const monthlyInterest = balance * monthlyRate;
    const principalPayment = monthlyPayment - monthlyInterest;
    const extraPayment = adapter.extraPayments.value[currentMonth] || 0;

    balance = Math.max(0, balance - principalPayment - extraPayment);
    remainingMonths++;
    currentMonth++;

    if (balance <= 0) break;
  }

  return `${remainingMonths} payments`;
}

function getProjectedDebtFreeDate(): string {
  const remainingPaymentsStr = getProjectedRemainingPayments();
  const remainingPayments = parseInt(remainingPaymentsStr.split(" ")[0]);

  if (remainingPayments === 0) return "Paid off!";

  const currentDate = new Date();
  const debtFreeDate = new Date(currentDate);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + remainingPayments);

  return debtFreeDate.toLocaleDateString("de-DE", {
    month: "short",
    year: "numeric",
  });
}

function getProjectedRemainingInterest(): number {
  // Calculate remaining interest considering ALL future extra payments
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = getProjectedBalance();
  const startDate = new Date(adapter.inputs.startDate || new Date());
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth())
  );

  if (balance <= 0) return 0;

  let totalInterest = 0;
  let currentMonth = monthsElapsed + 1;

  // Simulate remaining months with planned extra payments
  while (balance > 0.01 && currentMonth <= termMonths + 120) {
    const monthlyInterest = balance * monthlyRate;
    const principalPayment = monthlyPayment - monthlyInterest;
    const extraPayment = adapter.extraPayments.value[currentMonth] || 0;

    totalInterest += monthlyInterest;
    balance = Math.max(0, balance - principalPayment - extraPayment);
    currentMonth++;

    if (balance <= 0) break;
  }

  return totalInterest;
}

// Original debt-focused calculation methods (current status)
function getCurrentBalance(): number {
  // Calculate how many months have elapsed since loan start
  const startDate = new Date(adapter.inputs.startDate || new Date());
  const currentDate = new Date();
  const monthsElapsed = Math.max(
    0,
    (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth())
  );

  if (monthsElapsed === 0) {
    return adapter.inputs.loan; // Just started
  }

  // Calculate proper remaining balance using amortization
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  // Calculate monthly payment using loan formula
  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = adapter.inputs.loan;

  // Simulate each month of payments
  for (let month = 1; month <= Math.min(monthsElapsed, termMonths); month++) {
    // Calculate interest for this month
    const monthlyInterest = balance * monthlyRate;

    // Calculate principal payment
    const principalPayment = monthlyPayment - monthlyInterest;

    // Add any extra payment for this month
    const extraPayment = adapter.extraPayments.value[month] || 0;

    // Update balance
    balance = Math.max(0, balance - principalPayment - extraPayment);

    // Break if loan is paid off
    if (balance === 0) break;
  }

  return balance;
}

function getRemainingPayments(): string {
  const currentBalance = getCurrentBalance();

  if (currentBalance <= 0) {
    return "0 payments";
  }

  // Calculate remaining payments using loan formula
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Use loan formula to calculate remaining payments
  const remainingPayments =
    -Math.log(1 - (currentBalance * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  const remaining = Math.max(0, Math.ceil(remainingPayments));
  return `${remaining} payments`;
}

function getDebtFreeDate(): string {
  const currentBalance = getCurrentBalance();

  if (currentBalance <= 0) {
    return "Paid off!";
  }

  // Calculate remaining payments
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  const remainingPayments =
    -Math.log(1 - (currentBalance * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  const remainingMonths = Math.ceil(remainingPayments);

  const currentDate = new Date();
  const debtFreeDate = new Date(currentDate);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + remainingMonths);

  return debtFreeDate.toLocaleDateString("de-DE", {
    month: "short",
    year: "numeric",
  });
}

function getRemainingInterest(): number {
  const currentBalance = getCurrentBalance();

  if (currentBalance <= 0) {
    return 0;
  }

  // Calculate realistic remaining interest
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Calculate remaining payments
  const remainingPayments =
    -Math.log(1 - (currentBalance * monthlyRate) / monthlyPayment) /
    Math.log(1 + monthlyRate);

  const totalRemainingPayments = Math.ceil(remainingPayments) * monthlyPayment;
  const remainingInterest = totalRemainingPayments - currentBalance;

  return Math.max(0, remainingInterest);
}

function getExtraPaymentImpact() {
  const totalExtraPayments = Object.values(adapter.extraPayments.value).reduce(
    (sum: number, amount: number) => sum + amount,
    0
  );

  if (totalExtraPayments === 0) {
    return {
      interestSaved: 0,
      monthsReduced: "0 months",
      newDebtFreeDate: getDebtFreeDate(),
    };
  }

  // Calculate scenario WITHOUT extra payments for comparison
  const monthlyRate = adapter.inputs.interestRate / 100 / 12;
  const termMonths = adapter.inputs.termMonths || 84;

  const monthlyPayment =
    (adapter.inputs.loan *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Original scenario (no extra payments)
  const originalTotalPayments = monthlyPayment * termMonths;
  const originalTotalInterest = originalTotalPayments - adapter.inputs.loan;

  // Current scenario (with extra payments) - use actual current calculations
  const currentRemainingInterest = getRemainingInterest();

  // Calculate interest saved
  const interestSaved = Math.max(
    0,
    originalTotalInterest - currentRemainingInterest
  );

  // Calculate how many months earlier we'll be debt-free
  const actualRemainingPayments = parseInt(
    getRemainingPayments().split(" ")[0]
  );
  const monthsElapsed = Math.max(
    0,
    (new Date().getFullYear() -
      new Date(adapter.inputs.startDate || new Date()).getFullYear()) *
      12 +
      (new Date().getMonth() -
        new Date(adapter.inputs.startDate || new Date()).getMonth())
  );
  const actualTotalMonths = monthsElapsed + actualRemainingPayments;
  const monthsReduced = Math.max(0, termMonths - actualTotalMonths);

  // The debt-free date is already correctly calculated in getDebtFreeDate()
  const actualDebtFreeDate = getDebtFreeDate();

  return {
    interestSaved,
    monthsReduced: `${monthsReduced} months`,
    newDebtFreeDate: actualDebtFreeDate,
  };
}

function getDebtPayoffPercentage(): number {
  const currentBalance = getCurrentBalance();
  const originalLoan = adapter.inputs.loan;
  const paidOff = originalLoan - currentBalance;

  return Math.round((paidOff / originalLoan) * 100);
}

function getMaxAnnualExtraPayments(): number {
  return (adapter.inputs.loan * adapter.sondertilgungMaxPercent.value) / 100;
}

function getTotalExtraPayments(): number {
  return Object.values(adapter.extraPayments.value).reduce(
    (sum: number, amount: number) => sum + amount,
    0
  );
}

// Save functionality
function showSaveDialog() {
  if (!mortgageName.value) {
    mortgageName.value = `Mortgage ${new Date().toLocaleDateString("de-DE")}`;
  }
  showSaveModal.value = true;
}

function saveMortgage() {
  if (!mortgageName.value.trim()) {
    alert("Please enter a name for your mortgage");
    return;
  }

  const loanData = {
    name: mortgageName.value.trim(),
    loanAmount: adapter.inputs.loan,
    interestRate: adapter.inputs.interestRate,
    termMonths: adapter.inputs.termMonths || 84,
    startDate:
      adapter.inputs.startDate || new Date().toISOString().split("T")[0],
    extraPayments: { ...adapter.extraPayments.value },
    extraPaymentRights: adapter.sondertilgungMaxPercent.value,
    notes: `ETF comparison rate: ${etfReturnRate.value}%`,
  };

  try {
    if (savedLoanId.value) {
      // Update existing loan
      const updated = loanService.updateLoan(savedLoanId.value, loanData);
      if (updated) {
        isSaved.value = true;
        showSaveModal.value = false;
        alert("Mortgage updated successfully!");
      }
    } else {
      // Save new loan
      const saved = loanService.saveLoan(loanData);
      savedLoanId.value = saved.id;
      isSaved.value = true;
      showSaveModal.value = false;
      alert("Mortgage saved successfully!");
    }
  } catch (error) {
    console.error("Error saving mortgage:", error);
    alert("Error saving mortgage. Please try again.");
  }
}

function loadMortgage(loanId: string) {
  const loan = loanService.getLoan(loanId);
  if (!loan) return;

  // Load loan data into adapter
  adapter.inputs.loan = loan.loanAmount;
  adapter.inputs.interestRate = loan.interestRate;
  adapter.inputs.termMonths = loan.termMonths;
  adapter.inputs.startDate = loan.startDate;
  adapter.extraPayments.value = { ...loan.extraPayments };
  adapter.sondertilgungMaxPercent.value = loan.extraPaymentRights;

  // Set save state
  mortgageName.value = loan.name;
  savedLoanId.value = loan.id;
  isSaved.value = true;

  // Show results
  showResults.value = true;
}

function resetToNew() {
  adapter.inputs.loan = 100000;
  adapter.inputs.interestRate = 5.6;
  adapter.inputs.termMonths = 7 * 12;
  adapter.inputs.startDate = "2023-01-01";
  adapter.extraPayments.value = {};
  adapter.sondertilgungMaxPercent.value = 100;

  mortgageName.value = "";
  savedLoanId.value = null;
  isSaved.value = false;
  showResults.value = false;
}

// Initialize
onMounted(() => {
  // Check if we're editing an existing mortgage
  const editId = route.query.edit as string;

  if (editId) {
    // Load existing mortgage for editing
    loadMortgage(editId);
  } else {
    // Set realistic defaults for new mortgages
    adapter.inputs.loan = 100000; // €100k
    adapter.inputs.interestRate = 5.6; // 5.6%
    adapter.inputs.termMonths = 7 * 12; // 7 years
    adapter.inputs.startDate = "2023-01-01"; // January 1, 2023
    adapter.sondertilgungMaxPercent.value = 100; // 100% extra payment rights

    // Clear any default extra payments
    adapter.extraPayments.value = {};

    // Add €17,000 extra payment in second month (February 2023)
    adapter.extraPayments.value[2] = 17000;
  }
});
</script>

<style scoped>
/* Custom styles for smooth transitions */
.transform {
  transition: transform 0.2s ease-in-out;
}

/* Focus states */
input:focus,
button:focus {
  outline: none;
}

/* Responsive text sizing */
@media (max-width: 768px) {
  .text-3xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .text-2xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
</style>
