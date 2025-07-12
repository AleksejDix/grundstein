# Primitives Layer - Foundation Types & Utilities

This layer contains the **foundational utilities** that enable type safety and functional programming patterns throughout the domain. These are the building blocks for all other domain types.

## Architecture

```
src/core/domain/primitives/
├── Brand.ts                      # Branded types utility & Result/Option types
└── GermanSondertilgungRules.ts   # German banking business rules
```

## Design Principles

### 🔧 **Type System Utilities**
- **Branded types** for compile-time type safety
- **Result types** for explicit error handling
- **Option types** for nullable value handling
- **Functional programming** utilities

### 🏦 **Market-Specific Business Rules**
- **German banking regulations** encoded as types
- **Bank-specific Sondertilgung policies**
- **Real-world compliance requirements**
- **Regulatory validation functions**

### 🛡️ **Type Safety Foundation**
- **Make illegal states unrepresentable**
- **Compile-time error prevention**
- **Zero runtime overhead** for type checking
- **Explicit error handling patterns**

## Core Modules

### `Brand.ts` - Type Safety Foundation

The cornerstone utility that enables type-safe domain modeling:

```typescript
import { Branded, Result, Option } from './Brand';

// Create branded types to prevent primitive obsession
type UserId = Branded<string, 'UserId'>;
type Email = Branded<string, 'Email'>;

// These types are incompatible even though both are strings
const userId: UserId = 'user_123' as UserId;      // ✅ Explicit branding
const email: Email = userId;                      // ❌ Compiler error!

// Result type for error handling
const parseEmail = (input: string): Result<Email, 'InvalidFormat'> => {
  if (input.includes('@')) {
    return Result.ok(input as Email);
  }
  return Result.error('InvalidFormat');
};

// Option type for nullable values
const findUser = (id: UserId): Option<User> => {
  const user = database.find(id);
  return user ? Option.some(user) : Option.none();
};
```

#### **Branded Type System**
```typescript
// The core branding utility
type Branded<T, B> = T & Brand<B>;

// Examples from the domain
type Money = Branded<number, 'Money'>;
type LoanAmount = Branded<Money, 'LoanAmount'>;
type InterestRate = Branded<Percentage, 'InterestRate'>;

// Prevents accidental mixing of semantically different values
function calculatePayment(amount: LoanAmount, rate: InterestRate) {
  // Type-safe - can only be called with correct branded types
}
```

#### **Result Type for Error Handling**
```typescript
type Result<T, E> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Rich API for Result manipulation
const result = parseAmount('500000');
if (result.success) {
  console.log(result.data);  // Type-safe access to data
} else {
  console.error(result.error);  // Type-safe access to error
}

// Functional transformations
const doubled = Result.map(result, x => x * 2);
const chained = Result.flatMap(result, x => validateAmount(x));
```

#### **Option Type for Nullable Values**
```typescript
type Option<T> = 
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

// Explicit handling of optional values
const maybeUser = findUser(userId);
const userName = Option.map(maybeUser, user => user.name);
const displayName = Option.getOrElse(userName, 'Unknown User');

// Composition with other options
const fullProfile = Option.flatMap(maybeUser, user => loadProfile(user.id));
```

### `GermanSondertilgungRules.ts` - Banking Business Rules

Comprehensive implementation of German mortgage market regulations:

```typescript
import { 
  createGermanSondertilgungRules,
  validateSondertilgungPayment,
  calculateSondertilgungFees 
} from './GermanSondertilgungRules';

// Create rules for specific German bank type
const sparkasseRules = createGermanSondertilgungRules('Sparkasse');
if (sparkasseRules.success) {
  const rules = sparkasseRules.data;
  
  // Rules automatically include:
  // - 5% and 10% annual limits
  // - 12-month grace period
  // - Month-end payment dates only
  // - 1% fee on payment amount
}

// Validate extra payment against rules
const validation = validateSondertilgungPayment(
  rules,
  extraPayment,      // €20,000 in month 18
  originalLoan,      // €500,000 original amount
  existingPayments,  // Previous extra payments this year
  fixedRatePeriod    // Current rate lock period
);

if (validation.success) {
  // Payment complies with German banking rules
} else {
  // Handle specific compliance violations
  switch (validation.error) {
    case 'ExceedsAllowedPercentage':
      showError('Exceeds 10% annual Sondertilgung limit');
      break;
    case 'WithinGracePeriod':
      showError('Cannot make extra payments in first 12 months');
      break;
  }
}
```

