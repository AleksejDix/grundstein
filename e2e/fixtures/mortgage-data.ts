// Test data for mortgage calculations
export const mortgageTestData = {
  // Standard German mortgage
  standardGermanMortgage: {
    amount: 300000,
    interestRate: 3.5,
    fixedRatePeriod: 10,
    monthlyPayment: 1500,
    market: "DE" as const,
    bank: "Deutsche Bank",
    name: "Primary Home Mortgage",
  },

  // Swiss mortgage
  swissMortgage: {
    amount: 800000,
    interestRate: 2.5,
    fixedRatePeriod: 5,
    monthlyPayment: 3000,
    market: "CH" as const,
    bank: "UBS",
    name: "Swiss Property Mortgage",
  },

  // High-value mortgage
  highValueMortgage: {
    amount: 1000000,
    interestRate: 4.0,
    fixedRatePeriod: 15,
    monthlyPayment: 5000,
    market: "DE" as const,
    bank: "Commerzbank",
    name: "Luxury Property Mortgage",
  },

  // Low-value mortgage
  lowValueMortgage: {
    amount: 150000,
    interestRate: 3.0,
    fixedRatePeriod: 20,
    monthlyPayment: 800,
    market: "DE" as const,
    bank: "Sparkasse",
    name: "Apartment Mortgage",
  },

  // Edge case: Very low monthly payment
  lowPaymentMortgage: {
    amount: 300000,
    interestRate: 5.0,
    fixedRatePeriod: 10,
    monthlyPayment: 100, // Too low to cover interest
    market: "DE" as const,
    bank: "Test Bank",
    name: "Low Payment Test",
  },

  // Edge case: Very high monthly payment
  highPaymentMortgage: {
    amount: 300000,
    interestRate: 3.5,
    fixedRatePeriod: 10,
    monthlyPayment: 10000, // Very high payment
    market: "DE" as const,
    bank: "Test Bank",
    name: "High Payment Test",
  },

  // Invalid data for validation testing
  invalidData: {
    negativeAmount: {
      amount: -100000,
      interestRate: 3.5,
      fixedRatePeriod: 10,
      monthlyPayment: 1500,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },

    zeroAmount: {
      amount: 0,
      interestRate: 3.5,
      fixedRatePeriod: 10,
      monthlyPayment: 1500,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },

    negativeInterestRate: {
      amount: 300000,
      interestRate: -3.5,
      fixedRatePeriod: 10,
      monthlyPayment: 1500,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },

    zeroInterestRate: {
      amount: 300000,
      interestRate: 0,
      fixedRatePeriod: 10,
      monthlyPayment: 1500,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },

    negativeMonthlyPayment: {
      amount: 300000,
      interestRate: 3.5,
      fixedRatePeriod: 10,
      monthlyPayment: -1500,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },

    zeroMonthlyPayment: {
      amount: 300000,
      interestRate: 3.5,
      fixedRatePeriod: 10,
      monthlyPayment: 0,
      market: "DE" as const,
      bank: "Test Bank",
      name: "Invalid Mortgage",
    },
  },
};

// Portfolio test data
export const portfolioTestData = {
  standardPortfolio: {
    name: "Real Estate Portfolio",
    owner: "John Doe",
  },

  businessPortfolio: {
    name: "Business Properties",
    owner: "Acme Corporation",
  },

  investmentPortfolio: {
    name: "Investment Properties",
    owner: "Jane Smith",
  },
};

// Date helpers
export const dateHelpers = {
  today: () => new Date().toISOString().split("T")[0],

  pastDate: (yearsAgo: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toISOString().split("T")[0];
  },

  futureDate: (yearsFromNow: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearsFromNow);
    return date.toISOString().split("T")[0];
  },
};

// Validation messages
export const validationMessages = {
  invalidLoanAmount: "Please enter a valid loan amount",
  invalidInterestRate: "Please enter a valid interest rate",
  invalidMonthlyPayment: "Please enter a valid monthly payment amount",
  missingMortgageName: "Please enter a mortgage name",
  missingBank: "Please enter a bank/lender name",
};
