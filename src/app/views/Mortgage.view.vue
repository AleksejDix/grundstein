<template>
  <aside class="bg-zinc-800 border-r border-r-zinc-900 overflow-y-auto">
    <div class="grid gap-4 p-4">
      <InputLoan v-model="inputs.loan">
        <Lock v-model="locked.loan"></Lock>
      </InputLoan>

      <InputMonthlyPayment
        :modelValue="inputs.monthlyPayment"
        @update:modelValue="setMonthlyPayment"
      >
        <Lock v-model="locked.monthlyPayment"></Lock>
      </InputMonthlyPayment>

      <InputInterestRate v-model="inputs.interestRate">
        <Lock v-model="locked.interestRate"></Lock>
      </InputInterestRate>

      <InputRepaymentRate
        :modelValue="inputs.principalRate"
        :disabled="locked.principalRate"
      >
        <Lock
          :modelValue="locked.principalRate"
          @update:modelValue="setLockedPrincipalRate"
        ></Lock>
      </InputRepaymentRate>

      <InputTerm
        :modelValue="inputs.termMonths"
        @update:modelValue="setTermMonths"
        :disabled="locked.termMonths"
      >
        <Lock
          :modelValue="locked.termMonths"
          @update:modelValue="setLockedTermMonths"
        ></Lock>
      </InputTerm>

      <InputSondertilgung
        v-model="sondertilgungMaxPercent"
        :loan-amount="inputs.loan"
      >
        <Lock v-model="locked.sondertilgung"></Lock>
      </InputSondertilgung>

      <SondertilgungTable
        v-model:extra-payments="extraPayments"
        :max-percentage="sondertilgungMaxPercent"
        :loan-amount="inputs.loan"
        :term-months="inputs.termMonths || 360"
      />
    </div>
  </aside>

  <main class="p-4">
    <ChartAnnuity :plot="paymentSchedule" />
    <Table :data="tableData" />
  </main>
</template>

<script setup lang="ts">
import { Decimal } from "decimal.js";
import Lock from "@/presentation/components/ui/Lock.vue";
// Table component removed - using inline table or payment schedule
// ChartAnnuity component removed - use Chart.js components instead
import { ref, reactive, onMounted, watch, computed } from "vue";
// Old functions removed - use domain layer calculations instead
import InputLoan from "@/presentation/components/mortgage/InputLoan.vue";
import InputInterestRate from "@/presentation/components/mortgage/InputInterestRate.vue";
import InputRepaymentRate from "@/presentation/components/mortgage/InputRepaymentRate.vue";
import InputMonthlyPayment from "@/presentation/components/mortgage/InputMonthlyPayment.vue";
import InputTerm from "@/presentation/components/mortgage/InputTerm.vue";
import InputSondertilgung from "@/presentation/components/mortgage/InputSondertilgung.vue";
import SondertilgungTable from "@/presentation/components/mortgage/SondertilgungTable.vue";

interface MortgageInputs {
  loan: number;
  interestRate: number;
  principalRate: number;
  monthlyPayment: number | undefined;
  termMonths: number | undefined;
}

interface PaymentScheduleEntry {
  paymentNumber: number;
  principalPaid: number;
  interestPaid: number;
  interestPaidTotal: number;
  principalPaidTotal: number;
  rate: number;
  balance: number;
}

const monthOffset = ref(0);

const inputs = reactive<MortgageInputs>({
  loan: 100000,
  interestRate: 3.5,
  principalRate: 2,
  monthlyPayment: undefined,
  termMonths: undefined,
});

// Sondertilgung state
const sondertilgungMaxPercent = ref(10); // Default to 10%
const extraPayments = ref<Record<number, number>>({});

const paymentSchedule = ref<PaymentScheduleEntry[]>([]);
const tableData = ref<any[]>([]);

const locked = reactive({
  loan: true,
  interestRate: true,
  principalRate: true,
  termMonths: false,
  monthlyPayment: false,
  sondertilgung: true,
});

