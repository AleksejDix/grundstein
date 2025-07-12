# Domain Entities - Aggregate Roots

This layer contains **domain entities** that represent the core business objects with identity and lifecycle. These are the aggregate roots that coordinate complex business operations.

## Architecture

```
src/core/domain/entities/
└── MortgagePortfolio.ts    # Portfolio aggregate root with multiple mortgages
```

## Design Principles

### 🎯 **Domain-Driven Design (DDD)**
- **Aggregate roots** that control consistency boundaries
- **Entity identity** that persists throughout lifecycle
- **Business invariants** maintained across operations
- **Rich domain behavior** encapsulated in entities

### 🔄 **Functional Approach to Entities**
- **Immutable data structures** with readonly properties
- **Pure functions** for entity operations
- **State transitions** through factory functions
- **No classes or methods** - functional programming patterns

### 🏦 **Swiss & German Banking Domain**
- **Multi-market support** (DE/CH regulations)
- **Portfolio management** concepts
- **Bank-specific requirements** and constraints
- **Real-world business rules** from mortgage industry

## Core Entity

### `MortgagePortfolio.ts` - Portfolio Aggregate Root

The central entity representing a collection of mortgages managed as a portfolio:

```typescript
import { 
  createMortgagePortfolio,
  addMortgageToPortfolio,
  removeMortgageFromPortfolio,
  updateMortgageInPortfolio 
} from './MortgagePortfolio';

// Create a new portfolio
const portfolio = createMortgagePortfolio(
  'portfolio_123',           // PortfolioId
  'Investment Properties',   // Portfolio name
  'John Doe'                // Owner name
);

if (portfolio.success) {
  console.log(`Created portfolio: ${portfolio.data.name}`);
  console.log(`Owner: ${portfolio.data.owner}`);
  console.log(`Created: ${portfolio.data.createdAt.toISOString()}`);
}
```

### Entity Structure

#### **MortgagePortfolio Type**
```typescript
type MortgagePortfolio = {
  readonly id: PortfolioId;           // Unique identifier
  readonly name: string;              // Human-readable name
  readonly owner: string;             // Portfolio owner
  readonly mortgages: readonly MortgageEntry[];  // Contained mortgages
  readonly createdAt: Date;           // Creation timestamp
  readonly updatedAt: Date;           // Last modification
};
```

#### **MortgageEntry Type**
```typescript
type MortgageEntry = {
  readonly id: string;                     // Unique mortgage ID
  readonly name: string;                   // Mortgage name/description
  readonly configuration: LoanConfiguration;  // Complete loan setup
  readonly market: "DE" | "CH";           // German or Swiss market
  readonly bank: string;                  // Lending institution
  readonly startDate: Date;               // Loan start date
  readonly notes?: string;                // Optional notes
  readonly isActive: boolean;             // Active/inactive status
};
```

## Core Operations

### Portfolio Management

```typescript
// Add mortgage to portfolio
const withMortgage = addMortgageToPortfolio(portfolio, {
  id: 'mortgage_456',
  name: 'Primary Residence',
  configuration: loanConfig,
  market: 'DE',
  bank: 'Deutsche Bank',
  startDate: new Date('2023-01-01'),
  notes: 'Fixed rate for 10 years',
  isActive: true
});

// Update existing mortgage
const updated = updateMortgageInPortfolio(
  portfolio, 
  'mortgage_456', 
  { name: 'Updated Property Name' }
);

// Remove mortgage
const withoutMortgage = removeMortgageFromPortfolio(portfolio, 'mortgage_456');
```

### Portfolio Analysis

```typescript
import { calculatePortfolioSummary } from '../calculations/PortfolioCalculations';

// Get portfolio summary
const summary = calculatePortfolioSummary(portfolio);
if (summary.success) {
  const stats = summary.data;
  console.log(`Total principal: ${toEuros(stats.totalPrincipal)}`);
  console.log(`Monthly payment: ${toEuros(stats.totalMonthlyPayment)}`);
  console.log(`Number of loans: ${stats.mortgageCount}`);
  console.log(`Average LTV: ${toPercentage(stats.averageLTV)}`);
}
```

#### **PortfolioSummary Type**
```typescript
type PortfolioSummary = {
  readonly totalPrincipal: Money;         // Sum of all loan amounts
  readonly totalMonthlyPayment: Money;    // Sum of all monthly payments
  readonly totalInterestCost: Money;      // Lifetime interest across all loans
  readonly averageInterestRate: InterestRate;  // Weighted average rate
  readonly mortgageCount: PositiveInteger;     // Number of mortgages
  readonly averageLTV: LoanToValueRatio;       // Portfolio average LTV
  readonly totalPropertyValue: Money;          // Sum of all property values
  readonly maturityRange: {                    // Loan maturity spread
    earliest: Date;
    latest: Date;
  };
};
```

## Advanced Operations

### Multi-Market Portfolio Management

```typescript
// Create portfolio with German and Swiss mortgages
const germanMortgage = {
  id: 'de_001',
  name: 'Berlin Apartment',
  configuration: berlinLoanConfig,
  market: 'DE' as const,
  bank: 'Commerzbank',
  startDate: new Date('2023-01-01'),
  isActive: true
};

const swissMortgage = {
  id: 'ch_001', 
  name: 'Zurich Condo',
  configuration: zurichLoanConfig,
  market: 'CH' as const,
  bank: 'UBS',
  startDate: new Date('2023-06-01'),
  isActive: true
};

let portfolio = createMortgagePortfolio('multi_market', 'International Portfolio', 'Jane Smith');
portfolio = addMortgageToPortfolio(portfolio.data, germanMortgage);
portfolio = addMortgageToPortfolio(portfolio.data, swissMortgage);
```

