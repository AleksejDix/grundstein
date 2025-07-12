# Functional Architecture

## Overview

This document outlines our pure functional architecture where Vue/Pinia serves exclusively as the view layer, with all business logic residing in the functional core.

## Core Principles

1. **Pure Functions Only** - All business logic must be pure functions
2. **Strict Layer Separation** - View layer contains NO business logic
3. **Stores as Shared Refs** - Pinia stores are just shared refs and computed values
4. **Domain Isolation** - Business logic lives only in the domain layer
5. **No Logic in View** - Vue components and stores are dumb view containers

## Architecture Layers

### 1. Domain Layer (Pure Business Logic)

```
src/core/domain/
├── types/          # Branded types (Money, Percentage, etc.)
├── calculations/   # Pure calculation functions
├── services/       # Domain services (pure functions)
└── index.ts       # Public API
```

**Contains:**

- All business logic
- All calculations
- All validations
- All business rules
- Pure functions only

### 2. Application Layer (Orchestration)

```
src/core/application/
├── services/       # Use case orchestration
└── types/          # Application-specific types
```

**Contains:**

- Use case orchestration
- Service coordination
- Error handling

### 3. View Layer (Presentation Only)

```
src/app/
├── stores/        # UI state only (Pinia)
├── components/    # Vue components
├── composables/   # Vue composables
└── pages/         # Page components
```

**Contains:**

- UI state (selected items, view modes, open/closed states)
- Display formatting
- User input capture
- NO business logic

## Correct Store Architecture

### UI Stores (ONLY Shared Refs)

```typescript
// stores/mortgageUIStore.ts - CORRECT
export const useMortgageUIStore = defineStore("mortgage-ui", () => {
  // Shared refs - UI state only
  const selectedMortgageId = ref<string | null>(null);
  const viewMode = ref<"grid" | "list" | "table">("grid");
  const isSidebarOpen = ref(false);
  const sortField = ref<"date" | "amount" | "rate">("date");
  const sortOrder = ref<"asc" | "desc">("desc");
  const searchTerm = ref("");

  // Shared computed - UI derivations only
  const hasSelection = computed(() => selectedMortgageId.value !== null);
  const isListView = computed(() => viewMode.value === "list");

  return {
    // State
    selectedMortgageId,
    viewMode,
    isSidebarOpen,
    sortField,
    sortOrder,
    searchTerm,

    // Computed
    hasSelection,
    isListView,

    // Setters (no logic)
    selectMortgage: (id: string | null) => (selectedMortgageId.value = id),
    setViewMode: (mode: typeof viewMode.value) => (viewMode.value = mode),
    toggleSidebar: () => (isSidebarOpen.value = !isSidebarOpen.value),
  };
});
```

### What NOT to Put in Stores

```typescript
// stores/badExample.ts - WRONG! Contains business logic
export const useBadStore = defineStore("bad", () => {
  // ❌ Domain types in store
  const mortgages = ref<LoanConfiguration[]>([]);

  // ❌ Business calculations in store
  const totalAmount = computed(() =>
    mortgages.value.reduce((sum, m) => sum + m.amount, 0),
  );

  // ❌ Business logic in store
  const addMortgage = (input: MortgageInput) => {
    const validated = validateMortgage(input); // ❌ Validation
    const mortgage = createMortgage(validated); // ❌ Domain logic
    mortgages.value.push(mortgage);
  };

  // ❌ Async operations in store
  const loadMortgages = async () => {
    const data = await api.getMortgages(); // ❌ Should use TanStack Query
    mortgages.value = data;
  };
});
```

## Data Flow (In-Memory Only)

Since this is a pure calculator with no network calls or persistence:

```typescript
// All calculations happen in-memory
// No external data fetching
// No persistence layer
```

### Component Integration

