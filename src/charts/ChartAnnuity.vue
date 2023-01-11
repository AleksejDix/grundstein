<template>
    <Bar :data="data" :options="options" />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement)

const props = defineProps({
    plot: {
        type: Array,
        default: () => []
    }
})

const labels = computed(() => props.plot.map(x => x.paymentNumber))
const principalPaidTotal = computed(() => props.plot.map((x) => x.principalPaidTotal))
const interestPaidTotal = computed(() => props.plot.map((x) => x.interestPaidTotal))
const balance = computed(() => props.plot.map((x) => x.balance))

const data = computed(() => ({
    labels: labels.value,
    datasets: [
        {
            label: 'balance',
            data: balance.value,
            backgroundColor: 'hsla(120 50% 50% / 75%)'
        },
        {
            label: 'payments',
            data: principalPaidTotal.value,
            backgroundColor: 'hsla(120 50% 70% / 75%)'
        },
        {
            label: 'interest',
            data: interestPaidTotal.value,
            backgroundColor: 'red'
        },
    ],

}))

const options = ref({
    responsive: true,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        }
    }
})
</script>


