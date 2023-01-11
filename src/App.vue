<template>
  <div class="px-4 space-y-4 bg-gray-100 container">

    <div class="grid grid-cols-5 gap-4">
      <InputLoan :modelValue="inputs.kredit" @update:model-value="onLoanChange" />
      <InputZins :modelValue="inputs.zins" @update:model-value="onZinsChange" />
      <InputTilgung :modelValue="inputs.tilgung" @update:model-value="onTilgungChange" />
      <InputRate :modelValue="inputs.rate" @update:model-value="onRateChange" />
      <InputTerm :modelValue="inputs.term" @update:model-value="onTermChange" />
    </div>


    <div class="aspect-video">

      <ChartAnnuity :plot="plot" />
    </div>



    <div class="grid">
      <!-- 100% = kredit + zins / 100 + 10 -->
      <!-- zins =  -->
      <div class="rounded p-12 bg-gray-300">
        <table class="table-fixed w-full border-collapse">
          <tr>
            <td @click="onBarChartHover(row)" v-for="(row, index) in plot" :key="row.balance"
              class="h-[256px] relative hover:bg-black cursor-pointer" :class="{
                'bg-green-200': row.interestPaid === 0,
                'border-r border-black': row.paymentNumber === 120
              }">
              <div title="month" class="absolute left-0 right-0 top-0 bottom-0 overflow-hidden">
                <div class="absolute inset-0 transform-gpu bg-pink-500 mix-blend-difference transition-all" :style="{
                  '--tw-translate-y': `${(256 - row.balance * 256 / inputs.kredit)}px`
                }">
                  <div>

                    <div class="bg-red-600 absolute bottom-full left-0 right-0" :style="{
                      height: `${row.interestPaid * 256 / inputs.kredit}px`
                    }">
                    </div>

                    <div class="bg-blue-500 absolute top-0 left-0 right-0" :style="{
                      height: `${row.principalPaid * 256 / inputs.kredit}px`
                    }">
                    </div>
                  </div>
                </div>
              </div>

            </td>
          </tr>
          <tr>
            <template v-for="(row, index) in plot">
              <td colspan="12" v-if="index % 12 === 0" :key="row.balance" class="">
                <div class="px-[2.5%]">
                  <div class="h-2 rounded-b border-b border-l border-r border-gray-700">

                  </div>
                </div>
                <div class="text-center">
                  {{ index / 12 + 1 + 2022 }}
                </div>
              </td>
            </template>
          </tr>
        </table>
      </div>

      <div class="bg-white rounded-xl p-4">

        <dl class="grid gap-x-4 grid-cols-2 px-2">
          <dt class="flex gap-2 items-center">
            <div class="bg-red-500 rounded-full w-4 h-4"></div>
            <div>
              number
            </div>
            <input type="text" v-model.number="tilgung[tooltip.paymentNumber]">
          </dt>
          <dd class="text-right">
            {{ tooltip.paymentNumber }}
          </dd>
          <dt class="flex gap-2 items-center">
            <div class="bg-red-500 rounded-full w-4 h-4"></div>
            <div>
              Zinsen
            </div>
          </dt>
          <dd class="text-right">
            {{ formatCurrency(tooltip.interestPaid) }}
          </dd>
          <dt class="flex gap-2 items-center">
            <div class="bg-red-500 rounded-full w-4 h-4"></div>
            <div>
              principalPaid
            </div>
          </dt>
          <dd class="text-right">
            {{ formatCurrency(tooltip.principalPaid) }}
          </dd>
          <dt class="flex gap-2 items-center">
            <div class="bg-red-500 rounded-full w-4 h-4"></div>
            <div>
              Zinsen bezahlt
            </div>
          </dt>
          <dd class="text-right">
            {{ formatCurrency(tooltip.interestPaidTotal) }}
          </dd>
          <dt class="flex gap-2 items-center">
            <div class="bg-blue-500 rounded-full w-4 h-4"></div>
            <div>
              Restschuld
            </div>
          </dt>
          <dd class="text-right">
            {{ formatCurrency(tooltip.balance) }}
          </dd>
        </dl>

      </div>

    </div>
  </div>

