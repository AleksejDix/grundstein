# Domain Types - Complex Business Objects

This layer contains **complex domain types** that compose value objects into meaningful business entities. These types represent the core business concepts and relationships in the mortgage domain.

## Architecture

```
src/core/domain/types/
├── LoanConfiguration.ts     # Complete loan setup (amount + rate + term)
├── MonthlyPayment.ts        # Payment breakdown (principal + interest)
├── ExtraPayment.ts          # Sondertilgung payments
├── SondertilgungPlan.ts     # Complete extra payment strategy
├── FixedRatePeriod.ts       # Rate lock periods
├── PropertyValuation.ts     # Property assessment data
├── PaymentHistory.ts        # Historical payment tracking
└── __tests__/               # Comprehensive business logic tests
```

## Design Principles

### 🏗️ **Composition Over Inheritance**
- **Compose value objects** into meaningful business entities
- **Immutable data structures** with readonly properties
- **Type-safe construction** through factory functions
- **Business invariants** enforced at the type level

### 🏦 **Domain-Driven Design**
- **Rich domain models** that express business concepts
- **Ubiquitous language** reflected in type names
- **Business rules** encoded as type constraints
- **Swiss/German banking domain** expertise

### 🔒 **Data Integrity**
- **Validated construction** prevents invalid states
- **Consistent relationships** between composed objects
- **Referential integrity** within domain boundaries
- **Immutable after creation** - no state corruption

## Core Domain Types

### `LoanConfiguration.ts` - Complete Loan Setup

Represents the fundamental parameters that define a mortgage loan:

```typescript
import { createLoanConfiguration } from './LoanConfiguration';

// Complete loan setup
const config = createLoanConfiguration({
  amount: loanAmount,      // LoanAmount (€500,000)
  annualRate: rate,        // InterestRate (3.5%)
  termInMonths: term,      // MonthCount (360 months)
  monthlyPayment: payment  // MonthlyPayment (optional - can be calculated)
});

if (config.success) {
  const loan = config.data;
  console.log(`Loan: ${formatLoanAmount(loan.amount)}`);
  console.log(`Rate: ${formatInterestRate(loan.annualRate)}`);
  console.log(`Term: ${formatMonthCount(loan.termInMonths)}`);
}
```

**Features:**
- Validates all parameters work together mathematically
- Can derive missing parameter (amount, payment, or term)
- Ensures loan configuration is financially sound
- Provides formatted output for all parameters

### `MonthlyPayment.ts` - Payment Structure

Breaks down monthly payments into principal and interest components:

```typescript
import { createMonthlyPayment } from './MonthlyPayment';

// Payment breakdown
const payment = createMonthlyPayment({
  principalAmount: principalMoney,    // Money (€800)
  interestAmount: interestMoney,      // Money (€1,200)
  totalAmount: totalMoney            // Money (€2,000)
});

if (payment.success) {
  const p = payment.data;
  console.log(`Principal: ${toEuros(p.principalAmount)}`);
  console.log(`Interest: ${toEuros(p.interestAmount)}`);
  console.log(`Total: ${toEuros(p.totalAmount)}`);
}
```

**Validation:**
- Ensures principal + interest = total
- Prevents negative payment components
- Validates mathematical consistency

### `SondertilgungPlan.ts` - Extra Payment Strategy

Represents the complete strategy for extra payments (Sondertilgung):

```typescript
import { createSondertilgungPlan } from './SondertilgungPlan';

// Extra payment plan with annual limits
const plan = createSondertilgungPlan({
  yearlyLimit: { type: "Percentage", value: percentage10 },  // 10% annual limit
  payments: [
    { paymentMonth: month12, amount: money5000 },    // €5k in month 12
    { paymentMonth: month24, amount: money10000 }    // €10k in month 24
  ]
});

if (plan.success) {
  const sondertilgung = plan.data;
  // Plan respects annual limits and payment schedule
}
```

**Business Rules:**
- **Annual limits**: 5%, 10%, 20%, 50%, or unlimited
- **German banking compliance**: Standard market limits
- **Payment timing**: Tied to specific payment months
- **Limit enforcement**: Validates total yearly payments don't exceed limits

### `ExtraPayment.ts` - Individual Extra Payment

Represents a single extra payment within a Sondertilgung plan:

```typescript
import { createExtraPayment } from './ExtraPayment';

// Single extra payment
const extraPayment = createExtraPayment({
  paymentMonth: month24,    // PaymentMonth (24th payment)
  amount: money15000       // Money (€15,000)
});

if (extraPayment.success) {
  const payment = extraPayment.data;
  console.log(`Extra €${toEuros(payment.amount)} in month ${toNumber(payment.paymentMonth)}`);
}
```

### `FixedRatePeriod.ts` - Interest Rate Lock

Represents periods where interest rates are fixed:

```typescript
import { createFixedRatePeriod } from './FixedRatePeriod';

// Fixed rate period
const period = createFixedRatePeriod({
  startMonth: month1,         // PaymentMonth (1)
  endMonth: month60,          // PaymentMonth (60)
  fixedRate: rate35          // InterestRate (3.5%)
});

if (period.success) {
  const fix = period.data;
  console.log(`Fixed ${formatInterestRate(fix.fixedRate)} for months ${toNumber(fix.startMonth)}-${toNumber(fix.endMonth)}`);
}
```

**Features:**
- Validates start month comes before end month
- Ensures rate is within valid bounds
- Supports multiple overlapping periods for rate changes

### `PropertyValuation.ts` - Property Assessment

Represents complete property valuation data:

