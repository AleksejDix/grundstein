export type Mortgage = {
  loan: number;
  annualInterestRate: number;
  termInYears: number;
};

type PaymentDetail = {
  month: number; // The month number of the payment
  interestComponent: number; // The interest portion of the payment
  principalComponent: number; // The principal portion of the payment
  remainingBalance: number; // The remaining balance of the mortgage after this payment
};

export type InterestRate = {
  rate: number; // The numerical value of the rate
  type: "fixed" | "variable"; // Type of the interest rate
};

export type PaymentPlan = PaymentDetail[];

export type AmortizationSchedule = {
  mortgageId: string; // Identifier for the related mortgage
  payments: PaymentPlan;
};

// Not needed now
export type LoanToValueRatio = {
  loanAmount: number;
  propertyValue: number;
};
