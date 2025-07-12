# Domain Model Dependency Graph

## Overview

This document provides a comprehensive dependency graph of the mortgage portfolio management domain model, following Domain-Driven Design principles from "Domain Modeling Made Functional" by Scott Wlaschin.

**Last Updated:** 2025-07-12 - Dependency graph updated to reflect current domain architecture.

## Architecture Layers

The domain follows a clean architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Entities & Aggregates                                      │
│  ├─ MortgagePortfolio (Aggregate Root)                      │
│  └─ MortgageEntry (Entity)                                  │
├─────────────────────────────────────────────────────────────┤
│  Domain Services                                            │
│  ├─ PortfolioService                                        │
│  ├─ LoanCalculations                                        │
│  ├─ AmortizationEngine                                      │
│  └─ SondertilgungCalculations                               │
├─────────────────────────────────────────────────────────────┤
│  Value Objects & Types                                      │
│  ├─ Primitive Types (Money, Percentage, etc.)               │
│  ├─ Loan-Specific Types (LoanAmount, InterestRate, etc.)    │
│  └─ Composite Types (LoanConfiguration, ExtraPayment, etc.) │
├─────────────────────────────────────────────────────────────┤
│  Foundation Types                                           │
│  ├─ Brand (Branded types system)                            │
│  ├─ Result (Functional error handling)                      │
│  └─ Option (Nullable values)                                │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Graph

### 1. Foundation Layer

**Brand.ts** (Core Foundation)

```
Brand
├─ Branded<T, B> (type)
├─ Result<T, E> (functional error handling)
├─ Option<T> (nullable values)
└─ Helper functions for Result/Option
```

**Dependencies:** None (pure foundation)
**Dependents:** All other domain types

### 2. Primitive Value Objects

**Money.ts**

```
Money (Branded<number, "Money">)
├─ createMoney(euros) → Result<Money, MoneyValidationError>
├─ toEuros(money) → number
├─ addMoney(a, b) → Result<Money, MoneyValidationError>
├─ subtractMoney(a, b) → Result<Money, MoneyValidationError>
├─ multiplyMoney(money, factor) → Result<Money, MoneyValidationError>
└─ formatMoney(money) → string
```

**Dependencies:** Brand
**Dependents:** LoanAmount, MonthlyPayment, ExtraPayment, PortfolioService, LoanCalculations, AmortizationEngine

**Percentage.ts**

```
Percentage (Branded<number, "Percentage">)
├─ createPercentage(value) → Result<Percentage, PercentageValidationError>
├─ toDecimal(percentage) → number
├─ addPercentage(a, b) → Result<Percentage, PercentageValidationError>
└─ formatPercentage(percentage) → string
```

**Dependencies:** Brand
**Dependents:** InterestRate, AmortizationEngine

**PositiveInteger.ts / PositiveDecimal.ts**

```
PositiveInteger (Branded<number, "PositiveInteger">)
PositiveDecimal (Branded<number, "PositiveDecimal">)
```

**Dependencies:** Brand
**Dependents:** MonthCount, YearCount, PaymentMonth

### 3. Domain-Specific Value Objects

**LoanAmount.ts**

```
LoanAmount (Branded<Money, "LoanAmount">)
├─ createLoanAmount(amount) → Result<LoanAmount, LoanAmountValidationError>
├─ toMoney(loanAmount) → Money
├─ toNumber(loanAmount) → number
├─ formatLoanAmount(loanAmount) → string
├─ getMinimumLoanAmount() → LoanAmount
└─ getMaximumLoanAmount() → LoanAmount
```

**Dependencies:** Brand, Money
**Dependents:** LoanConfiguration, LoanCalculations, AmortizationEngine

**InterestRate.ts**

```
InterestRate (Branded<Percentage, "InterestRate">)
├─ createInterestRate(rate) → Result<InterestRate, InterestRateValidationError>
├─ toPercentage(interestRate) → Percentage
├─ toDecimal(interestRate) → number
├─ toMonthlyRate(annualRate) → number
├─ fromMonthlyRate(monthlyDecimal) → Result<InterestRate, InterestRateValidationError>
├─ addBasisPoints(interestRate, basisPoints) → Result<InterestRate, InterestRateValidationError>
└─ Constants: TYPICAL_LOW_RATE, TYPICAL_CURRENT_RATE, TYPICAL_HIGH_RATE, STRESS_TEST_RATE
```

**Dependencies:** Brand, Percentage
**Dependents:** LoanConfiguration, LoanCalculations, AmortizationEngine

**MonthCount.ts / YearCount.ts**

```
MonthCount (Branded<PositiveInteger, "MonthCount">)
YearCount (Branded<PositiveInteger, "YearCount">)
├─ createMonthCount(months) → Result<MonthCount, MonthCountValidationError>
├─ createYearCount(years) → Result<YearCount, YearCountValidationError>
├─ toMonths(yearCount) → number (YearCount to months conversion)
└─ formatMonthCount(monthCount) → string
```

