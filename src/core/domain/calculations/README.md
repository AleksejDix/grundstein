# Calculations Layer - Pure Mathematical Functions

This layer contains the **core mathematical functions** that power all mortgage calculations in the system. These are **pure functions** implementing business logic with no side effects.

## Architecture

```
src/core/domain/calculations/
├── LoanCalculations.ts          # Basic loan mathematics
├── SondertilgungCalculations.ts # Extra payment calculations
├── AmortizationEngine.ts        # Complete payment schedules
├── PortfolioCalculations.ts     # Multi-mortgage analysis
└── __tests__/                   # Comprehensive test coverage
```

## Design Principles

### 🔢 **Pure Mathematical Functions**

- No side effects or external dependencies
- Deterministic outputs for given inputs
- Composable and testable
- Precise decimal arithmetic using Decimal.js

### 🏦 **Swiss & German Banking Standards**

- Market-specific calculation rules
- Regulatory compliance built-in
- Real-world validation scenarios
- Professional accuracy standards

### 🧮 **Financial Mathematics Excellence**

- Compound interest calculations
- Amortization schedule generation
- Present value and time value of money
- Payment optimization algorithms

## Core Modules

### `LoanCalculations.ts` - Foundation Mathematics

Basic mortgage calculations used throughout the system:

```typescript
import {
  calculateMonthlyPayment,
  calculateLoanAmount,
} from "./LoanCalculations";

// Calculate monthly payment for a loan
const payment = calculateMonthlyPayment({
  amount: loanAmount, // LoanAmount (€300,000)
  annualRate: interestRate, // InterestRate (3.5%)
  termInMonths: monthCount, // MonthCount (360 months)
});

// Calculate maximum loan for given payment
const maxLoan = calculateLoanAmount({
  monthlyPayment: payment, // MonthlyPayment (€1,500)
  annualRate: interestRate, // InterestRate (3.5%)
  termInMonths: monthCount, // MonthCount (360 months)
});
```

**Key Functions:**

- `calculateMonthlyPayment()` - Core PMT calculation
- `calculateLoanAmount()` - Reverse loan calculation
- `calculateRemainingBalance()` - Balance at any point
- `calculateTotalInterest()` - Lifetime interest cost

### `SondertilgungCalculations.ts` - Extra Payment Logic

Handles Swiss/German extra payment (Sondertilgung) calculations:

```typescript
import { calculateSondertilgungImpact } from "./SondertilgungCalculations";

// Calculate impact of extra payments
const impact = calculateSondertilgungImpact(
  loanConfig,
  sondertilgungPlan, // Annual extra payments with % limits
);

// Results include:
// - Time savings (months reduced)
// - Interest savings (total € saved)
// - New payment schedule
// - Compliance with bank limits
```

**Key Features:**

- Percentage-based annual limits (5%, 10%, 20%, 50%, unlimited)
- Bank-specific rule enforcement
- Payment timing optimization
- Compound savings calculations

### `AmortizationEngine.ts` - Complete Schedule Generation

The heart of the system - generates complete payment schedules:

```typescript
import { generateAmortizationSchedule } from "./AmortizationEngine";

// Generate complete payment schedule
const schedule = generateAmortizationSchedule(
  loanConfig,
  sondertilgungPlan, // Optional extra payments
);

// Each payment contains:
// - Payment number and date
// - Principal and interest breakdown
// - Remaining balance
// - Extra payment amounts
// - Cumulative totals
```

**Schedule Analysis:**

- Payment-by-payment breakdown
- Principal vs interest tracking
- Balance progression
- Payment optimization insights

### `PortfolioCalculations.ts` - Multi-Mortgage Analysis

Aggregates and analyzes multiple mortgages as a portfolio:

```typescript
import {
  calculatePortfolioSummary,
  optimizePortfolio,
} from "./PortfolioCalculations";

// Analyze entire portfolio
const summary = calculatePortfolioSummary(mortgagePortfolio);

// Results include:
// - Total portfolio value
// - Combined cash flows
// - Risk analysis
// - Optimization opportunities
```

## Mathematical Accuracy

### Precision Standards

- **Decimal.js** for all monetary calculations
- **No floating-point arithmetic** for financial values
- **Rounding policies** following banking standards
- **Precision to the cent** for all calculations

### Validation & Testing

- **Property-based testing** with fast-check
- **Mathematical invariant verification**
- **Edge case coverage** (zero rates, extreme values)
- **Real-world scenario validation**

## Usage Patterns

### Basic Loan Calculation

```typescript
import {
  createLoanAmount,
  createInterestRate,
  createMonthCount,
  calculateMonthlyPayment,
} from "../domain";

const config = {
  amount: createLoanAmount(500000).data, // €500k
  annualRate: createInterestRate(3.2).data, // 3.2%
  termInMonths: createMonthCount(300).data, // 25 years
};

const payment = calculateMonthlyPayment(config);
if (payment.success) {
  console.log(`Monthly payment: ${toEuros(payment.data.amount)}`);
}
```

### Sondertilgung Analysis

```typescript
import { calculateSondertilgungImpact } from "./SondertilgungCalculations";

const extraPayments = createSondertilgungPlan([
  { year: 1, amount: 10000 }, // €10k extra in year 1
  { year: 2, amount: 15000 }, // €15k extra in year 2
]);

const impact = calculateSondertilgungImpact(loanConfig, extraPayments);
// Returns: time saved, interest saved, new schedule
```

### Complete Schedule Generation

```typescript
import { generateAmortizationSchedule } from "./AmortizationEngine";

const schedule = generateAmortizationSchedule(loanConfig, sondertilgungPlan);
if (schedule.success) {
  schedule.data.payments.forEach((payment, index) => {
    console.log(
      `Month ${index + 1}: ${toEuros(payment.principalAmount)} principal`,
    );
  });
}
```

## Error Handling

All calculation functions return `Result<T, E>` types:

```typescript
type LoanCalculationError =
  | "InvalidLoanConfiguration"
  | "MathematicalError"
  | "NegativeAmortization"
  | "ExcessiveSondertilgung";

// Always check for success
const result = calculateMonthlyPayment(config);
if (result.success) {
  // Safe to use result.data
} else {
  // Handle specific error cases
  switch (result.error) {
    case "InvalidLoanConfiguration":
      // Handle configuration error
      break;
    // ...
  }
}
```

## Performance Characteristics

- **O(n) complexity** for schedule generation (n = number of payments)
- **Lazy evaluation** where possible
- **Memory efficient** with streaming calculations
- **No external API calls** - pure computation

## Testing Strategy

Each calculation module has comprehensive tests:

- **Unit tests** for individual functions
- **Property-based tests** for mathematical properties
- **Integration tests** for complex workflows
- **Performance benchmarks** for large calculations

## Dependencies

The calculations layer depends only on:

- Domain value objects (Money, Percentage, etc.)
- Domain types (LoanConfiguration, etc.)
- Decimal.js for precise arithmetic
- **No external APIs or Vue dependencies**

This ensures the calculations remain pure and can be used in any context (web, server, CLI, etc.).
