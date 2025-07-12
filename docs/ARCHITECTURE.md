# Grundstein Architecture

## Overview

Grundstein is a **sophisticated mortgage portfolio management solution** built with **Domain-Driven Design** and **functional programming** principles. Despite having a simple UI, it features enterprise-level domain modeling with comprehensive type safety and financial calculation capabilities.

## Architecture Pattern: Clean Architecture + DDD

The application follows Clean Architecture with Domain-Driven Design, ensuring business logic independence from UI and infrastructure concerns.

```mermaid
graph TB
    subgraph "🎨 Presentation Layer"
        UI[Vue Components]
        Views[App Views]
        Composables[Composables]
        Adapters[UI Adapters]
    end

    subgraph "🚀 Application Layer"
        AppServices[Application Services]
        UseCases[Use Cases]
    end

    subgraph "🏗️ Domain Layer"
        Entities[Domain Entities]
        ValueObjects[Value Objects]
        DomainServices[Domain Services]
        Calculations[Pure Calculations]
    end

    subgraph "🔧 Infrastructure Layer"
        Persistence[Data Persistence]
        External[External Services]
    end

    UI --> Adapters
    Views --> Composables
    Composables --> AppServices
    Adapters --> AppServices
    AppServices --> DomainServices
    AppServices --> Calculations
    DomainServices --> ValueObjects
    DomainServices --> Entities
    Calculations --> ValueObjects
    AppServices --> Persistence

    style Domain fill:#e1f5fe
    style Application fill:#f3e5f5
    style Presentation fill:#e8f5e8
    style Infrastructure fill:#fff3e0
```

## Detailed System Architecture

```mermaid
graph LR
    subgraph "Frontend Application"
        subgraph "🎨 Presentation"
            V1[CashFlowDashboard.view.vue]
            V2[CreateMortgage.view.vue]
            C1[useMortgage.ts]
            C2[useLayout.ts]
            A1[MortgageAdapter.ts]
        end

        subgraph "🚀 Application"
            MS[MortgageService.ts]
            PAS[PortfolioApplicationService.ts]
        end

        subgraph "🏗️ Domain Core"
            subgraph "Value Objects"
                VO1[Money]
                VO2[Percentage]
                VO3[LoanAmount]
                VO4[InterestRate]
                VO5[MonthCount]
            end

            subgraph "Domain Types"
                DT1[LoanConfiguration]
                DT2[MonthlyPayment]
                DT3[SondertilgungPlan]
                DT4[FixedRatePeriod]
            end

            subgraph "Calculations"
                CALC1[LoanCalculations]
                CALC2[SondertilgungCalculations]
                CALC3[AmortizationEngine]
            end
        end

        subgraph "🔧 Infrastructure"
            REPO[PortfolioRepository]
            LOCAL[LocalStorage]
        end
    end

    V1 --> C1
    V2 --> C1
    C1 --> A1
    A1 --> MS
    MS --> CALC1
    MS --> CALC2
    MS --> CALC3
    CALC1 --> VO1
    CALC1 --> VO2
    CALC1 --> VO3
    CALC2 --> DT1
    CALC2 --> DT3
    CALC3 --> DT2
    MS --> REPO
    REPO --> LOCAL

    style VO1 fill:#e3f2fd
    style VO2 fill:#e3f2fd
    style VO3 fill:#e3f2fd
    style VO4 fill:#e3f2fd
    style VO5 fill:#e3f2fd
```

## Domain Model Deep Dive

```mermaid
classDiagram
    class Money {
        +value: Decimal
        +createMoney(euros)
        +addMoney(other)
        +subtractMoney(other)
        +formatMoney()
    }

    class Percentage {
        +value: number
        +createPercentage(value)
        +toDecimal()
        +addPercentage(other)
    }

    class LoanAmount {
        +amount: Money
        +createLoanAmount(euros)
        +toMoney()
        +formatLoanAmount()
    }

    class InterestRate {
        +rate: Percentage
        +createInterestRate(percent)
        +toMonthlyRate()
        +addBasisPoints(bp)
    }

    class LoanConfiguration {
        +amount: LoanAmount
        +annualRate: InterestRate
        +termInMonths: MonthCount
        +monthlyPayment: Money
        +createLoanConfiguration()
        +validate()
    }

    class MonthlyPayment {
        +principal: Money
        +interest: Money
        +total: Money
        +createMonthlyPayment()
        +getPrincipalPercentage()
    }

    class SondertilgungPlan {
        +yearlyLimit: SondertilgungLimit
        +payments: ExtraPayment[]
        +canAddPayment()
        +getTotalExtraPayments()
    }

    LoanAmount --> Money
    InterestRate --> Percentage
    LoanConfiguration --> LoanAmount
    LoanConfiguration --> InterestRate
    MonthlyPayment --> Money
    SondertilgungPlan --> MonthlyPayment
```

## Functional Programming Flow

```mermaid
flowchart TD
    subgraph "Pure Functions"
        INPUT[User Input] --> VALIDATE[Domain Validation]
        VALIDATE --> CREATE[Create Value Objects]
        CREATE --> CALC[Pure Calculations]
        CALC --> RESULT[Calculation Results]
        RESULT --> FORMAT[Format for UI]
    end

    subgraph "Error Handling"
        VALIDATE --> |Invalid| ERROR1[ValidationError]
        CALC --> |Failed| ERROR2[CalculationError]
        ERROR1 --> USERERROR[User-Friendly Error]
        ERROR2 --> USERERROR
    end

    subgraph "No Side Effects"
        CALC -.-> |No State Mutation| CALC
        CREATE -.-> |Immutable Objects| CREATE
        VALIDATE -.-> |Pure Validation| VALIDATE
    end

    style INPUT fill:#e8f5e8
    style RESULT fill:#e8f5e8
    style ERROR1 fill:#ffebee
    style ERROR2 fill:#ffebee
```