#### **German Bank Types & Rules**
```typescript
type GermanBankType = 
  | 'Sparkasse'           // Local savings banks
  | 'Volksbank'           // Cooperative banks  
  | 'Privatbank'          // Private banks (Deutsche Bank, etc.)
  | 'Bausparkasse'        // Building societies
  | 'Hypothekenbank'      // Mortgage banks
  | 'OnlineBank'          // Online-only banks
  | 'Genossenschaftsbank'; // Cooperative banks

// Each bank type has different rules:
const bankRules = {
  Sparkasse: {
    allowedPercentages: [5, 10],        // 5% or 10% annual limits
    gracePeriodMonths: 12,              // 1 year grace period
    paymentDates: 'MonthEnd',           // End of month only
    feeType: 'Percentage',              // 1% fee on payment
  },
  
  OnlineBank: {
    allowedPercentages: [10, 20, 50],   // More flexible limits
    gracePeriodMonths: 3,               // Shorter grace period
    paymentDates: 'AnyTime',            // No date restrictions
    feeType: 'None',                    // No fees
  }
  // ... other bank types
};
```

#### **Sondertilgung Validation Rules**
```typescript
type SondertilgungValidationError =
  | 'ExceedsAllowedPercentage'    // Above annual limit (5%, 10%, etc.)
  | 'BelowMinimumAmount'          // Below €1,000 minimum
  | 'AboveMaximumAmount'          // Above bank-specific maximum
  | 'WithinGracePeriod'           // During initial grace period
  | 'InsufficientNotice'          // Didn't provide required notice
  | 'InvalidPaymentDate'          // Wrong date (must be month/quarter/year end)
  | 'DuringBlackoutPeriod'        // During restricted periods
  | 'ExcessiveFeeAmount'          // Fee calculation error
  | 'NotAllowedForBankType';      // Bank doesn't allow this type

// Comprehensive validation covers:
// - Annual percentage limits by bank type
// - Timing restrictions and grace periods
// - Payment date requirements
// - Notice periods and blackout periods
// - Fee calculations and limits
```

#### **Fee Structure Implementation**
```typescript
type SondertilgungFeeType =
  | 'None'           // No fees (typical for online banks)
  | 'Fixed'          // Fixed fee per payment (€250-€500)
  | 'Percentage'     // Percentage of payment (0.5%-2%)
  | 'Tiered'         // Different rates for different amounts
  | 'ExcessOnly';    // Fee only for amounts above allowed limit

// Calculate fees according to German banking standards
const feeResult = calculateSondertilgungFees(
  rules,
  payment,
  originalLoanAmount,
  existingYearlyPayments
);

if (feeResult.success) {
  const fee = feeResult.data;
  console.log(`Sondertilgung fee: ${toEuros(fee)}`);
}
```

#### **Market Intelligence & Recommendations**
```typescript
// Get strategic recommendations based on German market knowledge
const strategy = getRecommendedStrategy(
  rules,
  originalLoanAmount,    // €500,000 loan
  availableAmount,       // €50,000 available
  fixedRatePeriod       // Current rate lock
);

// Returns:
// {
//   recommendedPercentage: 10,     // Use 10% annual limit
//   optimalTiming: 'Vor Zinsbindungsende',  // Before rate lock ends
//   expectedSavings: 47500,        // €47,500 interest savings
//   riskAssessment: 'Mittel - Liquidität beachten'  // Moderate risk
// }
```

## Advanced Usage Patterns

### Type-Safe Domain Modeling