function monthNumberToDate(monthOffset: number): string {
  const currentDate = new Date();
  const targetDate = new Date();
  targetDate.setMonth(currentDate.getMonth() + monthOffset);
  return targetDate.toLocaleDateString("de-DE", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate the monthly payment based on loan, interest rate, and principal rate.
 */
function calculateMonthlyPayment(inputs: MortgageInputs): number {
  const { loan, interestRate, principalRate, termMonths } = inputs;

  if (termMonths === undefined) {
    const decimalLoan = new Decimal(loan);
    const monthlyInterestRate = new Decimal(interestRate)
      .dividedBy(100)
      .dividedBy(12);
    const yearlyRepayment = decimalLoan.times(
      new Decimal(principalRate).dividedBy(100)
    );
    const yearlyRate = decimalLoan
      .times(monthlyInterestRate)
      .times(12)
      .plus(yearlyRepayment);
    return yearlyRate.dividedBy(12).toNumber();
  }

  if (principalRate === undefined) {
    const monthlyRate = interestRate / 100 / 12;
    const numerator =
      loan * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
    const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
    return numerator / denominator;
  }

  return 0;
}

/**
 * Calculate the principal rate based on loan and new monthly payment.
 */
function calculatePrincipalRate(inputs: MortgageInputs): number {
  const { loan, interestRate, monthlyPayment } = inputs;

  if (!monthlyPayment) return 0;

  const decimalLoan = new Decimal(loan);
  const yearlyInterest = decimalLoan.times(
    new Decimal(interestRate).dividedBy(100)
  );
  const yearlyRepayment = new Decimal(monthlyPayment)
    .times(12)
    .minus(yearlyInterest);
  return yearlyRepayment.dividedBy(decimalLoan).times(100).toNumber();
}

/**
 * Calculate the term in months based on the loan, interest rate, and monthly payment.
 */
function calculateTermInMonths(inputs: MortgageInputs): number {
  const { loan, interestRate, monthlyPayment } = inputs;

  if (!monthlyPayment) return 360;

  const MIN_INTEREST_RATE = 0.12;
  const effectiveInterestRate = Math.max(interestRate, MIN_INTEREST_RATE);
  const monthlyInterestRate = effectiveInterestRate / 100 / 12;

  if (monthlyPayment <= loan * monthlyInterestRate) {
    return 360;
  }

  const numerator = Math.log(
    monthlyPayment / (monthlyPayment - loan * monthlyInterestRate)
  );
  const denominator = Math.log(1 + monthlyInterestRate);
  const termInMonths = numerator / denominator;

  return Math.floor(termInMonths > 1200 ? 360 : termInMonths);
}

function setMonthlyPayment(newMonthlyPayment: number) {
  inputs.monthlyPayment = newMonthlyPayment;

  if (!locked.termMonths) {
    inputs.termMonths = calculateTermInMonths(inputs);
  }
  if (!locked.principalRate) {
    inputs.principalRate = calculatePrincipalRate(inputs);
  }
}

function setTermMonths(newTermMonths: number) {
  inputs.termMonths = newTermMonths;

  if (!locked.monthlyPayment) {
    inputs.monthlyPayment = calculateMonthlyPayment({
      ...inputs,
      termMonths: newTermMonths,
    });
  }
}

function setLockedTermMonths(newLocked: boolean) {
  locked.termMonths = newLocked;
  locked.principalRate = !locked.principalRate;
}

function setLockedPrincipalRate(newLocked: boolean) {
  locked.principalRate = newLocked;
  locked.termMonths = !locked.termMonths;
}

function updatePaymentSchedule() {
  if (!inputs.monthlyPayment || inputs.monthlyPayment <= 0) {
    paymentSchedule.value = [];
    tableData.value = [];
    return;
  }

  // Convert extraPayments ref to sparse array format expected by createPaymentSchedule
  const extraPaymentsArray: number[] = [];
  Object.entries(extraPayments.value).forEach(([month, amount]) => {
    extraPaymentsArray[Number(month)] = amount;
  });

  const schedule = createPaymentSchedule(
    inputs.loan,
    inputs.interestRate,
    inputs.monthlyPayment,
    extraPaymentsArray
  ) as PaymentScheduleEntry[];

  paymentSchedule.value = schedule;

  tableData.value = schedule.map((entry) => ({
    paymentNumber: entry.paymentNumber - monthOffset.value,
    balance: entry.balance,
    rate: entry.rate,
    interestPaid: entry.interestPaid,
    interestPaidTotal: entry.interestPaidTotal,
    rest: entry.balance - entry.rate,
  }));
}

onMounted(() => {
  inputs.monthlyPayment = calculateMonthlyPayment(inputs);
  inputs.termMonths = calculateTermInMonths(inputs);
  updatePaymentSchedule();
});

watch(
  [
    () => inputs.loan,
    () => inputs.interestRate,
    () => inputs.monthlyPayment,
    extraPayments,
  ],
  () => {
    updatePaymentSchedule();
  },
  { deep: true }
);

watch(
  [() => inputs.loan, () => inputs.interestRate, () => inputs.principalRate],
  () => {
    if (!locked.monthlyPayment) {
      inputs.monthlyPayment = calculateMonthlyPayment(inputs);
    }
    if (!locked.termMonths) {
      inputs.termMonths = calculateTermInMonths(inputs);
    }
  },
  { deep: true }
);
</script>

<style scoped>
.router-link {
  color: #000000;
}
</style>
