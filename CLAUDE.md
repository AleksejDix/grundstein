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
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run coverage` - Generate test coverage report

### Code Quality

- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Single Test Execution

- `vitest src/domain/types/Money.test.ts` - Run specific test file
- `vitest --run src/tests/unit/domain/` - Run tests in specific directory

## Project Overview

This is a **Mortgage Portfolio Management Solution** primarily focused on the **German market (DE)** built with **Domain-Driven Design** and **functional programming** principles. The architecture supports multiple markets for future expansion. The codebase follows a clean architecture with comprehensive type safety and professional portfolio management capabilities.

## Architecture Overview

### Clean Architecture Layers

```
src/
├── domain/              # Domain Layer - Business Logic
│   ├── types/           # Value Objects (Money, Percentage, etc.)
│   ├── entities/        # Domain Entities (MortgagePortfolio)
│   ├── services/        # Domain Services (PortfolioService)
│   └── calculations/    # Pure Calculation Functions
├── application/         # Application Layer - Use Cases
│   └── services/        # Application Services
├── infrastructure/     # Infrastructure Layer - External Concerns
│   └── persistence/     # Data Storage (Repository Pattern)
├── presentation/       # Presentation Layer - UI Components
│   └── components/      # Organized by Feature (ui/, portfolio/, mortgage/)
└── views/              # Page Components
```

### Domain Layer (`src/domain/`)

- **Value Objects**: Branded types (Money, Percentage, LoanAmount, InterestRate) preventing primitive obsession
- **Entities**: MortgagePortfolio aggregate with business rules
- **Domain Services**: Portfolio analysis, optimization, cash flow calculations
- **Pure Functions**: Loan calculations, amortization, Sondertilgung analysis
- **Result/Option Types**: Functional error handling without exceptions

### Application Layer (`src/application/`)

- **MortgageService**: Individual loan analysis and calculations
- **PortfolioApplicationService**: Portfolio management orchestration
- **Service Types**: UI-compatible data structures for views

### Infrastructure Layer (`src/infrastructure/`)

- **PortfolioRepository**: Data persistence abstraction (LocalStorage implementation)
- **Repository Pattern**: Clean separation of storage concerns

### Presentation Layer (`src/presentation/`)

- **UI Components**: Reusable editable components (EditableAmount, EditableNumber)
- **Portfolio Components**: Charts and visualizations for portfolio analysis
- **Mortgage Components**: Input forms and payment schedules

## Key Features

### Portfolio Management

- **Multi-Mortgage Portfolios**: Manage multiple loans in organized portfolios
- **German Market Focus**: DE-specific validation and calculations with extensible architecture
- **Portfolio Analytics**: Summary statistics, optimization analysis, cash flow projections
- **Portfolio Optimization**: Refinancing opportunities, consolidation analysis

### Mortgage Analysis

- **Sondertilgung**: Extra payments with percentage limits (5%, 10%, 20%, 50%, unlimited)
- **Parameter Locking**: Lock any loan parameter and recalculate others
- **Market Compliance**: German banking regulation compliance (BaFin)
- **Advanced Calculations**: Amortization schedules, interest sensitivity analysis

### Technical Excellence

- **Type Safety**: Branded types make illegal states unrepresentable
- **Business Rules**: Encoded at type level with comprehensive validation
- **400+ Tests**: Domain validation with property-based testing
- **Functional Error Handling**: Result/Option types throughout

## Router Structure

- `/` - Dashboard (Portfolio overview)
- `/portfolio` - Portfolio management view
- `/calculator` - Mortgage calculator
- `/mortgage/:id?` - Individual mortgage details
- `/mortgage-calculator` - Advanced mortgage calculator

## Domain Types Usage

Always use domain types for financial calculations:

```typescript
// ✅ Correct - Using domain types
const amount = createLoanAmount(300000); // €300k
const rate = createInterestRate(3.5); // 3.5%
const portfolio = createMortgagePortfolio(id, name, owner);

// ❌ Wrong - Using primitives
const amount = 300000; // No validation, no business rules
const rate = 3.5; // Could be invalid rate
```

## Key Files for Understanding

- `src/domain/index.ts` - Domain layer public API
- `src/domain/entities/MortgagePortfolio.ts` - Portfolio aggregate root
- `src/domain/services/PortfolioService.ts` - Portfolio business logic
- `src/application/services/PortfolioApplicationService.ts` - Portfolio orchestration
- `src/infrastructure/persistence/PortfolioRepository.ts` - Data persistence
- `TODO.md` - Project roadmap and progress tracking

## Testing Strategy

- **Unit Tests**: Each domain type and calculation function
- **Property-Based Testing**: Mathematical invariants with fast-check
- **Integration Tests**: Service layer and repository integration
- **Real-World Validation**: German market scenarios with real banking rules

## Technology Stack

- **Vue 3** with TypeScript and Composition API
- **Vite** for fast development and building
- **Vitest** for unit testing with jsdom
- **Playwright** for E2E testing
- **Tailwind CSS** for styling
- **Chart.js/vue-chartjs** for data visualization
- **Decimal.js** for precise financial calculations

## Development Guidelines

- All business logic must reside in the domain layer
- Use application services as orchestration layer for UI
- Persist data through repository pattern
- Components should be organized by feature (ui/, portfolio/, mortgage/)
- Financial calculations must use domain types, never primitives
- Always use Result/Option types for error handling

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
   {{ value }} <!-- TODO: fix this -->
   
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
4. **Repository patterns** - Services have default repository parameters

### 🎯 The Right Approach

When asked to make changes:
1. **Analyze** the current state thoroughly
2. **Plan** the changes with consideration for ripple effects
3. **Execute** systematically with verification at each step
4. **Test** both build and type-check after changes
5. **Document** any workarounds or TODOs created

Remember: It's better to take time understanding the system than to rush and create cascading errors that take hours to fix.
