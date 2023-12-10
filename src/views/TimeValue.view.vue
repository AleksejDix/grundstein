<template>
  <div class="max-w-2xl mx-auto">
    <div>
      <IHave v-model="form.pv" :disabled="isDisabled('pv')"></IHave>
    </div>
    <h1>time value of money</h1>
    <div class="rounded-xl">
      <div class="grid grid-cols-2 p-2">
        <div class="flex gap-2">
          <div>
            <input
              type="radio"
              name="calculation"
              v-model="calculation"
              value="pv"
            />
          </div>
        </div>
        <div></div>
      </div>
      <div class="grid grid-cols-2 p-2">
        <div class="flex gap-2">
          <div>
            <input
              type="radio"
              name="calculation"
              v-model="calculation"
              value="fv"
            />
          </div>
          <label for="fv">Future Value</label>
        </div>

        <div>
          <input
            id="fv"
            name="fv"
            type="number"
            v-model="form.fv"
            :disabled="isDisabled('fv')"
            min="0"
            step="10"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 p-2">
        <div class="flex gap-2">
          <div>
            <input
              type="radio"
              name="calculation"
              v-model="calculation"
              value="r"
            />
          </div>
          <label for="r">Interest Rate</label>
        </div>
        <div>
          <input
            id="r"
            name="r"
            v-model="form.r"
            :disabled="isDisabled('r')"
            type="number"
            min="0"
            step="0.001"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 p-2">
        <div class="flex gap-2">
          <div>
            <input
              type="radio"
              name="calculation"
              v-model="calculation"
              value="n"
            />
          </div>
          <label for="n">Term</label>
        </div>
        <div>
          <input
            id="n"
            name="n"
            v-model="form.n"
            :disabled="isDisabled('n')"
            type="number"
            min="0"
            step="1"
          />
        </div>
      </div>
    </div>

    <Chart :data="plot"></Chart>
    <Table :modelValue="plot"></Table>
  </div>
</template>

<script setup lang="ts">
import IHave from "@/components/Forms/IHave.vue";

import Table from "@/components/Table.vue";
import Chart from "@/components/Chart.vue";
import { discount, interest, term, compound } from "../functions/discount";
import { watch, reactive, ref, onMounted } from "vue";

const calculation = ref("fv");

const isDisabled = (test: string) => calculation.value === test;

const calculations = {
  pv: () => discount({ fv: form.fv, z: form.r, y: form.n }),
  fv: () => compound({ pv: form.pv, z: form.r, y: form.n }),
  r: () => interest({ fv: form.fv, pv: form.pv, y: form.n }),
  n: () => term({ fv: form.fv, pv: form.pv, z: form.r }),
};

const calculate = (form: any, calculationType: string): number => {
  const calculationFunction =
    calculations[calculationType as keyof typeof calculations];
  return calculationFunction ? calculationFunction() : 0;
};

const plot = ref<any[]>([]);
const form = reactive({
  pv: 0,
  fv: 0,
  r: 0.015,
  n: 30,
});

watch(
  [form, calculation],
  ([newForm, newCalculate]) => {
    form[newCalculate as keyof typeof form] = calculate(newForm, newCalculate);
    plot.value = generateTableData(newForm);
  },
  {
    immediate: true,
  }
);

function generateTableData(_form: any) {
  let past = _form.pv + 568 * 12;

  const a = Array.from({ length: _form.n }).map((_, year) => {
    const interest = past * _form.r;
    const future = past + interest;
    const result = { year: year + 1, past, interest, future };
    past = future;
    return result;
  });

  return a;
}

onMounted(() => {
  plot.value = generateTableData(form).map((x, index) => ({
    ...x,
    // past: x.past - 700 * 12,
    // future: x.future - 700 * 12,
    past: x.past - (index < 12 ? 430 * 12 + 4300 : 0),
    future: x.future - (index < 12 ? 430 * 12 + 4300 : 0),
  }));
});
</script>

<style>
label {
  display: block;
  line-height: 1.625;
}
</style>