```typescript
// components/MortgageCalculator.vue
<script setup lang="ts">
import { useMortgageUIStore } from '@/stores/mortgageUIStore'
import { calculateMortgage, analyzeMortgage } from '@/core/domain'

// UI State
const uiStore = useMortgageUIStore()
const { viewMode, selectedTab } = storeToRefs(uiStore)

// Form inputs (local component state)
const loanAmount = ref('')
const interestRate = ref('')
const termYears = ref('')

// Pure computation using domain function
const mortgageAnalysis = computed(() => {
  const amount = parseFloat(loanAmount.value)
  const rate = parseFloat(interestRate.value)
  const years = parseInt(termYears.value)

  if (isNaN(amount) || isNaN(rate) || isNaN(years)) return null

  // Call pure domain function
  return calculateMortgage({ amount, rate, years })
})

// UI-only formatting
const displayResults = computed(() => {
  if (!mortgageAnalysis.value) return null
  return {
    monthlyPayment: formatCurrency(mortgageAnalysis.value.monthlyPayment),
    totalInterest: formatCurrency(mortgageAnalysis.value.totalInterest)
  }
})
</script>
```

## Data Flow

```
User Input → Component → Domain Function → Component → Display
                ↓
             UI Store (for UI state only)
```

## Composables Pattern

```typescript
// composables/useMortgageCalculator.ts
export function useMortgageCalculator() {
  const uiStore = useMortgageUIStore();

  // Local state for inputs
  const inputs = reactive({
    loanAmount: "",
    interestRate: "",
    termYears: "",
  });

  // Pure calculation
  const calculate = () => {
    const result = calculateMortgage({
      amount: parseFloat(inputs.loanAmount),
      rate: parseFloat(inputs.interestRate),
      years: parseInt(inputs.termYears),
    });

    if (result.success) {
      // Update UI state if needed
      uiStore.setCalculationMode("results");
    }

    return result;
  };

  return {
    inputs,
    calculate,
  };
}
```

## Key Rules

### ✅ DO:

- Use stores for shared UI state only
- Keep all logic in domain layer
- Use computed for UI-only derivations
- Use composables for reusable component logic
- Keep calculations pure and stateless

### ❌ DON'T:

- Put business logic in stores
- Put domain types in stores
- Do calculations in stores
- Add unnecessary abstraction layers
- Create fake async operations

## Example: Complete Feature

### 1. Domain Layer

```typescript
// domain/calculations/mortgageAnalysis.ts
export function analyzeMortgage(config: LoanConfiguration): MortgageAnalysis {
  // Pure business logic
  return {
    monthlyPayment: calculateMonthlyPayment(config),
    totalInterest: calculateTotalInterest(config),
    // ... more calculations
  };
}
```

### 2. Composable Layer

```typescript
// composables/useMortgage.ts
export function useMortgage() {
  const inputs = reactive({
    amount: "",
    rate: "",
    years: "",
  });

  const result = computed(
    () => calculateMortgage(inputs), // Direct domain function call
  );

  return { inputs, result };
}
```

### 3. UI Store

```typescript
// stores/mortgageUIStore.ts
export const useMortgageUIStore = defineStore("mortgage-ui", () => {
  const selectedId = ref<string | null>(null);
  const isEditMode = ref(false);

  return {
    selectedId,
    isEditMode,
    select: (id: string) => (selectedId.value = id),
    toggleEdit: () => (isEditMode.value = !isEditMode.value),
  };
});
```

### 4. Component

```typescript
// components/MortgageDetail.vue
<script setup lang="ts">
const uiStore = useMortgageUIStore()
const { inputs, result } = useMortgage()

// Use domain function directly
const analysis = computed(() =>
  result.value ? analyzeMortgage(result.value) : null
)
</script>
```

## Testing Strategy

1. **Domain Tests** - Test pure functions with all business logic
2. **Store Tests** - Test UI state changes only (simple ref updates)
3. **Component Tests** - Test user interactions and display
4. **Integration Tests** - Test complete calculation flows

## Summary

- **Stores = Shared Refs**: Nothing more than lifted component state
- **No Logic in View**: All logic lives in the domain layer
- **In-Memory Only**: No network calls, no persistence, pure calculations
- **Pure Functions**: Business logic is always pure and testable
- **Simple Architecture**: No unnecessary layers for a calculator app