**Dependencies:** Brand, PositiveInteger
**Dependents:** LoanConfiguration, PaymentMonth, ExtraPayment, AmortizationEngine

**PaymentMonth.ts**

```
PaymentMonth (Branded<PositiveInteger, "PaymentMonth">)
├─ createPaymentMonth(month) → Result<PaymentMonth, PaymentMonthValidationError>
├─ toNumber(paymentMonth) → number
└─ formatPaymentMonth(paymentMonth) → string
```

**Dependencies:** Brand, PositiveInteger
**Dependents:** ExtraPayment, AmortizationEngine

### 4. Composite Value Objects

**MonthlyPayment.ts**

```
MonthlyPayment
├─ principal: Money
├─ interest: Money
├─ total: Money
├─ createMonthlyPayment(principal, interest) → Result<MonthlyPayment, MonthlyPaymentValidationError>
└─ formatMonthlyPayment(payment) → string
```

**Dependencies:** Money
**Dependents:** LoanCalculations, AmortizationEngine

**ExtraPayment.ts**

```
ExtraPayment
├─ month: PaymentMonth
├─ amount: Money
├─ createExtraPayment(month, amount) → Result<ExtraPayment, ExtraPaymentValidationError>
├─ combineExtraPayments(payment1, payment2) → Result<ExtraPayment, ExtraPaymentValidationError>
├─ calculateTotalExtraPayments(extraPayments[]) → Result<Money, ExtraPaymentValidationError>
└─ groupExtraPaymentsByMonth(extraPayments[]) → Result<ExtraPayment[], ExtraPaymentValidationError>
```

**Dependencies:** Money, PaymentMonth
**Dependents:** SondertilgungPlan, AmortizationEngine

**SondertilgungPlan.ts**

```
SondertilgungPlan (Union Type)
├─ PercentageSondertilgung: { type: "percentage", percentage: Percentage, frequency: "yearly" | "monthly" }
├─ FixedAmountSondertilgung: { type: "fixed", extraPayments: ExtraPayment[] }
└─ Functions for creating and validating plans
```

**Dependencies:** Percentage, ExtraPayment
**Dependents:** AmortizationEngine

**LoanConfiguration.ts**

```
LoanConfiguration
├─ amount: LoanAmount
├─ annualRate: InterestRate
├─ termInMonths: MonthCount
├─ monthlyPayment: Money
├─ createLoanConfiguration(...) → Result<LoanConfiguration, LoanConfigurationValidationError>
├─ createLoanConfigurationFromInput(input) → Result<LoanConfiguration, LoanConfigurationValidationError>
├─ validateParameterConsistency(...) → boolean
├─ getLoanParameters(config) → object
└─ LOAN_PRESETS: common configurations
```

**Dependencies:** Brand, Money, LoanAmount, InterestRate, MonthCount, YearCount
**Dependents:** MortgageEntry, LoanCalculations, AmortizationEngine, PortfolioService

### 5. Entities & Aggregates

**MortgagePortfolio.ts** (Aggregate Root)

```
MortgageEntry
├─ id: string
├─ name: string
├─ configuration: LoanConfiguration
├─ market: "DE" | "CH"
├─ bank: string
├─ startDate: Date
├─ notes?: string
└─ isActive: boolean

MortgagePortfolio (Aggregate Root)
├─ id: PortfolioId
├─ name: string
├─ owner: string
├─ mortgages: readonly MortgageEntry[]
├─ createdAt: Date
├─ updatedAt: Date
├─ createMortgagePortfolio(id, name, owner) → Result<MortgagePortfolio, PortfolioValidationError>
├─ addMortgageToPortfolio(portfolio, mortgage) → Result<MortgagePortfolio, PortfolioValidationError>
├─ removeMortgageFromPortfolio(portfolio, mortgageId) → Result<MortgagePortfolio, PortfolioValidationError>
└─ updateMortgageInPortfolio(portfolio, mortgageId, updates) → Result<MortgagePortfolio, PortfolioValidationError>

PortfolioSummary
├─ totalPrincipal: Money
├─ totalMonthlyPayment: Money
├─ averageInterestRate: number
├─ activeMortgages: number
├─ totalMortgages: number
└─ marketDistribution: { german: number, swiss: number }
```

**Dependencies:** Brand, LoanConfiguration, Money
**Dependents:** PortfolioService

### 6. Domain Services

**LoanCalculations.ts** (Pure Functions)

```
Core Calculation Functions
├─ calculateMonthlyPayment(loanConfiguration) → Result<MonthlyPayment, LoanCalculationError>
├─ calculateLoanTerm(loanAmount, annualRate, monthlyPayment) → Result<MonthCount, LoanCalculationError>
├─ calculateInterestRate(loanAmount, monthlyPayment, termInMonths) → Result<InterestRate, LoanCalculationError>
├─ calculateTotalInterest(loanConfiguration) → Result<Money, LoanCalculationError>
├─ calculateRemainingBalance(loanConfiguration, paymentsMade) → Result<Money, LoanCalculationError>
├─ calculateBreakEvenPoint(currentLoan, newLoan, refinancingCosts) → Result<MonthCount, LoanCalculationError>
└─ calculatePaymentScenarios(baseLoan, scenarios[]) → Result<MonthlyPayment[], LoanCalculationError>
```

