# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (runs type-check + build-only)
- `npm run preview` - Preview production build

### Testing

- `npm test` - Run unit tests with Vitest
- `npm run test:unit` - Run unit tests in jsdom environment
- `npm run coverage` - Generate test coverage report

### Code Quality

- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Single Test Execution

- `vitest src/domain/types/Money.test.ts` - Run specific test file
- `vitest --run src/tests/unit/domain/` - Run tests in specific directory

## Project Overview

This is a **Single Mortgage Calculator** focused on the **German market (DE)** built with **Domain-Driven Design** and **functional programming** principles. It's a sophisticated financial calculation engine that helps users understand mortgage payments, amortization schedules, and the impact of extra payments (Sondertilgung).

## Architecture Overview

### Clean Architecture Layers (3-Layer)

```
src/
├── core/domain/         # Domain Layer - Pure Business Logic
│   ├── value-objects/   # Branded types (Money, Percentage, etc.)
│   ├── types/           # Complex domain types (LoanConfiguration, etc.)
│   ├── calculations/    # Pure calculation functions
│   └── primitives/      # Base types and utilities
├── app/                 # Application & Presentation Layers
│   ├── services/        # Application services
│   ├── adapters/        # UI to domain adapters
│   ├── composables/     # Vue composition functions
│   └── views/           # Page components (2 views)
└── stores/              # UI state management (demo data only)
```

### Domain Layer (`src/core/domain/`)

- **Value Objects**: Branded types (Money, Percentage, LoanAmount, InterestRate) preventing primitive obsession
- **Domain Types**: Complex types like LoanConfiguration, MonthlyPayment, SondertilgungPlan
- **Pure Functions**: Loan calculations, amortization schedules, payment calculations
- **Result Types**: Functional error handling without exceptions
- **German Market Rules**: Sondertilgung limits and banking regulations

### Application Layer (`src/app/services/`)

- **MortgageService**: Orchestrates domain calculations for UI consumption
- **Service Adapters**: Transform between UI inputs and domain types

### Presentation Layer (`src/app/`)

- **Views**: CashFlowDashboard (landing page) and CreateMortgage (calculator)
- **Composables**: useMortgage for calculator logic, useLayout for UI state
- **Adapters**: MortgageAdapter transforms UI data to domain types

## Key Features

### Single Mortgage Calculator

- **German Market Focus**: DE-specific validation and calculations
- **Sondertilgung Analysis**: Extra payment scenarios with percentage limits (5%, 10%, 20%, 50%, unlimited)
- **Amortization Schedules**: Detailed payment breakdowns over time
- **Parameter Locking**: Lock any loan parameter and recalculate others

### Financial Calculations

- **Monthly Payment Calculation**: Precise payment amounts using financial formulas
- **Interest Rate Sensitivity**: What-if analysis for rate changes
- **Total Interest Analysis**: See total cost over loan lifetime
- **Break-even Calculations**: When extra payments save money

### Technical Excellence

- **Type Safety**: Branded types make illegal states unrepresentable
- **Business Rules**: Encoded at type level with comprehensive validation
- **Domain Tests**: Property-based testing for mathematical correctness
- **Functional Error Handling**: Result types throughout

## Router Structure

- `/` - Landing page with welcome message
- `/create` - Mortgage calculator page

## Domain Types Usage

Always use domain types for financial calculations:

```typescript
// ✅ Correct - Using domain types
const amount = createLoanAmount(300000); // €300k
const rate = createInterestRate(3.5); // 3.5%
const payment = calculateMonthlyPayment(loanConfig);

// ❌ Wrong - Using primitives
const amount = 300000; // No validation, no business rules
const rate = 3.5; // Could be invalid rate
```

## Key Files for Understanding

- `src/core/domain/index.ts` - Domain layer public API
- `src/core/domain/calculations/` - Pure calculation functions
- `src/app/services/application/services/MortgageService.ts` - Application service
- `src/app/adapters/MortgageAdapter.ts` - UI to domain adapter
- `TODO.md` - Project roadmap and progress tracking

## Testing Strategy

- **Unit Tests**: Domain types and calculation functions
- **Property-Based Testing**: Mathematical invariants with fast-check
- **Real-World Validation**: German market scenarios with real banking rules
- **No Integration Tests Needed**: Pure calculator with no external dependencies

## Technology Stack

- **Vue 3** with TypeScript and Composition API
- **Vite** for fast development and building
- **Vitest** for unit testing with jsdom
- **Tailwind CSS** for styling
- **Chart.js/vue-chartjs** for data visualization
- **Decimal.js** for precise financial calculations

## Development Guidelines

- All business logic must reside in the domain layer
- Use application services as orchestration layer for UI
- No data persistence - this is a stateless calculator
- Financial calculations must use domain types, never primitives
- Always use Result types for error handling
- Pure functions only - no side effects in domain layer

## Programming Paradigm Rules

### ✅ REQUIRED: Functional Programming & Composition API Only

