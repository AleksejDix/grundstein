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

This is a **Mortgage Portfolio Management Solution** for **Swiss and German markets** built with **Domain-Driven Design** and **functional programming** principles. The codebase follows a clean architecture with comprehensive type safety and professional portfolio management capabilities.

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
- **Swiss & German Market Support**: Market-specific validation and calculations
- **Portfolio Analytics**: Summary statistics, optimization analysis, cash flow projections
- **Portfolio Optimization**: Refinancing opportunities, consolidation analysis

### Mortgage Analysis
- **Sondertilgung**: Extra payments with percentage limits (5%, 10%, 20%, 50%, unlimited)
- **Parameter Locking**: Lock any loan parameter and recalculate others
- **Market Compliance**: Swiss and German banking regulation compliance
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
- **Real-World Validation**: Swiss and German market scenarios

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