**Dependencies:** Brand, LoanConfiguration, MonthlyPayment, Money, LoanAmount, InterestRate, MonthCount, YearCount
**Dependents:** AmortizationEngine, Application Layer

**AmortizationEngine.ts** (Complex Orchestration)

```
AmortizationEntry
├─ monthNumber: PaymentMonth
├─ startingBalance: Money
├─ regularPayment: MonthlyPayment
├─ extraPayment?: ExtraPayment
├─ totalPaymentAmount: Money
├─ endingBalance: Money
├─ cumulativeInterest: Money
├─ cumulativePrincipal: Money
├─ principalPercentage: Percentage
└─ remainingMonths: MonthCount

AmortizationSchedule
├─ loanConfiguration: LoanConfiguration
├─ sondertilgungPlan?: SondertilgungPlan
├─ entries: AmortizationEntry[]
└─ metrics: ScheduleMetrics

ScheduleMetrics
├─ totalInterestPaid: Money
├─ totalPrincipalPaid: Money
├─ totalExtraPayments: Money
├─ totalPayments: Money
├─ actualTermMonths: MonthCount
├─ interestSavedVsOriginal: Money
├─ termReductionMonths: MonthCount
├─ effectiveInterestRate: Percentage
├─ averageMonthlyPayment: Money
├─ largestMonthlyPayment: Money
├─ smallestMonthlyPayment: Money
└─ payoffDate: { year: number, month: number }

Functions
├─ generateAmortizationSchedule(loanConfiguration, sondertilgungPlan?) → Result<AmortizationSchedule, AmortizationError>
├─ calculateScheduleMetrics(loanConfiguration, entries[], sondertilgungPlan?) → Result<ScheduleMetrics, AmortizationError>
├─ applyExtraPayments(baseSchedule, sondertilgungPlan) → Result<AmortizationSchedule, AmortizationError>
├─ compareSchedules(baseSchedule, comparisonSchedule) → Result<ScheduleComparison, AmortizationError>
├─ getScheduleEntry(schedule, month) → AmortizationEntry | undefined
└─ getRemainingBalance(schedule, month) → Result<Money, AmortizationError>
```

**Dependencies:** Brand, LoanConfiguration, SondertilgungPlan, PaymentMonth, MonthlyPayment, ExtraPayment, Money, MonthCount, Percentage, LoanAmount, InterestRate, LoanCalculations
**Dependents:** Application Layer

**PortfolioService.ts** (Business Logic)

```
Portfolio Analysis Functions
├─ calculatePortfolioSummary(portfolio) → Result<PortfolioSummary, PortfolioValidationError>
├─ analyzePortfolioOptimization(portfolio) → { refinancingOpportunities[], consolidationOpportunities[], riskAnalysis }
└─ calculatePortfolioCashFlow(portfolio, months) → { monthlyPayments[], cumulativeInterest[], remainingBalance[] }
```

**Dependencies:** Brand, Money, MortgagePortfolio, PortfolioSummary, MortgageEntry, PortfolioValidationError, LoanConfiguration
**Dependents:** Application Layer

## Key Design Principles Applied

### 1. **Making Illegal States Unrepresentable**

- Branded types prevent mixing different numeric concepts
- Smart constructors ensure validation at creation time
- Result types handle errors functionally without exceptions

### 2. **Functional Error Handling**

- Result<T, E> type throughout the domain
- No exceptions thrown from domain logic
- Compose-able error handling with map/flatMap

### 3. **Domain-Driven Design**

- Clear aggregate boundaries (MortgagePortfolio)
- Rich value objects with business rules
- Domain services for complex business logic
- Ubiquitous language throughout

### 4. **Functional Programming**

- Pure functions in calculation modules
- Immutable data structures
- Function composition
- No side effects in domain logic

### 5. **Type Safety**

- Branded types prevent primitive obsession
- Comprehensive type definitions
- Business rules encoded at type level

## Data Flow Patterns

### Typical Calculation Flow:

```
Input Values
  ↓ (validation)
Value Objects (Money, InterestRate, etc.)
  ↓ (composition)
Composite Types (LoanConfiguration)
  ↓ (business logic)
Domain Services (LoanCalculations, AmortizationEngine)
  ↓ (orchestration)
Domain Entities (MortgagePortfolio)
  ↓ (analysis)
Portfolio Services (PortfolioService)
```

### Error Handling Flow:

```
Input → Validation → Result<Success, Error> → Match/Handle → UI Response
```

This architecture ensures that all business rules are captured in the domain layer, making the code both type-safe and business-rule compliant.