## File Structure

```
src/
├── 🎨 App.vue                     # Root Vue component
├── 🎨 app/                        # Application Layer
│   ├── adapters/                  # UI to Domain adapters
│   │   └── MortgageAdapter.ts     # Convert UI inputs to domain types
│   ├── composables/               # Vue composition functions
│   │   ├── useMortgage.ts         # Mortgage calculation composable
│   │   └── useLayout.ts           # Layout utilities
│   ├── services/application/      # Application services
│   │   └── services/
│   │       └── MortgageService.ts # Orchestrates domain operations
│   └── views/                     # Vue page components
│       ├── CashFlowDashboard.view.vue
│       └── CreateMortgage.view.vue
├── 🏗️ core/                       # Domain + Infrastructure
│   ├── domain/                    # Domain Layer (Pure Business Logic)
│   │   ├── calculations/          # Pure calculation functions
│   │   │   ├── LoanCalculations.ts
│   │   │   ├── SondertilgungCalculations.ts
│   │   │   └── AmortizationEngine.ts
│   │   ├── primitives/            # Brand utility and base types
│   │   │   ├── Brand.ts
│   │   │   └── GermanSondertilgungRules.ts
│   │   ├── types/                 # Domain aggregate types
│   │   │   ├── LoanConfiguration.ts
│   │   │   ├── MonthlyPayment.ts
│   │   │   ├── SondertilgungPlan.ts
│   │   │   └── FixedRatePeriod.ts
│   │   └── value-objects/         # Branded value objects
│   │       ├── Money.ts
│   │       ├── Percentage.ts
│   │       ├── LoanAmount.ts
│   │       ├── InterestRate.ts
│   │       └── MonthCount.ts
│   └── infrastructure/            # Infrastructure Layer
├── 🔧 router/                     # Vue Router configuration
├── 🔧 stores/                     # Pinia state management
├── 🔧 services/                   # External services
└── 🔧 utils/                      # Utilities (logging, performance)
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant V as Vue Component
    participant C as Composable
    participant A as Adapter
    participant S as App Service
    participant D as Domain Calculations
    participant VO as Value Objects

    U->>V: Enter loan parameters
    V->>C: useMortgage.analyzeLoan()
    C->>A: MortgageAdapter.transformInputs()
    A->>VO: Create domain types
    VO-->>A: Validated value objects
    A->>S: MortgageService.analyzeLoan()
    S->>D: LoanCalculations.calculateMonthlyPayment()
    D->>VO: Perform calculations
    VO-->>D: Results
    D-->>S: Calculation results
    S-->>C: Analysis results
    C-->>V: Formatted data
    V-->>U: Display results
```

## Key Architectural Principles

### 1. **Domain-Driven Design**

- Business logic isolated in domain layer
- Rich domain model with value objects
- Ubiquitous language throughout codebase

### 2. **Functional Programming**

- Pure functions for all calculations
- Immutable data structures
- No classes in business logic
- Result/Option types for error handling

### 3. **Type Safety**

- Branded types prevent primitive obsession
- Business rules encoded at type level
- Comprehensive validation with proper error types

### 4. **Clean Architecture**

- Dependency inversion (domain ← application ← UI)
- Business logic independent of frameworks
- Infrastructure concerns separated

### 5. **German Market Focus**

- Sondertilgung (extra payment) rules
- BaFin compliance considerations
- German banking terminology and calculations

## Testing Strategy

```mermaid
pyramid
    title Testing Strategy
    ["E2E Tests" : 5] : "Browser tests for user journeys"
    ["Integration Tests" : 15] : "Service layer integration"
    ["Unit Tests (400+)" : 80] : "Domain logic validation"
```

- **400+ Unit Tests** - All domain types and calculations
- **Property-Based Testing** - Mathematical invariants with fast-check
- **Real-World Validation** - German mortgage scenarios
- **Type Safety** - Compile-time error prevention

## Technology Stack

| Layer            | Technologies                                |
| ---------------- | ------------------------------------------- |
| **Frontend**     | Vue 3, TypeScript, Composition API          |
| **Build**        | Vite, Rolldown (cutting-edge bundler)       |
| **Testing**      | Vitest, Property-based testing (fast-check) |
| **Quality**      | Oxlint, TypeScript strict mode, Git hooks   |
| **Calculations** | Decimal.js for financial precision          |
| **State**        | Pinia, Local component state                |

## Performance Characteristics

- **Fast Tests**: 400+ tests run in ~3 seconds
- **Type Safety**: Compile-time error prevention
- **Mathematical Precision**: Decimal.js prevents floating-point errors
- **Memory Efficient**: Immutable data with minimal overhead
- **Bundle Size**: Optimized with Rolldown bundler

## Future Extension Points

The architecture supports future expansion:

1. **Multi-Market Support** - Architecture ready for other countries
2. **Complex Portfolio Management** - Domain model can handle multiple properties
3. **Advanced Analytics** - Pure calculation functions enable easy feature addition
4. **External Integrations** - Clean infrastructure layer for APIs
5. **Real-Time Updates** - Reactive architecture supports live data

---

_This architecture balances sophisticated domain modeling with practical implementation, ensuring both business logic correctness and development productivity._