</template>


<script setup lang="ts">
import Dinero from 'dinero.js'
import ChartAnnuity from '@/charts/ChartAnnuity.vue'
import { calculateRate } from '@/functions/rate'
import { calculateTerm } from '@/functions/term'
import { calculateTilgung, berechneTilgung } from '@/functions/tilgung'
import { computed, ref, watchEffect, reactive, watch, onMounted } from 'vue'
import { createPaymentSchedule } from '@/functions/'
import { addMonths, getMonth, getYear } from 'date-fns'
import InputLoan from '@/components/InputLoan.vue'
import InputZins from '@/components/InputZins.vue'
import InputTilgung from '@/components/InputTilgung.vue'
import InputRate from '@/components/InputRate.vue'
import InputTerm from '@/components/InputTerm.vue'
import { formatDate } from '@/format/formatDate'
import { formatCurrency } from '@/format/formatCurrency'
import { formatPercent } from '@/format/formatPercent'
import { rentIndex, meterSquaredMeterIndex } from '@/data/index'
import { percentToDecimal, decimalToPercent } from '@/functions/unit'

const inputs = reactive({
  kredit: 155000,
  zins: 3.75,
  tilgung: 1.67,
  rate: 0,
  term: 0
})


const onLoanChange = (newLoan: number) => {
  inputs.kredit = newLoan
  inputs.rate = calculateRate(newLoan, inputs.zins, inputs.tilgung)
  inputs.term = calculateTerm(newLoan, inputs.zins, inputs.tilgung, inputs.rate)
  createSonderTilgungen()
}

const onZinsChange = (newZins: number) => {
  inputs.zins = newZins
  inputs.rate = calculateRate(inputs.kredit, newZins, inputs.tilgung)
  inputs.term = calculateTerm(inputs.kredit, newZins, inputs.tilgung, inputs.rate)
}

const onTilgungChange = (newTilgung: number) => {
  inputs.tilgung = newTilgung
  inputs.rate = calculateRate(inputs.kredit, inputs.zins, newTilgung)
  inputs.term = calculateTerm(inputs.kredit, inputs.zins, newTilgung, inputs.rate)
}

const onRateChange = (newRate: number) => {
  inputs.rate = newRate
  inputs.tilgung = calculateTilgung(inputs.kredit, inputs.zins, newRate)
  inputs.term = calculateTerm(inputs.kredit, inputs.zins, inputs.tilgung, newRate)
}

const onTermChange = (newTerm: number) => {
  inputs.term = newTerm
  inputs.tilgung = berechneTilgung(inputs.kredit, inputs.rate, newTerm)
}

const tooltip = ref({

})

const onBarChartHover = (row) => {
  tooltip.value = row
}



const tilgung = ref({
  10: 7750,
  // 18: 2500,
  // 19: 2500,
  // 48: 4500,
  // 60: 4500,
  // 72: 4500,
  // 84: 4500,
  // 96: 4500,
  // 108: 4500,
  // 120: 4500,
  // 121: 22000,
  // 7: 5000,
  // 8: 2000,
  // 18: 2500
})

onMounted(() => {
  inputs.rate = calculateRate(inputs.kredit, inputs.zins, inputs.tilgung),
    inputs.term = calculateTerm(inputs.kredit, inputs.zins, inputs.tilgung, inputs.rate)

  createSonderTilgungen()
})



const createSonderTilgungen = () => {
  Array.from({ length: inputs.term }, (_, i) => i + 1).forEach((x, index) => {
    // if (index % 12 == 0) {
    //   tilgung.value[index] = inputs.kredit * 0.05
    // }

  })
}


const plot = ref([])
watchEffect(() => {
  console.log(tilgung.value)
  plot.value = createPaymentSchedule(inputs.kredit, inputs.zins, inputs.rate, tilgung.value)
})


createPaymentSchedule(inputs.kredit, inputs.zins, inputs.rate, tilgung.value)

watch(() => tilgung, (x) => {
  console.log(x)
}, {
  immediate: true
})

</script>