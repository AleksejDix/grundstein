<template>
  <div class="px-4 space-y-4 bg-gray-100">

    <div class="grid grid-cols-5 gap-4">
      <InputLoan :modelValue="inputs.kredit" @update:model-value="onLoanChange"/>
      <InputInterestRate :modelValue="inputs.zins" @update:model-value="onZinsChange"/>
      <InputRepainmentRate :modelValue="inputs.tilgung" @update:model-value="onTilgungChange" />
      <InputMonthlyRepainment :modelValue="inputs.rate" @update:model-value="onRateChange" />
      <InputTerm :modelValue="inputs.term" @update:model-value="onTermChange"/>
    </div>


    <div class="grid">
      <!-- 100% = kredit + zins / 100 + 10 -->
      <!-- zins =  -->
      <div>
        <div class="grid gap-[2px] grid-flow-col gap-y-12  p-12">
          <div  @mouseenter="onBarChartHover(row)" v-for="(row, index) in plot" :key="row.balance" class="h-[256px] pb-[100px] relative rounded-full">
            <div title="month" class="absolute inset-0 overflow-hidden bg-stone-900">
        
              <div 
                class="absolute inset-0 transform-gpu bg-green-600 transition-all"  
                :style="{
                  '--tw-translate-y': `${(256 - (row.balance * 256 / inputs.kredit) - 1) }px`
                }"
              >
                <div 
                  class="bg-red-600 absolute bottom-full left-0 right-0" 
                  :style="{
                    height: `${row.interestPaid * 256 / inputs.kredit }px`
                  }"> 
                </div>

                <div 
                  class="bg-purple-800 absolute top-0 left-0 right-0 mix-blend-difference" 
                  :style="{
                    height: `${row.principalPaid * 256 / inputs.kredit }px`
                  }">
                </div>
              </div>
            </div>
            <div class="absolute bg-gray-700 px-3 top-full whitespace-nowrap translate-y-2 text-center text-yellow-400 text-[10px]" v-if="index % 12 === 0">
              <div class="h-2 w-[1px] absolute bottom-full left-0 bg-gray-700 font-bold" >
              </div>
            {{ index / 12 + 1 + 2022  }}
          </div>
        </div>
      </div> 
    </div>

      <div class="bg-white rounded-xl p-4">

        <dl class="grid gap-x-4 grid-cols-2 px-2">
          <dt class="flex gap-2 items-center">
            <div class="bg-red-500 rounded-full w-4 h-4"></div>
            <div>
              number
            </div>
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

    <!-- <div>
      <div class="text-right text-red-600">
        {{ kredit.toFormat('$0,0.00')}}
      </div>
      <div class="text-right text-green-600">
        {{ obotor.toFormat('$0,0.00') }}
      </div>
      <div class="text-right text-black font-bold bg-yellow-300">
        {{ dohod.toFormat('$0,0.00') }}
      </div>
    </div> -->



  
          <!-- <div class="grid gap-2 grid-cols-12 mx-auto bg-gray-200 p-2 py-4 max-w-6xl w-full">
            <div v-for="entry in schedule" :key="entry.date" class="rounded bg-white">
              <div class="text-xs text-right p-2">
            
                    <div class="rounded bg-red-100 text-red-800">
                      - {{ entry.expence.toFormat('$0,0.00') }}
                    </div>
                    <div class="rounded bg-yellow-100 text-yellow-800">
                      {{ entry.income.toFormat('$0,0.00') }}
                    </div>
  
                  <div class="bg-green-100 rounded text-green-800 font-bold">
                    {{ entry.total.toFormat('$0,0.00') }}
                  </div>
        
              </div>
            </div>
          </div> -->






    <div class="grid grid-cols-4 gap-12 p-12">


      <div>

        <!-- <dl class="grid grid-cols-2 gap-x-6">
          <dt>
            Rate / Year:
          </dt>
          <dd class="text-right">
            {{ formatCurrency(ratePerYear) }}
          </dd>
          <dt>
            Rate / Month:
          </dt>
          <dd  class="text-right">
            {{ formatCurrency(ratePerMonth) }}
          </dd>
          <dt>
            Rent / Month
          </dt>
          <dd  class="text-right">
            {{ formatCurrency(optimalStartingRent) }}
          </dd>
        </dl> -->

        <hr class="my-4">

        <!-- <dl class="grid grid-cols-2 gap-x-6">
          <dt>
            kredit
          </dt>
          <dd class="text-right">
            {{ formatCurrency(inputs.kredit) }}
          </dd>
          <dt>
            Costs
          </dt>
          <dd class="text-right text-red-600 font-bold">
            {{ formatCurrency(costs)}}
          </dd>
          <dt>
            Total
          </dt>
          <dd class="text-right">
            {{ formatCurrency(total - gewinn) }}
          </dd>
        </dl> -->

        <hr class="my-4">

        <h4>Annuity</h4>


        <!-- <dl class="grid grid-cols-2 gap-x-6">
          <dt>
            Schuldenfrei in 
          </dt>
          <dd class="text-right">
            {{  (plot.length / 12 | 0) + " years and " + plot.length % 12 +" months"  }}
          </dd>
        </dl>
         -->
      </div>


      <!-- <div class="grid-colspan-2">
        <table class="table-fixed	">
          <tr v-for="row in plotWithPercent" :key="row.paymentNumber">
            <td class="pt-1 px-4 border border-slate-600 whitespace-nowrap">
              {{row.paymentNumber}}
       
            </td>
            <td class="pt-1 px-4 border border-slate-600 text-right">{{formatCurrency(row.principalPaid)}}</td>
            <td class="pt-1 px-4 border border-slate-600">

              <div>

                <div>
                  {{ formatCurrency(row.rate) }}
                </div>

                
                <div class="relative w-28 h-2 rounded-full">
                  
                  <div class="absolute  w-full bottom-0 left-0 top-0 bg-green-200 outline-green-500 outline rounded-l-full -outline-offset-1" :style="`width: ${(row.principalPaid / (row.principalPaid + row.interestPaid)) * 100 }%`">
                    
                  </div>
                  <div class="absolute  w-full bottom-0 right-0 top-0 bg-red-200 outline-red-500 rounded-r-full outline -outline-offset-1" :style="`width: ${(row.interestPaid / (row.principalPaid + row.interestPaid)) * 100 }%`">
                    
                  </div>
                </div>
              </div>
              
              
              
            </td>
            <td class="pt-1 px-4 border border-slate-600 text-right">{{formatCurrency(row.interestPaid)}}</td>
            <td class="pt-1 px-4 border border-slate-600 text-right">
              <input class="rounded w-32 h-4 px-1 text-right" type="number" v-model="tilgung[+row.paymentNumber]">
            </td>
            <td class="pt-1 px-4 border border-slate-600 text-right">{{formatCurrency(row.balance)}}</td>
            <td class="pt-1 px-4 border border-slate-600 text-right">{{formatPercent(row.zuwachs)}}</td>
            <td class="pt-1 px-4 border border-slate-600 text-right">{{formatCurrency(row.reduction)}}</td>
          </tr>
        </table>
      </div> -->

    </div>


    
  
