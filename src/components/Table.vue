<template>
  <div class="overflow-scroll w-full">
    <table>
      <caption>
        Statements
      </caption>
      <thead>
        <tr>
          <th v-for="(_value, key) in modelValue[0]" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in modelValue" :key="index">
          <td v-for="(value, key) in row" :key="key">
            <template v-if="key === 'year'">
              {{ value }}
            </template>
            <template v-else>
              {{ currency.format(value) }}
            </template>
          </td>
        </tr>
      </tbody>
      <tfoot></tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { currency } from "../formatters/currency";

defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
table {
  @apply min-w-full rounded;
}

caption {
  @apply text-xl font-light text-neutral-900 tracking-wide text-left py-4;
}

thead tr th,
tbody tr td {
  @apply py-3 whitespace-nowrap text-right text-gray-600;
}

thead tr th:first-child,
tbody tr td:first-child {
  @apply w-0 text-left;
}

tbody tr:hover td,
thead tr:hover th {
  @apply !text-black;
}

tr:hover {
  @apply bg-white;
}

thead tr th {
  @apply text-neutral-700 uppercase text-xs;
}

td {
  @apply font-mono;
}
</style>
