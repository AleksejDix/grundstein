<template>
  <div class="payment-history-chart">
    <Line :data="chartData" :options="chartOptions" :height="300" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Props
interface Props {
  originalAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  totalPayments: number;
  startDate: Date;
}

const props = defineProps<Props>();

// Generate payment history data
const chartData = computed(() => {
  const paymentHistory = generatePaymentHistory();

  return {
    labels: paymentHistory.map((p) => p.month),
    datasets: [
      {
        label: "Restschuld",
        data: paymentHistory.map((p) => p.balance),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
      {
        label: "Tilgung kumuliert",
        data: paymentHistory.map((p) => p.principalPaid),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 6,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: "Zahlungshistorie",
      font: {
        size: 16,
        weight: "bold",
      },
    },
    legend: {
      display: true,
      position: "top" as const,
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      callbacks: {
        label: function (context: any) {
          return `${context.dataset.label}: €${context.parsed.y.toLocaleString(
            "de-DE"
          )}`;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Zahlungsmonat",
      },
      grid: {
        display: false,
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: "Betrag (€)",
      },
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return "€" + value.toLocaleString("de-DE");
        },
      },
    },
  },
  interaction: {
    mode: "nearest" as const,
    axis: "x" as const,
    intersect: false,
  },
}));

// Generate realistic payment history based on mortgage parameters
function generatePaymentHistory() {
  const history = [];
  const monthlyInterestRate = 0.8 / 100 / 12; // 0.8% annual interest
  let remainingBalance = props.originalAmount;
  let totalPrincipalPaid = 0;

  // Calculate approximate principal portion (simplified calculation)
  const monthlyInterest = remainingBalance * monthlyInterestRate;

  for (let i = 0; i <= props.totalPayments; i++) {
    const currentDate = new Date(props.startDate);
    currentDate.setMonth(currentDate.getMonth() + i);

    const monthLabel = new Intl.DateTimeFormat("de-DE", {
      year: "2-digit",
      month: "short",
    }).format(currentDate);

    history.push({
      month: monthLabel,
      balance: Math.max(0, remainingBalance),
      principalPaid: totalPrincipalPaid,
      payment: i === 0 ? 0 : props.monthlyPayment,
    });

    // Update for next iteration (simplified amortization)
    if (i < props.totalPayments) {
      const interest = remainingBalance * monthlyInterestRate;
      const principal = Math.min(
        props.monthlyPayment - interest,
        remainingBalance
      );
      remainingBalance -= principal;
      totalPrincipalPaid += principal;
    }
  }

  return history;
}
</script>

<style scoped>
.payment-history-chart {
  @apply w-full h-72;
}
</style>