</div>
  
</template>


<script setup lang="ts">
import Dinero from 'dinero.js'
import { calculateRate } from '@/functions/rate'
import { calculateTerm } from '@/functions/term'
import { calculateTilgung, berechneTilgung } from '@/functions/tilgung'
import { computed, ref, watchEffect, reactive, watch, onMounted } from 'vue'
import { createPaymentSchedule } from '@/functions/'
import { addMonths, getMonth, getYear } from 'date-fns'
import InputLoan from '@/components/InputLoan.vue'
import InputInterestRate from '@/components/InputInterestRate.vue'
import InputRepainmentRate from '@/components/InputRepainmentRate.vue'
import InputMonthlyRepainment from '@/components/InputMonthlyRepainment.vue'
import InputTerm from '@/components/InputTerm.vue'
import { formatDate } from '@/format/formatDate'
import { formatCurrency } from '@/format/formatCurrency'
import { formatPercent } from '@/format/formatPercent'
import { rentIndex, meterSquaredMeterIndex } from '@/data/index'
import { percentToDecimal, decimalToPercent } from '@/functions/unit'

const inputs = reactive({
  income: 50000,
  kredit: 50000,
  zins: 1,
  tilgung: 8,
  rate: 0,
  term: 0
})


const onLoanChange = (newLoan: number) => {
  inputs.kredit = newLoan
  inputs.rate = calculateRate(newLoan, inputs.zins, inputs.tilgung)
  // Term should never change only the rate 
  // inputs.term = calculateTerm(newLoan, inputs.zins, inputs.rate)
}

const onZinsChange = (newZins: number) => {
  inputs.zins = newZins
  inputs.rate = calculateRate(inputs.kredit, newZins, inputs.tilgung)
  inputs.term = calculateTerm(inputs.kredit, newZins, inputs.rate)
}

const onTilgungChange = (newTilgung: number) => {
  inputs.tilgung = newTilgung
  inputs.rate = calculateRate(inputs.kredit, inputs.zins, newTilgung)
  inputs.term = calculateTerm(inputs.kredit, inputs.zins, inputs.rate)
}

const onRateChange = (newRate: number) => {
  inputs.rate = newRate
  inputs.tilgung = calculateTilgung(inputs.kredit, inputs.zins, newRate)
  inputs.term = calculateTerm(inputs.kredit, inputs.zins, newRate)
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
  // 6: 2500,
  // 18: 2500,
  // 36: 2500,
  // 48: 2500,
  // 60: 2500,
  // 72: 2500,
  // 84: 2500,
  // 96: 2500,
  // 108: 2500,
  // 120: 2500,
})

onMounted(() => {
  inputs.rate = calculateRate(inputs.kredit, inputs.zins, inputs.tilgung),
  inputs.term = calculateTerm(inputs.kredit, inputs.zins, inputs.rate)
})

