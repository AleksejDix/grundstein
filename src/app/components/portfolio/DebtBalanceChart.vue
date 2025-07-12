<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartConfiguration,
} from "chart.js";

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LoanData {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  currentBalance: number;
  monthlyPayment: number;
}

interface Props {
  loans: LoanData[];
}

const props = defineProps<Props>();

const chartCanvas = ref<HTMLCanvasElement>();
let chartInstance: Chart | null = null;

function generateProjectionData(loan: LoanData) {
  const monthlyRate = loan.interestRate / 100 / 12;
  const labels: string[] = [];
  const data: number[] = [];

  let balance = loan.currentBalance;
  const currentDate = new Date();

  // Generate 36 months of projection
  for (let month = 0; month <= 36 && balance > 0; month++) {
    const projectionDate = new Date(currentDate);
    projectionDate.setMonth(currentDate.getMonth() + month);

    labels.push(
      projectionDate.toLocaleDateString("de-DE", {
        month: "short",
        year: month % 12 === 0 ? "numeric" : undefined,
      })
    );
    data.push(Math.round(balance));

    if (month < 36 && balance > 0) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = loan.monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
    }
  }

  return { labels, data };
}

function createChart() {
  if (!chartCanvas.value || props.loans.length === 0) return;

  const ctx = chartCanvas.value.getContext("2d");
  if (!ctx) return;

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Generate datasets for all loans
  const allLabels: string[] = [];
  const datasets: any[] = [];

  // Create a comprehensive label set (use the longest projection)
  let maxProjection =
    props.loans.length > 0
      ? generateProjectionData(props.loans[0])
      : { labels: [""], data: [0] };

  props.loans.forEach((loan) => {
    const projection = generateProjectionData(loan);
    if (projection.labels.length > maxProjection.labels.length) {
      maxProjection = projection;
    }
  });

  const colors = [
    { bg: "rgba(59, 130, 246, 0.1)", border: "rgb(59, 130, 246)" }, // Blue
    { bg: "rgba(34, 197, 94, 0.1)", border: "rgb(34, 197, 94)" }, // Green
    { bg: "rgba(239, 68, 68, 0.1)", border: "rgb(239, 68, 68)" }, // Red
    { bg: "rgba(168, 85, 247, 0.1)", border: "rgb(168, 85, 247)" }, // Purple
    { bg: "rgba(245, 158, 11, 0.1)", border: "rgb(245, 158, 11)" }, // Orange
  ];

  props.loans.forEach((loan, index) => {
    const projection = generateProjectionData(loan);
    const color = colors[index % colors.length];

    datasets.push({
      label: loan.name,
      data: projection.data,
      borderColor: color.border,
      backgroundColor: color.bg,
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
    });
  });

  // Add total debt line
  const totalData: number[] = [];
  for (let i = 0; i < maxProjection.labels.length; i++) {
    const total = datasets.reduce((sum, dataset) => {
      return sum + (dataset.data[i] || 0);
    }, 0);
    totalData.push(total);
  }

  datasets.push({
    label: "Total Debt",
    data: totalData,
    borderColor: "rgb(17, 24, 39)",
    backgroundColor: "rgba(17, 24, 39, 0.05)",
    fill: false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 6,
    borderWidth: 3,
    borderDash: [5, 5],
  });

  const config: ChartConfiguration = {
    type: "line",
    data: {
      labels: maxProjection.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        title: {
          display: false,
        },
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
            label: (context) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: €${value.toLocaleString(
                "de-DE"
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "rgb(107, 114, 128)",
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(156, 163, 175, 0.2)",
          },
          ticks: {
            font: {
              size: 11,
            },
            color: "rgb(107, 114, 128)",
            callback: function (value) {
              return "€" + (value as number).toLocaleString("de-DE");
            },
          },
        },
      },
    },
  };

  chartInstance = new Chart(ctx, config);
}

watch(
  () => props.loans,
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
