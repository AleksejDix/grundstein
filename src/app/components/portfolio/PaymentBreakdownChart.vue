<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

interface PaymentBreakdown {
  principal: number;
  interest: number;
  total: number;
}

interface Props {
  breakdown: PaymentBreakdown;
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

function createChart() {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  const principalPercentage = (
    (props.breakdown.principal / props.breakdown.total) *
    100
  ).toFixed(1);
  const interestPercentage = (
    (props.breakdown.interest / props.breakdown.total) *
    100
  ).toFixed(1);

  const config: any = {
    type: "doughnut",
    data: {
      labels: [
        `Principal (${principalPercentage}%)`,
        `Interest (${interestPercentage}%)`,
      ],
      datasets: [
        {
          data: [props.breakdown.principal, props.breakdown.interest],
          backgroundColor: [
            "rgb(59, 130, 246)", // Blue for principal
            "rgb(239, 68, 68)", // Red for interest
          ],
          borderColor: ["rgb(59, 130, 246)", "rgb(239, 68, 68)"],
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.95)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(59, 130, 246, 0.5)",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed;
              const percentage = (
                (value / props.breakdown.total) *
                100
              ).toFixed(1);
              return `${context.label}: €${value.toLocaleString(
                "de-DE"
              )} (${percentage}%)`;
            },
          },
        },
      },
    },
  };

  chartInstance = new Chart(ctx, config);
}

watch(
  () => props.breakdown,
  () => {
    createChart();
  },
  { deep: true }
);

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