```typescript
import { createPropertyValuation } from './PropertyValuation';

// Property valuation
const valuation = createPropertyValuation({
  marketValue: money800000,        // Money (€800,000)
  loanToValueRatio: ltv80,        // LoanToValueRatio (80%)
  valuationDate: new Date(),      // Date of assessment
  valuationType: "Professional"   // "Professional" | "Automated" | "SelfAssessment"
});

if (valuation.success) {
  const prop = valuation.data;
  const maxLoan = calculateMaxLoanAmount(prop.marketValue, prop.loanToValueRatio);
  console.log(`Max loan: ${toEuros(maxLoan)} at ${toPercentage(prop.loanToValueRatio)} LTV`);
}
```

**Validation:**
- Market value must be positive
- LTV ratio within banking limits (typically 80-95%)
- Valuation date cannot be in the future
- Consistent calculation of maximum loan amount

### `PaymentHistory.ts` - Payment Tracking

Tracks historical payment data for analysis:

```typescript
import { createPaymentHistory } from './PaymentHistory';

// Payment history tracking
const history = createPaymentHistory({
  paymentMonth: month24,           // PaymentMonth (24)
  scheduledPayment: scheduled,     // MonthlyPayment (scheduled amount)
  actualPayment: actual,          // MonthlyPayment (actual amount paid)
  extraPayment: extra,            // Money (any extra amount)
  remainingBalance: balance       // Money (balance after payment)
});

if (history.success) {
  const record = history.data;
  // Track payment performance and balance progression
}
```

## Advanced Usage Patterns

### Loan Configuration with Parameter Solving

```typescript
import { 
  createLoanAmount, 
  createInterestRate,
  createMonthCount,
  createLoanConfiguration,
  solveMissingParameter 
} from '../domain';

// Create config with missing payment - system will calculate
const amount = createLoanAmount(500000);
const rate = createInterestRate(3.25);
const term = createMonthCount(360);

if (amount.success && rate.success && term.success) {
  const config = createLoanConfiguration({
    amount: amount.data,
    annualRate: rate.data,
    termInMonths: term.data
    // monthlyPayment omitted - will be calculated
  });
  
  if (config.success) {
    console.log(`Calculated payment: ${toEuros(config.data.monthlyPayment.totalAmount)}`);
  }
}
```

### Complex Sondertilgung Planning

```typescript
import { 
  createSondertilgungPlan,
  createPercentage,
  validateSondertilgungLimits 
} from '../domain';

// Create sophisticated extra payment strategy
const yearlyLimit = { 
  type: "Percentage" as const, 
  value: createPercentage(10).data  // 10% annual limit
};

const extraPayments = [
  createExtraPayment({ paymentMonth: month12, amount: money20000 }),
  createExtraPayment({ paymentMonth: month24, amount: money30000 }),
  createExtraPayment({ paymentMonth: month36, amount: money25000 })
];

const plan = createSondertilgungPlan({
  yearlyLimit,
  payments: extraPayments.map(p => p.data).filter(Boolean)
});

// Validate against original loan amount
const isValid = validateSondertilgungLimits(plan.data, originalLoanAmount);
```

### Property Valuation with LTV Analysis

```typescript
import { 
  createPropertyValuation,
  createLoanToValueRatio,
  calculateMaximumLoanAmount 
} from '../domain';

// Comprehensive property analysis
const valuation = createPropertyValuation({
  marketValue: createMoney(750000).data,
  loanToValueRatio: createLoanToValueRatio(85).data,
  valuationDate: new Date(),
  valuationType: "Professional"
});

if (valuation.success) {
  const maxLoan = calculateMaximumLoanAmount(
    valuation.data.marketValue,
    valuation.data.loanToValueRatio
  );
  
  console.log(`Property value: ${toEuros(valuation.data.marketValue)}`);
  console.log(`Max loan at ${toPercentage(valuation.data.loanToValueRatio)} LTV: ${toEuros(maxLoan)}`);
}
```

## Error Handling

All domain types use comprehensive Result types:

```typescript
type LoanConfigurationError = 
  | 'InvalidLoanAmount'
  | 'InvalidInterestRate' 
  | 'InvalidTermLength'
  | 'InconsistentParameters'
  | 'UnrealisticPayment';

// Always validate before using
const config = createLoanConfiguration(params);
if (config.success) {
  // Safe to use config.data
  processLoan(config.data);
} else {
  // Handle specific business rule violations
  switch (config.error) {
    case 'InconsistentParameters':
      showError('Loan parameters don\'t work together mathematically');
      break;
    case 'UnrealisticPayment':
      showError('Payment amount is unrealistic for this loan');
      break;
    // ...
  }
}
```

## Testing Strategy

Domain types have thorough test coverage:

### Business Rule Validation
```typescript
// Example from LoanConfiguration.test.ts
test('prevents unrealistic payment for loan amount', () => {
  const config = createLoanConfiguration({
    amount: createLoanAmount(500000).data,
    annualRate: createInterestRate(3.5).data,
    termInMonths: createMonthCount(360).data,
    monthlyPayment: createMonthlyPayment({
      totalAmount: createMoney(500).data  // Too small!
    }).data
  });
  
  expect(config.success).toBe(false);
  expect(config.error).toBe('UnrealisticPayment');
});
```

### Property-Based Testing
```typescript
// Mathematical relationships must hold
fc.assert(fc.property(
  validLoanConfigArbitrary,
  (config) => {
    // Payment calculation should be consistent
    const calculatedPayment = calculateMonthlyPayment(config);
    expect(calculatedPayment.success).toBe(true);
  }
));
```

## Dependencies

Domain types depend on:
- Value objects for all primitive components
- Calculation functions for validation
- Brand primitives for type safety
- **No external APIs or Vue dependencies**

This keeps domain types pure and suitable for any context (web, server, CLI, etc.).