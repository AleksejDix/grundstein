# Value Objects - Branded Types for Type Safety

This layer contains **immutable value objects** that represent fundamental business concepts using **branded types**. These types make illegal states unrepresentable at compile time.

## Architecture

```
src/core/domain/value-objects/
├── Money.ts              # Monetary values (€)
├── Percentage.ts         # Base percentage type
├── InterestRate.ts       # Interest rates (extends Percentage)
├── LoanAmount.ts         # Loan amounts (extends Money)
├── MonthCount.ts         # Time periods in months
├── YearCount.ts          # Time periods in years
├── PaymentMonth.ts       # Specific payment month (1-360)
├── PositiveInteger.ts    # Non-negative integers
├── PositiveDecimal.ts    # Non-negative decimals
├── LoanToValueRatio.ts   # LTV ratios (0-100%)
└── __tests__/            # Comprehensive property-based tests
```

## Design Principles

### 🛡️ **Type Safety First**

- **Branded types** prevent mixing incompatible values
- **Compile-time validation** catches errors early
- **Make illegal states unrepresentable**
- **No primitive obsession** - business concepts have dedicated types

### 🏗️ **Smart Constructors**

- All value objects created through factory functions
- **Validation at construction time**
- **Result types** for explicit error handling
- **Immutable by default** - no mutation after creation

### 💰 **Financial Precision**

- **Exact decimal arithmetic** using Decimal.js
- **No floating-point errors** for monetary calculations
- **Banker's rounding** following financial standards
- **Currency-aware** formatting and display

## Core Value Objects

### `Money.ts` - Monetary Values

Represents any monetary amount in EUR with cent precision:

```typescript
import { createMoney, toEuros, toCents } from "./Money";

// Create validated monetary amounts
const amount = createMoney(1234.56); // €1,234.56
if (amount.success) {
  console.log(toEuros(amount.data)); // "€1,234.56"
  console.log(toCents(amount.data)); // 123456 (cents)
}

// Validation prevents invalid states
const negative = createMoney(-100); // Error: "NegativeAmount"
const invalid = createMoney(NaN); // Error: "InvalidAmount"
```

**Features:**

- Prevents negative amounts
- Handles cent precision correctly
- Maximum value: €999,999,999.00
- Formatted display in EUR

### `LoanAmount.ts` - Specific Loan Values

Extends Money with loan-specific business rules:

```typescript
import { createLoanAmount, toEuros } from "./LoanAmount";

// Loan amounts have specific constraints
const loan = createLoanAmount(500000); // €500,000
if (loan.success) {
  console.log(toEuros(loan.data)); // "€500,000.00"
}

// Business rule validation
const tooSmall = createLoanAmount(999); // Error: "BelowMinimumAmount"
const tooLarge = createLoanAmount(5000000); // Error: "AboveMaximumAmount"
```

**Business Rules:**

- Minimum: €1,000 (practical loan minimum)
- Maximum: €3,000,000 (portfolio limit)
- Inherits all Money validations

### `InterestRate.ts` - Mortgage Interest Rates

Extends Percentage with interest rate specific constraints:

```typescript
import { createInterestRate, toPercentage, toDecimal } from "./InterestRate";

// Interest rates for mortgage calculations
const rate = createInterestRate(3.25); // 3.25% APR
if (rate.success) {
  console.log(toPercentage(rate.data)); // "3.25%"
  console.log(toDecimal(rate.data)); // 0.0325 (for calculations)
}

// Market-realistic constraints
const tooLow = createInterestRate(0.05); // Error: "BelowMinimumRate"
const tooHigh = createInterestRate(30); // Error: "AboveMaximumRate"
```

**Business Rules:**

- Minimum: 0.1% (historically low rates)
- Maximum: 25% (extreme high, prevents unrealistic inputs)
- Designed for annual percentage rates (APR)

### `MonthCount.ts` - Time Periods

Represents loan terms and payment periods:

```typescript
import { createMonthCount, toYears, toNumber } from "./MonthCount";

// Loan terms in months
const term = createMonthCount(360); // 30 years
if (term.success) {
  console.log(toYears(term.data)); // 30 (years)
  console.log(toNumber(term.data)); // 360 (months)
}

// Mortgage-specific constraints
const tooShort = createMonthCount(11); // Error: "BelowMinimumTerm"
const tooLong = createMonthCount(601); // Error: "AboveMaximumTerm"
```

**Business Rules:**

- Minimum: 12 months (1 year)
- Maximum: 600 months (50 years)
- Optimized for mortgage calculations