```typescript
// Build complex domain types from primitives
type LoanId = Branded<string, 'LoanId'>;
type BankId = Branded<string, 'BankId'>;

type GermanMortgage = {
  readonly id: LoanId;
  readonly bankId: BankId;
  readonly configuration: LoanConfiguration;
  readonly sondertilgungRules: GermanSondertilgungRules;
  readonly market: 'DE';  // Always German market
};

// Compiler ensures type safety across all operations
function processGermanMortgage(mortgage: GermanMortgage) {
  // Can only be called with properly typed German mortgage
}
```

### Functional Error Handling

```typescript
// Compose operations with automatic error propagation
const processLoanApplication = (input: string) => {
  return Result.flatMap(
    parseAmount(input),
    amount => Result.flatMap(
      validateLoanAmount(amount),
      validAmount => Result.flatMap(
        checkAffordability(validAmount),
        affordableAmount => createLoanOffer(affordableAmount)
      )
    )
  );
};

// Single error handling point
const result = processLoanApplication('500000');
if (result.success) {
  console.log('Loan approved:', result.data);
} else {
  console.error('Application failed:', result.error);
}
```

### Market-Specific Business Logic

```typescript
// German vs Swiss market handling
const createMarketRules = (market: 'DE' | 'CH') => {
  switch (market) {
    case 'DE':
      return createGermanSondertilgungRules('Sparkasse');
    case 'CH':
      return createSwissMortgageRules('PostFinance');  // Hypothetical
  }
};

// Type-safe market switching
const validateExtraPayment = (
  market: 'DE' | 'CH',
  payment: ExtraPayment,
  loan: LoanConfiguration
) => {
  const rulesResult = createMarketRules(market);
  if (!rulesResult.success) return rulesResult;
  
  return validateSondertilgungPayment(
    rulesResult.data,
    payment,
    loan.amount,
    []
  );
};
```

## Performance Characteristics

### Branded Types
- **Zero runtime overhead** - purely compile-time
- **No memory allocation** - just type annotations
- **Fast compilation** - simple type operations
- **Excellent tree-shaking** - no runtime code

### Result/Option Types
- **Lightweight objects** - minimal memory footprint
- **Efficient composition** - optimized for chaining
- **Early termination** - short-circuits on first error
- **Memory safe** - no exception overhead

### German Banking Rules
- **Pre-computed constants** - no runtime calculation
- **Lookup tables** - O(1) rule retrieval
- **Minimal validation** - only necessary checks
- **Cacheable results** - pure function outputs

## Testing Strategy

### Branded Type Testing
```typescript
// Compile-time type safety tests
test('branded types prevent mixing', () => {
  const amount: LoanAmount = createLoanAmount(100000).data!;
  const rate: InterestRate = createInterestRate(3.5).data!;
  
  // This should compile
  const payment = calculatePayment(amount, rate);
  
  // This should NOT compile (tested with tsc --noEmit)
  // const badPayment = calculatePayment(rate, amount);  // Wrong order!
});
```

### Business Rules Testing
```typescript
// Property-based testing for German rules
test('Sparkasse limits are enforced', () => {
  fc.assert(fc.property(
    fc.float({ min: 0.11, max: 0.15 }),  // 11-15% attempts
    (percentage) => {
      const rules = createGermanSondertilgungRules('Sparkasse').data!;
      const amount = 500000 * (percentage / 100);
      const payment = createExtraPayment(amount);
      const validation = validateSondertilgungPayment(rules, payment, loan, []);
      
      // Should always fail for amounts > 10%
      expect(validation.success).toBe(false);
      expect(validation.error).toBe('ExceedsAllowedPercentage');
    }
  ));
});
```

## Dependencies

Primitives layer has minimal dependencies:
- **TypeScript compiler** for branded types
- **No runtime dependencies** for type utilities
- **Decimal.js** only for monetary calculations in German rules
- **No external APIs or frameworks**

This keeps the foundation layer pure and portable across any JavaScript environment.