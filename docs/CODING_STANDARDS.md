# Coding Standards - Functional Programming & Vue Composition API

This document establishes the programming paradigm rules for the Grundstein mortgage portfolio management application.

## Core Principles

### 1. **Functional Programming Only**

- All business logic must be implemented as pure functions
- No classes or object-oriented patterns
- Immutable data structures and operations
- Function composition over inheritance

### 2. **Vue Composition API Only**

- All Vue components must use `<script setup>` syntax
- No Options API (`data()`, `methods`, `computed`, etc.)
- Use composables for shared logic

## Rules and Patterns

### ✅ **ALLOWED Patterns**

#### Pure Functions

```typescript
// ✅ Good - Pure function with clear input/output
export function calculateMonthlyPayment(
  loanAmount: LoanAmount,
  interestRate: InterestRate,
  termYears: YearCount
): Result<MonthlyPayment, CalculationError> {
  // implementation
}
```

#### Vue Composition API

```vue
<!-- ✅ Good - Composition API -->
<script setup lang="ts">
import { ref, computed } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);

function increment() {
  count.value++;
}
</script>
```

#### Functional Services

```typescript
// ✅ Good - Functions exported directly
export async function analyzeLoan(
  input: LoanInput
): Promise<Result<Analysis, Error>> {
  // implementation
}

export async function calculateSondertilgung(
  loan: Loan,
  extraPayment: ExtraPayment
): Promise<Result<SondertilgungResult, Error>> {
  // implementation
}
```

#### Functional Repository

```typescript
// ✅ Good - Function-based repository
export const createPortfolioRepository = () => {
  let portfolios: Portfolio[] = [];

  return {
    save: async (portfolio: Portfolio) => {
      portfolios = [
        ...portfolios.filter((p) => p.id !== portfolio.id),
        portfolio,
      ];
      return { success: true };
    },
    findById: async (id: string) => {
      const portfolio = portfolios.find((p) => p.id === id);
      return portfolio
        ? { success: true, data: portfolio }
        : { success: false, error: "NotFound" };
    },
  };
};
```

#### Composables for Shared Logic

```typescript
// ✅ Good - Composable for reusable reactive logic
export function useMortgageCalculation() {
  const loanAmount = ref(0);
  const interestRate = ref(0);

  const monthlyPayment = computed(() =>
    calculateMonthlyPayment(loanAmount.value, interestRate.value)
  );

  return {
    loanAmount,
    interestRate,
    monthlyPayment,
  };
}
```

#### Immutable Operations

```typescript
// ✅ Good - Immutable array operations
export function addPaymentToHistory(
  history: PaymentRecord[],
  newPayment: PaymentRecord
): PaymentRecord[] {
  return [...history, newPayment];
}

export function updatePayment(
  history: PaymentRecord[],
  paymentId: string,
  updates: Partial<PaymentRecord>
): PaymentRecord[] {
  return history.map((payment) =>
    payment.id === paymentId ? { ...payment, ...updates } : payment
  );
}
```

### ❌ **FORBIDDEN Patterns**

#### Classes and OOP

```typescript
// ❌ Bad - No classes allowed
class MortgageService {
  private repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  analyze(loan: Loan) {
    // implementation
  }
}
```

#### Vue Options API

```vue
<!-- ❌ Bad - No Options API -->
<script>
export default {
  data() {
    return {
      count: 0,
    };
  },
  computed: {
    doubled() {
      return this.count * 2;
    },
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>
```

#### Mutable State

```typescript
// ❌ Bad - Direct mutation
const portfolios: Portfolio[] = [];

function addPortfolio(portfolio: Portfolio) {
  portfolios.push(portfolio); // Direct mutation
}
```

#### Singleton Instances

```typescript
// ❌ Bad - Singleton class instances
export const mortgageService = new MortgageService();
export const portfolioRepository = new PortfolioRepository();
```

#### Interface-based Programming

```typescript
// ❌ Bad - OOP interface pattern
interface IRepository {
  save(item: any): Promise<void>;
  findById(id: string): Promise<any>;
}

class Repository implements IRepository {
  // implementation
}
```

## Architecture Guidelines

### Domain Layer

- **Must be**: Pure functions with branded types
- **Pattern**: `createTypeName()` smart constructors
- **Error Handling**: `Result<T, E>` pattern
- **No**: Classes, interfaces, mutations

### Application Layer

- **Must be**: Pure functions that orchestrate domain operations
- **Pattern**: Functions that take input and return `Promise<Result<T, E>>`
- **Dependencies**: Passed as function parameters
- **No**: Service classes, dependency injection containers

### Infrastructure Layer

- **Must be**: Factory functions that return function objects
- **Pattern**: `createRepositoryName()` that returns function object
- **State**: Encapsulated in closures, not class properties
- **No**: Class-based repositories, interfaces

### Presentation Layer

- **Vue Components**: Must use `<script setup>` Composition API
- **Shared Logic**: Extract to composables (`use*` functions)
- **State Management**: Pinia with Composition API pattern
- **No**: Options API, class components, mixins

## File Organization

```
src/
├── domain/              # Pure functions, branded types
│   ├── types/           # Smart constructors: createMoney()
│   ├── calculations/    # Pure calculation functions
│   └── entities/        # Domain entities (functional)
├── application/         # Orchestration functions
│   └── services/        # Pure functions, no classes
├── infrastructure/      # Factory functions
│   └── persistence/     # createRepository() functions
├── presentation/        # Vue Composition API
│   └── components/      # <script setup> only
└── views/              # <script setup> pages
```

## Testing

- **Unit Tests**: Test pure functions in isolation
- **No Mocking**: Pure functions don't need mocks
- **Property Testing**: Use fast-check for mathematical invariants
- **Component Testing**: Test composables separately from components

## Migration Guidelines

When converting existing OOP code:

1. **Classes → Functions**: Extract methods as standalone functions
2. **Constructor Injection → Parameters**: Pass dependencies as function params
3. **Private Methods → Closures**: Use closure scope instead of private
4. **Mutable State → Immutable**: Return new state instead of mutating
5. **Interfaces → Type Aliases**: Use type unions and function signatures

## Benefits

This approach provides:

- **Predictability**: Pure functions are easier to reason about
- **Testability**: No setup/teardown, just input/output testing
- **Composability**: Functions compose naturally
- **Type Safety**: TypeScript works better with functional patterns
- **Performance**: No class instantiation overhead
- **Immutability**: Prevents bugs from shared mutable state

## Enforcement

- **ESLint Rules**: Configure to prevent class declarations
- **Code Reviews**: Must verify compliance before merge
- **Documentation**: All new patterns must follow these guidelines
- **Refactoring**: Gradually convert existing OOP code to functional
