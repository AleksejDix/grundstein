<template>
  {{ currency.format(income) }}
  {{ currency.format(compound({ pv: 155000, z: 0.01, y: 30 })) }}
  <div
    class="flex justify-between border-b border-neutral-400 aspect-video"
    :style="{
      gap: (100 / data.length) * 0.32 + '%',
    }"
  >
    <div
      class="shrink relative"
      :style="{ flexBasis: 100 / data.length + '%' }"
      v-for="col in data"
      :key="col.year"
    >
      <div
        :title="currency.format(col.future)"
        class="group absolute bottom-0 left-0 bg-blue-500 bg-opacity-50 right-0"
        :style="{
          height: (100 * col.past) / max + '%',
        }"
      ></div>
      <div
        class="group absolute left-0 bg-blue-500 bg-opacity-100 right-0"
        :style="{
          height: (100 * col.interest) / max + '%',
          bottom: `calc(${(100 * col.past) / max + '%'})`,
        }"
        :title="currency.format(col.interest)"
      >
        <div
          class="hidden group-hover:block text-right absolute bottom-full border-b border-black z-10 right-full leading-0 whitespace-nowrap pr-4"
        >
          {{ currency.format(col.past) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { currency } from "@/formatters/currency";
import { compound } from "../functions/discount";
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

const max = computed(() => {
  return Math.max(...props.data.map(({ future }) => future));
});

function sumOfThirteenAfterIndex(array, startIndex) {
  return array
    .slice(startIndex)
    .filter((item) => item.toString())
    .reduce((acc, current) => acc + current, 0);
}

const income = computed(() =>
  sumOfThirteenAfterIndex(
    props.data.map(({ past }) => past),
    0
  )
);
</script>