### `Percentage.ts` - Base Percentage Type

Foundation type for all percentage values:

```typescript
import {
  createPercentage,
  toPercentageValue,
  formatPercentage,
} from "./Percentage";

// Generic percentage values
const percent = createPercentage(15.5);
if (percent.success) {
  console.log(formatPercentage(percent.data)); // "15.5%"
  console.log(toPercentageValue(percent.data)); // 15.5
}

// Validation constraints
const negative = createPercentage(-5); // Error: "NegativePercentage"
const excessive = createPercentage(150); // Error: "ExcessivePercentage"
```

**Features:**

- Range: 0% to 100%
- Decimal precision support
- Formatted display
- Base for specialized percentage types

## Advanced Value Objects

### `PaymentMonth.ts` - Payment Schedule Indexing

Represents specific months in a payment schedule:

```typescript
import { createPaymentMonth, toNumber } from "./PaymentMonth";

// Payment schedule navigation
const month = createPaymentMonth(24); // 24th payment
if (month.success) {
  console.log(`Payment ${toNumber(month.data)}`); // "Payment 24"
}
```

### `LoanToValueRatio.ts` - Property Valuation

Specialized percentage for loan-to-value calculations:

```typescript
import { createLoanToValueRatio, toPercentage } from "./LoanToValueRatio";

// LTV ratio calculations
const ltv = createLoanToValueRatio(80); // 80% LTV
if (ltv.success) {
  console.log(toPercentage(ltv.data)); // "80.0%"
}
```

### `PositiveInteger.ts` & `PositiveDecimal.ts` - Utility Types

General-purpose positive number types:

```typescript
import {
  createPositiveInteger,
  createPositiveDecimal,
} from "./PositiveInteger";

// Count values that must be positive
const count = createPositiveInteger(5);
const ratio = createPositiveDecimal(1.25);
```

## Type Safety Benefits

### Preventing Type Confusion

```typescript
// ❌ Without branded types - dangerous
function calculatePayment(amount: number, rate: number, term: number) {
  // Could accidentally pass parameters in wrong order
  return calculate(rate, amount, term); // BUG: wrong order!
}

// ✅ With branded types - safe
function calculatePayment(
  amount: LoanAmount,
  rate: InterestRate,
  term: MonthCount,
): Result<MonthlyPayment, CalculationError> {
  // Compiler prevents passing wrong types
  return calculate(amount, rate, term); // Type-safe!
}
```

### Compile-Time Business Rules

```typescript
// These won't compile - caught at build time
const amount: LoanAmount = createMoney(500000); // ❌ Type mismatch
const rate: Percentage = createInterestRate(3.5); // ❌ Type mismatch

// This compiles and is type-safe
const amount = createLoanAmount(500000);
const rate = createInterestRate(3.5);
if (amount.success && rate.success) {
  const payment = calculatePayment(amount.data, rate.data, term.data);
}
```

## Error Handling Patterns

All value objects use Result types for validation:

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

// Always check success before using data
const amount = createLoanAmount(input);
if (amount.success) {
  // Safe to use amount.data - guaranteed valid
  processLoan(amount.data);
} else {
  // Handle specific error cases
  switch (amount.error) {
    case "BelowMinimumAmount":
      showError("Loan amount too small");
      break;
    case "AboveMaximumAmount":
      showError("Loan amount too large");
      break;
  }
}
```

## Testing Strategy

Each value object has comprehensive tests:

### Property-Based Testing

```typescript
// Example from Money.test.ts
import fc from "fast-check";

test("Money roundtrip through euros conversion", () => {
  fc.assert(
    fc.property(fc.float({ min: 0, max: 999999 }), (euros) => {
      const money = createMoney(euros);
      if (money.success) {
        expect(toEuros(money.data)).toBeCloseTo(euros, 2);
      }
    }),
  );
});
```

### Edge Case Coverage

- Boundary values (min/max)
- Invalid inputs (negative, NaN, Infinity)
- Precision edge cases
- Type conversion roundtrips

## Performance Characteristics

- **Zero runtime overhead** for type checking (compile-time only)
- **Minimal memory footprint** (branded types are just numbers)
- **Fast validation** (simple numeric comparisons)
- **No external dependencies** beyond Decimal.js for precision

## Dependencies

Value objects depend only on:

- `primitives/Brand.ts` for the branding utility
- `Decimal.js` for precise arithmetic (Money types only)
- **No business logic or external APIs**

This ensures value objects remain pure and reusable across any context.
