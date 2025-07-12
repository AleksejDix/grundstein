# Domain Layer - Functional Core

This is the **functional core** of our mortgage calculator, implementing **Domain-Driven Design (DDD)** principles with **functional programming** patterns.

**Last Updated:** 2025-07-12 - Domain layer documentation updated to reflect current implementation.

## Architecture Overview

```
src/core/domain/
├── calculations/       # Pure calculation functions (business logic)
├── value-objects/      # Branded types with validation (primitives)
├── types/             # Complex domain types (aggregates)
├── entities/          # Domain entities with business rules
├── primitives/        # Base types and utilities
```

## Design Principles

### 🔥 **Functional Programming First**

- **Pure functions** - No side effects, predictable outputs
- **Immutable data** - All domain objects are readonly
- **Function composition** - Complex operations built from simple functions
- **Result types** - Explicit error handling without exceptions

### 🏗️ **Domain-Driven Design**

- **Ubiquitous language** - Business terms throughout code
- **Bounded contexts** - Clear separation of concerns
- **Rich domain model** - Business logic in the domain layer
- **Value objects** - Immutable objects representing business concepts

### 🛡️ **Type Safety**

- **Branded types** - Make illegal states unrepresentable
- **Compile-time validation** - Catch errors before runtime
- **Exhaustive pattern matching** - Handle all cases explicitly

## Core Concepts

### Value Objects (`value-objects/`)

Immutable, validated types representing business concepts:

```typescript
const amount = createLoanAmount(300000); // €300,000
const rate = createInterestRate(3.5); // 3.5%
const term = createMonthCount(360); // 30 years
```

### Calculations (`calculations/`)

Pure functions implementing business logic:

```typescript
const payment = calculateMonthlyPayment(loanConfig);
const schedule = generateAmortizationSchedule(loanConfig);
const impact = calculateSondertilgungImpact(loan, extraPayments);
```

### Domain Types (`types/`)

Complex business objects composed of value objects:

```typescript
const loanConfig = createLoanConfiguration(amount, rate, term, payment);
const portfolio = createMortgagePortfolio(id, name, owner);
```

## Business Domain

### 🏠 **Mortgage Calculations**

- Loan calculations with German market rules
- Sondertilgung (extra payments) with percentage limits
- Amortization schedules and payment breakdowns
- Interest rate sensitivity analysis

### 💰 **Financial Calculations**

- Precise decimal arithmetic for monetary values
- Property valuation and LTV calculations
- Payment history tracking and analysis
- Break-even analysis for refinancing

## Usage Examples

### Creating Domain Objects

```typescript
import {
  createLoanAmount,
  createInterestRate,
  createLoanConfiguration,
  calculateMonthlyPayment,
} from "../core/domain";

// Create validated domain objects
const amount = createLoanAmount(500000); // €500k
const rate = createInterestRate(2.8); // 2.8%
const term = createMonthCount(300); // 25 years

if (amount.success && rate.success && term.success) {
  // All validations passed, safe to use
  const payment = calculateMonthlyPayment({
    amount: amount.data,
    annualRate: rate.data,
    termInMonths: term.data,
  });
}
```

### Sondertilgung Operations

```typescript
import {
  createSondertilgungPlan,
  addExtraPayment,
  calculateSondertilgungImpact,
} from "../core/domain";

const plan = createSondertilgungPlan("FIVE_PERCENT");
const updatedPlan = addExtraPayment(plan, extraPayment);
const impact = calculateSondertilgungImpact(loan, plan);
```

## Error Handling

All operations return `Result<T, E>` types for explicit error handling:

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

// Always check success before accessing data
const amount = createLoanAmount(input);
if (amount.success) {
  // Safe to use amount.data
  console.log(toEuros(amount.data));
} else {
  // Handle specific error
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

## Key Features

### ✅ **German Market Support**

- Compliance with German banking regulations
- BaFin-compliant calculation rules
- EUR currency and German formatting standards

### ✅ **Sondertilgung Management**

- Extra payment calculations
- Percentage-based annual limits
- Bank-specific rule enforcement

### ✅ **Property-Based Testing**

- Mathematical invariants verified
- Edge case coverage
- Real-world scenario validation

### ✅ **Performance Optimized**

- Zero external dependencies in core
- Efficient immutable operations
- Lazy evaluation where possible

## Testing Strategy

Each layer has comprehensive tests:

- **Unit tests** for individual functions
- **Property-based tests** for mathematical invariants
- **Integration tests** for complex workflows
- **Real-world validation** with market data

## Next Steps

1. Explore each subdirectory's README for detailed information
2. Check the test files for usage examples
3. Review the `index.ts` for the complete public API
4. See `CLAUDE.md` in project root for architectural decisions
