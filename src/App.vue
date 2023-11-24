<template>
  <div class="px-4 space-y-4 bg-gray-100 container">
    <div class="grid grid-cols-5 gap-4">
      <InputLoan
        :modelValue="inputs.kredit"
        @update:model-value="onLoanChange"
      />
      <InputZins :modelValue="inputs.zins" @update:model-value="onZinsChange" />
      <InputTilgung
        :modelValue="inputs.tilgung"
        @update:model-value="onTilgungChange"
      />
      <InputRate :modelValue="inputs.rate" @update:model-value="onRateChange" />
      <InputTerm :modelValue="inputs.term" @update:model-value="onTermChange" />
    </div>

    <ChartAnnuity :plot="posle" />

    <div class="fixed left-0 p-3 bg-yellow-400">
      <dl class="grid grid-cols-2">
        <dt class="p-2">old:</dt>
        <dd class="p-2 text-right">{{ euro(oldRoi) }}</dd>
        <dt class="p-2">new:</dt>
        <dd class="p-2 text-right">{{ euro(newRoi) }}</dd>
      </dl>
    </div>
    <table class="w-full text-right text-xs font-mono table-auto">
      <thead>
        <tr>
          <th>Sondertilgung</th>
          <th v-for="(value, key) in table[0]">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in table"
          :key="row.paymentNumber"
          class="hover:bg-yellow-400 hover:text-black hover:font-bold"
          :class="{
            'bg-black text-white': index === 120 || index === 240,

            'bg-red-200': index % 12 === Math.abs(monthOffset),
          }"
        >
          <td class="px-2 border py-0">
            <input
              type="number"
              class="h-8"
              min="0"
              max="maxTilgung"
              v-model.number="tilgung[index + 1]"
            />
            <button @click="tilgung[index + 1] = maxTilgung">max</button>
          </td>
          <td
            v-for="(value, key) in row"
            class="p-2 border"
            :class="{ 'bg-red-300': key === 'econom' && value === 0 }"
          >
            <span v-if="key === 'paymentNumber'">
              {{ monthNumberToDate(value) }}
            </span>
            <span v-else>
              {{ euro(value) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import ChartAnnuity from "@/charts/ChartAnnuity.vue";
import { calculateRate } from "@/functions/rate";
import { calculateTerm } from "@/functions/term";
import { calculateTilgung, berechneTilgung } from "@/functions/tilgung";
import { ref, reactive, onMounted, watch, computed } from "vue";
import { createPaymentSchedule } from "@/functions/";
import InputLoan from "@/components/InputLoan.vue";
import InputZins from "@/components/InputZins.vue";
import InputTilgung from "@/components/InputTilgung.vue";
import InputRate from "@/components/InputRate.vue";
import InputTerm from "@/components/InputTerm.vue";

const monthOffset = ref(4);

const euroFormater = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const euro = (n) => euroFormater.format(n);

function monthNumberToDate(monthOffset: number): Date {
  const currentDate = new Date();
  const targetDate = new Date();

  // Setze das Ziel-Datum basierend auf dem aktuellen Datum und dem Monats-Offset
  targetDate.setMonth(currentDate.getMonth() + monthOffset);

  return targetDate.toLocaleDateString("ru-RU", {
    month: "short",
    year: "numeric",
  });
}

function convertMonthsToYearsAndMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return `${years} Jahre und ${months} Monate`;
}

const inputs = reactive({
  kredit: 155000,
  zins: 3.85,
  tilgung: 1.57,
  rate: 0,
  term: 0,
});

const maxTilgung = computed(() => (inputs.kredit / 100) * 5);

const onLoanChange = (newLoan: number) => {
  inputs.kredit = newLoan;
  inputs.rate = calculateRate(newLoan, inputs.zins, inputs.tilgung);
  inputs.term = calculateTerm(
    newLoan,
    inputs.zins,
    inputs.tilgung,
    inputs.rate
  );
};

const onZinsChange = (newZins: number) => {
  inputs.zins = newZins;
  inputs.rate = calculateRate(inputs.kredit, newZins, inputs.tilgung);
  inputs.term = calculateTerm(
    inputs.kredit,
    newZins,
    inputs.tilgung,
    inputs.rate
  );
};

const onTilgungChange = (newTilgung: number) => {
  inputs.tilgung = newTilgung;
  inputs.rate = calculateRate(inputs.kredit, inputs.zins, newTilgung);
  inputs.term = calculateTerm(
    inputs.kredit,
    inputs.zins,
    newTilgung,
    inputs.rate
  );
};

const onRateChange = (newRate: number) => {
  inputs.rate = newRate;
  inputs.tilgung = calculateTilgung(inputs.kredit, inputs.zins, newRate);
  inputs.term = calculateTerm(
    inputs.kredit,
    inputs.zins,
    inputs.tilgung,
    newRate
  );
};

const onTermChange = (newTerm: number) => {
  inputs.term = newTerm;
  inputs.tilgung = berechneTilgung(inputs.kredit, inputs.rate, newTerm);
};

const tilgung = ref([]);

onMounted(() => {
  (inputs.rate = calculateRate(inputs.kredit, inputs.zins, inputs.tilgung)),
    (inputs.term = calculateTerm(
      inputs.kredit,
      inputs.zins,
      inputs.tilgung,
      inputs.rate
    ));
});

const table = ref([]);
const dos = ref([]);
const posle = ref([]);

onMounted(() => {
  dos.value = createPaymentSchedule(inputs.kredit, inputs.zins, inputs.rate);
  posle.value = createPaymentSchedule(
    inputs.kredit,
    inputs.zins,
    inputs.rate,
    tilgung.value
  );
});

watch(
  () => [inputs.kredit, inputs.zins, inputs.rate, tilgung.value],
  ([newA, newB, newC, newD]) => {
    dos.value = createPaymentSchedule(newA, newB, newC, []);
    posle.value = createPaymentSchedule(newA, newB, newC, newD);

    const maxInterest = Math.max(
      ...table.value.map((x) => x.interestPaidTotal)
    );

    table.value = dos.value.map(
      (
        {
          interestPaid,
          paymentNumber,
          interestPaidTotal,
          principalPaidTotal,
          principalPaid,
          balance,
          rate,
        },
        index
      ) => ({
        paymentNumber: paymentNumber - monthOffset.value,
        balance,
        rate,
        principalPaid,
        principalPaidTotal,
        interestPaid,
        interestPaidPosle: posle.value[index]?.interestPaid || 0,
        interestPaidTotal,
        interestPaidTotalPosle: posle.value[index]?.interestPaidTotal || 0,
        econom: interestPaidTotal - posle.value[index]?.interestPaidTotal || 0,
      })
    );
  },
  {
    deep: true,
  }
);

function sumArray(numbers: number[]): number {
  return numbers.reduce((accumulator, current) => accumulator + current, 0);
}

const roi = computed(() => {
  const maxEconom = Math.max(...table.value.map((x) => x.econom));
  const totalTilgung = sumArray(tilgung.value);
  return maxEconom - totalTilgung;
});

const oldRoi = ref(0);
const newRoi = ref(0);
watch(
  () => roi.value,
  (n, o) => {
    oldRoi.value = o;
    newRoi.value = n;
  }
);
</script>