- **NO CLASSES**: All business logic must be pure functions
- **NO OOP PATTERNS**: No interfaces, inheritance, or object-oriented design
- **IMMUTABLE DATA**: Use immutable operations, return new state
- **PURE FUNCTIONS**: Functions should have no side effects
- **VUE COMPOSITION API**: All components must use `<script setup>`
- **FUNCTIONAL SERVICES**: Export functions directly, not class instances

### Examples:

#### ✅ Good - Functional Style

```typescript
// Pure functions
export function calculatePayment(amount: number, rate: number): number {
  return amount * rate;
}

// Factory functions for repositories
export const createRepository = () => {
  let data: T[] = [];
  return {
    save: (item: T) => {
      data = [...data, item];
    },
    findAll: () => [...data],
  };
};
```

#### ❌ Bad - OOP Style

```typescript
// No classes
class Service {
  constructor(private dep: Dependency) {}
  method() {
    /* ... */
  }
}

// No interfaces
interface IRepository {
  save(item: T): void;
}
```

For detailed standards, see: `/docs/CODING_STANDARDS.md`

## CRITICAL: NEVER BYPASS QUALITY CHECKS

### ❌ NEVER USE THESE FLAGS:

- `--no-verify` - NEVER bypass git hooks
- `--force` / `-f` - NEVER force push
- `--skip-checks` - NEVER skip any checks
- `npm test -- --no-coverage` - NEVER skip coverage
- `git commit -n` - NEVER skip commit hooks

### WHY THIS MATTERS:

1. **Git hooks exist for a reason** - They catch errors before they reach CI/CD
2. **Type checking prevents runtime errors** - Financial software needs to be reliable
3. **Tests ensure code works** - Skipping them is lying to yourself
4. **Linting maintains quality** - Consistent code is maintainable code

### THE RIGHT APPROACH:

- Fix the errors, don't bypass them
- If type-check fails, fix the types
- If tests fail, fix the code
- If lint fails, fix the style
- Take the time to do it right

**Remember**: Every `--no-verify` is technical debt you're adding to the project. The PR will fail anyway, so you're just wasting time.

## CRITICAL LESSONS LEARNED - AVOID THESE MISTAKES

### 🚨 ALWAYS Analyze Before Acting

1. **Understand the Architecture First**
   - Study the existing file structure and import patterns
   - Identify the architectural patterns (Domain-Driven Design, functional programming)
   - Map out dependencies before making changes
   - Check how types flow through the system

2. **Respect the Result Type Pattern**

   ```typescript
   // ❌ WRONG - Never access .data without checking .success
   const value = result.data!;

   // ✅ CORRECT - Always check success first
   if (result.success) {
     const value = result.data;
   } else {
     // Handle error case
   }
   ```

3. **Import Path Changes Must Be Systematic**
   - When moving files, update ALL import paths
   - Use search/replace across the entire codebase
   - Verify imports resolve correctly before proceeding

4. **Service Pattern Changes**
   - When converting from classes to functions, update ALL usages
   - Don't just change the export, change how it's consumed
   - Example: `new MortgageService()` → `MortgageService.method()` or `useMortgageAdapter()`

5. **Vue Template Comments**

   ```vue
   <!-- ✅ CORRECT - Use HTML comments in templates -->
   {{ value }}
   <!-- TODO: fix this -->

   <!-- ❌ WRONG - Don't use JS-style comments in templates -->
   {{ value }} {{/* TODO: fix this */}}
   ```

### 🔍 Before Making Large Changes

1. **Run type-check first** to establish baseline
2. **Create a migration plan** with specific steps
3. **Test incrementally** - don't make 50 changes at once
4. **Verify each step** before proceeding to the next

### 📝 Type System Gotchas

1. **Branded Types**: This codebase uses branded types extensively
   - `LoanAmount`, `Money`, `Percentage` are not just numbers
   - Always use factory functions: `createLoanAmount()`, `createMoney()`
   - Never cast or bypass the type system

2. **Domain Types in UI**: When bridging domain and UI:
   - Transform domain types to UI-friendly formats
   - Don't expose domain complexity to components
   - Create adapter layers when needed

### 🛠️ When Integrating New Tools (like Rolldown)

1. **Read the official documentation first**
2. **Check for existing examples** in the ecosystem
3. **Start with minimal changes** - get it working first
4. **Fix breaking changes** before adding features

### ⚠️ Common Pitfalls in This Codebase

1. **Missing exports from domain/index.ts** - Always verify exports
2. **Test files using .data!** - Tests often bypass type safety
3. **Configuration object access** - `mortgage.configuration.amount` not `mortgage.amount`
4. **No data persistence** - This is a stateless calculator, don't add storage

### 🎯 The Right Approach

When asked to make changes:

1. **Analyze** the current state thoroughly
2. **Plan** the changes with consideration for ripple effects
3. **Execute** systematically with verification at each step
4. **Test** both build and type-check after changes
5. **Document** any workarounds or TODOs created

Remember: It's better to take time understanding the system than to rush and create cascading errors that take hours to fix.

## Feature Backlog Tracking

- **Feature Backlog**: Added tracking for `FEATURE_BACKLOG.md` to maintain a systematic record of upcoming features and enhancements