const interestTotal = computed(() => inputs.zins + inputs.tilgung)

const ratePerYear = computed(() => (interestTotal.value / 100) * inputs.kredit)
const ratePerMonth =  computed(() => (interestTotal.value / 100) * inputs.kredit / 12)

// =WENNFEHLER(WENN(C6=0;"sofort";WENN(C6=1;"in einem Jahr";VERKETTEN("in ";C6;" Jahren")));"in >99 Jahren")

const zinsen = computed(() => inputs.kredit * (inputs.zins/ 100))

// erstes jahr 2022
const effektiveTilgung = computed(() => inputs.tilgung / 100 * inputs.kredit)


const optimalStartingRent = computed(() => inputs.kredit * 0.005)

const plot = ref([])
const calculate = () => {
  plot.value = createPaymentSchedule(inputs.kredit, inputs.zins, ratePerMonth.value, tilgung.value)
}

watchEffect(() => {
  plot.value = createPaymentSchedule(inputs.kredit, inputs.zins, ratePerMonth.value, tilgung.value)
})

const costs = computed(() => plot.value.reduce((sum, {interestPaid}) => sum + interestPaid , 0))
const gewinn = computed(() => plot.value.reduce((sum, {gewinn}) => sum + gewinn , 0))
const total = computed(() => inputs.kredit + costs.value)


const mietspiegelMitProcent = computed(() => Object.entries(rentIndex).flatMap(([year, pricePerSquereMeter]) => {

const zuwachs = rentIndex[year - 1] ? (rentIndex[year - 1] / 100 * (rentIndex[year] - rentIndex[year - 1]) * 100)  : 0

  return {
    year,
    pricePerSquereMeter,
    zuwachs
  }
}))

const quadratMeterPreisSpiegelMitProcent = computed(() => Object.entries(meterSquaredMeterIndex).flatMap(([year, pricePerSquereMeter]) => {

const hasLastYear = !!meterSquaredMeterIndex[year - 1]

const lastYearAmount = hasLastYear ? meterSquaredMeterIndex[year - 1]: 0
const currentYearAmount = meterSquaredMeterIndex[year]


const zuwachs = hasLastYear
  ?  (currentYearAmount / lastYearAmount) - 1
  : 0

  return {
    year,
    pricePerSquereMeter: pricePerSquereMeter / 100,
    zuwachs
  }
}))

const average = mietspiegelMitProcent.value.reduce((sum, b) => {
  return sum + b.zuwachs
}, 0) / mietspiegelMitProcent.value.length;

const averageM = quadratMeterPreisSpiegelMitProcent.value.reduce((sum, b) => {
  return sum + b.zuwachs
}, 0) / quadratMeterPreisSpiegelMitProcent.value.length;


const plotWithPercent = computed(() => {
  return plot.value.map((x, index) => {

    let zuwachs = 0
    let reduction = 0
    if(plot.value[index - 1] && plot.value[index]) {
      zuwachs = (1 - plot.value[index - 1].balance / plot.value[index].balance ) * 100
      reduction = plot.value[index - 1].balance - plot.value[index].balance
    }
    
    // const zuwachs = plot.value[index - 1] 
    //   ? (plot.value[index - 1].balance / 100 * (plot.value[index].balance - plot.value[index - 1].balance) * 100) 
    //   : 0

    return {
      ...x,
      zuwachs,
      reduction
    }
  })
})

const years = 30
const monthsInYear = 12 
const today = ref(new Date())
const year = getYear(today.value)

const rate = ref(Dinero({ amount: 40000, currency: 'EUR', precision: 2 }))

const schedule = Array.from({length: years * monthsInYear}, (_, index) => {

  let expence = Dinero({amount: 0, currency: 'EUR', precision: 2})
  const month = getMonth(today.value) + 1
  const rateYear = getYear(today.value)

  if(month === 1 && year !== rateYear) {
    rate.value = rate.value.multiply('0.085')
  }
  
  if(plotWithPercent.value[index]) {
    const amount = +(plotWithPercent.value[index].rate * 100).toFixed(0)
    expence = Dinero({amount: isNaN(amount) ? 0 : amount, currency: 'EUR', precision: 2})
  } 
  
  today.value = addMonths(today.value, 1)

  const income = rate.value

  
  return {
    expence,
    income,
    total: income.subtract(expence),
    date: today.value
  }
});

const kredit = schedule.reduce((sum, { expence }) => sum.add(expence), Dinero({amount: 0, currency: 'EUR', precision: 2}))
const obotor = schedule.reduce((sum, { income }) => sum.add(income), Dinero({amount: 0, currency: 'EUR', precision: 2}))
const dohod = schedule.reduce((sum, { total }) => sum.add(total), Dinero({amount: 0, currency: 'EUR', precision: 2}))

createPaymentSchedule(inputs.kredit, inputs.zins, ratePerMonth.value, tilgung.value)

const getNumbers = (min: number, max: number) => [...Array(max - min + 1).keys()].map(i => i + min);
</script>