### Portfolio Optimization Analysis

```typescript
import { 
  analyzePortfolioOptimization,
  findRefinancingOpportunities,
  calculateConsolidationBenefits 
} from '../calculations/PortfolioCalculations';

// Analyze optimization opportunities
const optimization = analyzePortfolioOptimization(portfolio);
if (optimization.success) {
  const opportunities = optimization.data;
  
  // Refinancing opportunities
  opportunities.refinancingCandidates.forEach(candidate => {
    console.log(`Mortgage ${candidate.mortgageId}: Save ${toEuros(candidate.potentialSavings)}`);
  });
  
  // Consolidation analysis
  if (opportunities.consolidationBenefit.worthwhile) {
    console.log(`Consolidation could save: ${toEuros(opportunities.consolidationBenefit.totalSavings)}`);
  }
}
```

### Portfolio Cash Flow Analysis

```typescript
import { generatePortfolioCashFlow } from '../calculations/PortfolioCalculations';

// Generate complete cash flow projection
const cashFlow = generatePortfolioCashFlow(portfolio, projectionYears);
if (cashFlow.success) {
  const projection = cashFlow.data;
  
  projection.monthlyProjections.forEach((month, index) => {
    console.log(`Month ${index + 1}:`);
    console.log(`  Total payment: ${toEuros(month.totalPayment)}`);
    console.log(`  Principal: ${toEuros(month.totalPrincipal)}`);
    console.log(`  Interest: ${toEuros(month.totalInterest)}`);
    console.log(`  Remaining balance: ${toEuros(month.totalRemainingBalance)}`);
  });
}
```

## Business Invariants

### Portfolio Validation Rules

```typescript
type PortfolioValidationError =
  | 'InvalidPortfolioId'
  | 'EmptyPortfolioName'
  | 'EmptyOwnerName'
  | 'DuplicateMortgageId'
  | 'TooManyMortgages'
  | 'InvalidMortgageConfiguration';

// Business rules enforced:
// - Portfolio must have valid ID and name
// - Owner cannot be empty
// - Maximum 20 mortgages per portfolio
// - All mortgage IDs must be unique
// - All mortgages must have valid configurations
```

### Mortgage Entry Validation

```typescript
// Mortgage validation rules:
// - Must have valid loan configuration
// - Market must be 'DE' or 'CH'
// - Bank name cannot be empty
// - Start date cannot be in future
// - If inactive, must have end date
const mortgageValidation = validateMortgageEntry(entry);
```

## Entity Lifecycle

### Creation
```typescript
// Portfolio creation with validation
const portfolio = createMortgagePortfolio(id, name, owner);
// - Validates all required fields
// - Sets creation and update timestamps
// - Initializes empty mortgage list
```

### Updates
```typescript
// All updates return new portfolio instance (immutable)
const updated = updatePortfolioDetails(portfolio, { name: 'New Name' });
// - Preserves ID and creation date
// - Updates modification timestamp
// - Validates new values
```

### State Transitions
```typescript
// Mortgage lifecycle within portfolio
const activated = activateMortgage(portfolio, mortgageId);
const deactivated = deactivateMortgage(portfolio, mortgageId, endDate);
// - Maintains audit trail
// - Enforces business rules
// - Updates portfolio summary
```

## Error Handling

Entities use comprehensive error types:

```typescript
// Portfolio operation results
type PortfolioOperationResult<T> = Result<T, PortfolioError>;

type PortfolioError = 
  | 'PortfolioNotFound'
  | 'MortgageNotFound'
  | 'DuplicateMortgage'
  | 'PortfolioCapacityExceeded'
  | 'InvalidOperation'
  | 'ValidationFailed';

// Always check success
const result = addMortgageToPortfolio(portfolio, mortgage);
if (result.success) {
  // Portfolio updated successfully
  const updatedPortfolio = result.data;
} else {
  // Handle specific error
  switch (result.error) {
    case 'DuplicateMortgage':
      showError('Mortgage with this ID already exists');
      break;
    case 'PortfolioCapacityExceeded':
      showError('Portfolio cannot exceed 20 mortgages');
      break;
  }
}
```

## Testing Strategy

### Entity Behavior Testing
```typescript
// Example from MortgagePortfolio.test.ts
test('portfolio maintains mortgage uniqueness', () => {
  let portfolio = createMortgagePortfolio('test', 'Test Portfolio', 'Owner');
  
  // Add first mortgage
  const result1 = addMortgageToPortfolio(portfolio.data, mortgage1);
  expect(result1.success).toBe(true);
  
  // Attempt to add duplicate
  const result2 = addMortgageToPortfolio(result1.data, mortgage1);
  expect(result2.success).toBe(false);
  expect(result2.error).toBe('DuplicateMortgage');
});
```

### Business Rule Validation
```typescript
test('portfolio enforces maximum capacity', () => {
  let portfolio = createMortgagePortfolio('test', 'Test Portfolio', 'Owner').data;
  
  // Add 20 mortgages (maximum)
  for (let i = 0; i < 20; i++) {
    const result = addMortgageToPortfolio(portfolio, createTestMortgage(i));
    expect(result.success).toBe(true);
    portfolio = result.data;
  }
  
  // 21st mortgage should fail
  const result = addMortgageToPortfolio(portfolio, createTestMortgage(21));
  expect(result.success).toBe(false);
  expect(result.error).toBe('PortfolioCapacityExceeded');
});
```

## Dependencies

Domain entities depend on:
- Domain types (LoanConfiguration, etc.)
- Value objects (Money, InterestRate, etc.)
- Calculation functions for portfolio analysis
- **No external frameworks or Vue dependencies**

This keeps entities pure and suitable for any runtime context.