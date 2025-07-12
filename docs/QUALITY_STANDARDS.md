# Quality Standards & Best Practices

## Overview

This document establishes quality standards and best practices for the Grundstein mortgage portfolio management application. Following these standards ensures maintainability, scalability, and professional-grade code quality.

**Last Updated:** 2025-07-12 - Updated to reflect current project state and best practices.

## Code Quality Standards

### 1. TypeScript Usage

✅ **Required**: All code must be TypeScript with strict typing

```typescript
// ✅ Good: Proper typing
interface MortgageForm {
  amount: number;
  interestRate: number;
  termYears: number;
  market: "DE" | "CH";
  bank: string;
  name: string;
}

// ❌ Bad: Any types
const mortgageForm: any = {
  amount: 300000,
  rate: 3.5,
};
```

### 2. Component Structure

✅ **Required**: Use Composition API with `<script setup>`

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Props
interface Props {
  portfolioId: string;
  isEditable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
});

// Emits
const emit = defineEmits<{
  save: [portfolio: Portfolio];
  cancel: [];
}>();

// State
const isLoading = ref(false);
const portfolio = ref<Portfolio | null>(null);

// Computed
const isValid = computed(() => {
  return portfolio.value?.name && portfolio.value?.owner;
});

// Methods
async function loadPortfolio() {
  // Implementation
}

// Lifecycle
onMounted(() => {
  loadPortfolio();
});
</script>
```

### 3. Naming Conventions

#### Files and Directories

- **Views**: `PascalCase.view.vue` (e.g., `PortfolioDashboard.view.vue`)
- **Components**: `PascalCase.vue` (e.g., `MortgageCard.vue`)
- **Composables**: `camelCase.ts` (e.g., `usePortfolio.ts`)
- **Services**: `PascalCase.ts` (e.g., `PortfolioService.ts`)
- **Types**: `PascalCase.ts` (e.g., `Portfolio.ts`)

#### Variables and Functions

```typescript
// ✅ Good: Descriptive names
const portfolioApplicationService = new PortfolioApplicationService();
const isCalculatingMortgage = ref(false);
const createMortgageFromFormData = (formData: FormData) => {};

// ❌ Bad: Abbreviated or unclear names
const pas = new PortfolioApplicationService();
const isCalc = ref(false);
const createMtg = (data: any) => {};
```

#### Constants

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for constants
const MAX_MORTGAGE_AMOUNT = 1000000;
const DEFAULT_INTEREST_RATE = 3.5;
const SUPPORTED_MARKETS = ["DE", "CH"] as const;

// ❌ Bad: camelCase for constants
const maxMortgageAmount = 1000000;
const defaultInterestRate = 3.5;
```

## Navigation & Routing Standards

### 1. Use Route Constants for Type Safety

❌ **NEVER** use string literals for routes:

```vue
<!-- ❌ Bad: String literals for routes -->
<RouterLink :to="{ name: 'portfolios.index' }">Portfolios</RouterLink>
<RouterLink
  :to="{ name: 'portfolios.show', params: { id: '123' } }"
>Portfolio</RouterLink>

<!-- ❌ Bad: Hardcoded paths -->
<RouterLink to="/portfolios/create">Create</RouterLink>
```

✅ **ALWAYS** use route constants:

```vue
<!-- ✅ Good: Route constants with type safety -->
<RouterLink :to="routes.portfolios.index()">Portfolios</RouterLink>
<RouterLink :to="routes.portfolios.show('123')">Portfolio</RouterLink>
<RouterLink :to="routes.portfolios.create()">Create</RouterLink>
```

### 2. Use RouterLink for Navigation

❌ **NEVER** use buttons with router.push() for navigation:

```vue
<!-- ❌ Bad: Button with router.push -->
<Button @click="$router.push('/portfolios/create')" />

<!-- ❌ Bad: Button with router navigation -->
<button @click="navigateToPortfolio()">View Portfolio</button>
```

✅ **ALWAYS** use RouterLink for navigation:

```vue
<!-- ✅ Good: RouterLink with route constants -->
<RouterLink :to="routes.portfolios.create()" class="btn btn-primary">
  Create Portfolio
</RouterLink>

<!-- ✅ Good: RouterLink with parameters -->
<RouterLink :to="routes.portfolios.show(portfolio.id)" class="portfolio-link">
  {{ portfolio.name }}
</RouterLink>
```

### 3. Button vs Link Guidelines

| Use Case                     | Component                    | Styling                      |
| ---------------------------- | ---------------------------- | ---------------------------- |
| Navigation to different page | `RouterLink`                 | Button-like styling with CSS |
| Form submission              | `Button` type="submit"       | Button component             |
| Modal/dialog actions         | `Button`                     | Button component             |
| API calls without navigation | `Button`                     | Button component             |
| External links               | `<a>` with `target="_blank"` | Link styling                 |

### 4. Route Naming

✅ **Use RESTful resource naming:**

```typescript
// ✅ Good: RESTful routes with constants
import { routes, ROUTE_NAMES } from "@/router/routes";

// Helper functions
routes.portfolios.index();
routes.portfolios.create();
routes.portfolios.show("123");
routes.portfolios.edit("123");

// Direct constants
ROUTE_NAMES.PORTFOLIOS.INDEX;
ROUTE_NAMES.PORTFOLIOS.CREATE;

// ❌ Bad: String literals
("portfolios.index");
("portfolios.create");
("portfolio-list");
("create-portfolio");
```

## UI/UX Standards

### 1. Consistent Component Usage

✅ **Use unified component system:**

```vue
<!-- ✅ Good: Consistent button usage -->
<Button
  label="Save Portfolio"
  variant="primary"
  size="lg"
  :loading="isSaving"
  @click="savePortfolio"
/>

<!-- ❌ Bad: Inconsistent button styling -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Save Portfolio
</button>
```

### 2. Modal Pattern

✅ **Use unified Modal component:**

```vue
<Modal
  :is-open="showModal"
  title="Create Portfolio"
  subtitle="Add a new portfolio to your collection"
  @close="showModal = false"
>
  <PortfolioForm @submit="handleSubmit" />
  
  <template #footer>
    <Button variant="secondary" @click="showModal = false">
      Cancel
    </Button>
    <Button type="submit" :loading="isCreating">
      Create Portfolio
    </Button>
  </template>
</Modal>
```

### 3. Loading States

✅ **Always provide loading feedback:**

```vue
<template>
  <!-- Loading state -->
  <div v-if="isLoading" class="flex justify-center items-center h-64">
    <div
      class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
    ></div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
    <p class="text-red-800">{{ error }}</p>
  </div>

  <!-- Content -->
  <div v-else>
    <!-- Your content here -->
  </div>
</template>
```

## API Integration Standards

### 1. Functional API Pattern

✅ **Use pure functions for API integration:**

```typescript
// Pure function for API calls
const fetchPortfolios = async (): Promise<Result<Portfolio[], ApiError>> => {
  try {
    const response = await apiClient.get("/api/portfolios");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

const createPortfolio = async (
  data: CreatePortfolioRequest,
): Promise<Result<Portfolio, ApiError>> => {
  try {
    const response = await apiClient.post("/api/portfolios", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Pure error handling function
const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message,
      status: error.response?.status || 500,
    };
  }
  return {
    message: "An unexpected error occurred",
    status: 500,
  };
};

// Compose functions for reusability
const withApiErrorHandling = <T>(
  apiCall: () => Promise<T>,
): Promise<Result<T, ApiError>> => {
  return apiCall()
    .then((data) => ({ success: true, data }) as Result<T, ApiError>)
    .catch(
      (error) =>
        ({ success: false, error: handleApiError(error) }) as Result<
          T,
          ApiError
        >,
    );
};
```

### 2. Functional Error Handling

✅ **Use Result types with functional composition:**

```typescript
// ✅ Good: Functional composition with Result types
const loadPortfolio = (id: string): Promise<Result<Portfolio, string>> =>
  fetchPortfolio(id)
    .then((result) =>
      result.success
        ? { success: true, data: result.data }
        : { success: false, error: result.error.message },
    )
    .catch(() => ({ success: false, error: "Failed to load portfolio" }));

// ✅ Good: Function composition for data transformation
const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

const processPortfolioData = pipe(
  validatePortfolio,
  enrichPortfolioData,
  calculateMetrics,
);

// ❌ Bad: Throwing exceptions in functional code
const loadPortfolio = async (id: string): Promise<Portfolio> => {
  const result = await portfolioService.getPortfolio(id);
  if (!result.success) {
    throw new Error(result.error.message); // Breaks functional flow
  }
  return result.data;
};
```

## Testing Standards

### 1. Functional Test Structure

```typescript
describe("Portfolio API Functions", () => {
  let mockApiClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
  });

  describe("fetchPortfolios", () => {
    it("should return portfolios when API call succeeds", async () => {
      // Arrange
      const mockPortfolios = [createMockPortfolio()];
      mockApiClient.get.mockResolvedValue({ data: mockPortfolios });

      // Act
      const result = await fetchPortfolios();

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockPortfolios);
      }
    });

    it("should return error when API call fails", async () => {
      // Arrange
      mockApiClient.get.mockRejectedValue(new Error("Network error"));

      // Act
      const result = await fetchPortfolios();

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe("Network error");
      }
    });
  });

  describe("Function composition", () => {
    it("should compose portfolio processing functions", () => {
      // Arrange
      const mockPortfolio = createMockPortfolio();
      const processData = pipe(
        validatePortfolio,
        enrichPortfolioData,
        calculateMetrics,
      );

      // Act
      const result = processData(mockPortfolio);

      // Assert
      expect(result).toMatchObject({
        ...mockPortfolio,
        isValid: true,
        enrichedData: expect.any(Object),
        metrics: expect.any(Object),
      });
    });
  });
});
```

### 2. Component Test Structure

```typescript
describe("PortfolioDashboard", () => {
  let wrapper: VueWrapper<any>;
  let mockFetchPortfolios: jest.MockedFunction<typeof fetchPortfolios>;

  beforeEach(() => {
    mockFetchPortfolios = jest.fn();
    wrapper = mount(PortfolioDashboard, {
      global: {
        plugins: [router],
        provide: {
          fetchPortfolios: mockFetchPortfolios,
        },
      },
    });
  });

  it("should display loading state initially", () => {
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true);
  });

  it("should display portfolios when loaded", async () => {
    // Arrange
    const mockPortfolios = [createMockPortfolio()];
    mockFetchPortfolios.mockResolvedValue({
      success: true,
      data: mockPortfolios,
    });

    // Act
    await wrapper.vm.$nextTick();

    // Assert
    expect(wrapper.find('[data-testid="portfolio-card"]').exists()).toBe(true);
  });

  it("should handle functional composition in component", async () => {
    // Arrange
    const rawData = [createMockPortfolio()];
    const processData = pipe(
      validatePortfolioData,
      enrichPortfolioData,
      calculateDashboardMetrics,
    );

    // Act
    const processedData = processData(rawData);

    // Assert
    expect(processedData).toHaveProperty("metrics");
    expect(processedData).toHaveProperty("validatedData");
  });
});
```

## Performance Standards

### 1. Lazy Loading

✅ **Use dynamic imports for route components:**

```typescript
// ✅ Good: Lazy loaded routes
{
  path: '/portfolios',
  component: () => import('../views/PortfolioDashboard.view.vue')
}

// ❌ Bad: Synchronous imports
import PortfolioDashboard from '../views/PortfolioDashboard.view.vue'
{
  path: '/portfolios',
  component: PortfolioDashboard
}
```

### 2. Component Optimization

✅ **Use v-memo for expensive computations:**

```vue
<template>
  <div v-for="portfolio in portfolios" :key="portfolio.id">
    <ExpensiveChart
      v-memo="[portfolio.data, portfolio.updatedAt]"
      :data="portfolio.data"
    />
  </div>
</template>
```

## Accessibility Standards

### 1. Semantic HTML

✅ **Use proper semantic elements:**

```vue
<!-- ✅ Good: Semantic HTML -->
<main>
  <h1>Portfolio Dashboard</h1>
  <section aria-label="Portfolio overview">
    <h2>Your Portfolios</h2>
    <ul>
      <li v-for="portfolio in portfolios" :key="portfolio.id">
        <article>
          <h3>{{ portfolio.name }}</h3>
          <p>{{ portfolio.description }}</p>
        </article>
      </li>
    </ul>
  </section>
</main>

<!-- ❌ Bad: Non-semantic HTML -->
<div>
  <div class="title">Portfolio Dashboard</div>
  <div class="section">
    <div class="subtitle">Your Portfolios</div>
    <div>
      <div v-for="portfolio in portfolios" :key="portfolio.id">
        <div class="portfolio-card">
          <div class="portfolio-name">{{ portfolio.name }}</div>
          <div class="portfolio-desc">{{ portfolio.description }}</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. ARIA Labels

✅ **Provide proper ARIA labels:**

```vue
<button aria-label="Delete portfolio" @click="deletePortfolio(portfolio.id)">
  <svg aria-hidden="true">
    <!-- Delete icon -->
  </svg>
</button>
```

## Documentation Standards

### 1. Component Documentation

```vue
<script setup lang="ts">
/**
 * PortfolioCard
 *
 * Displays a portfolio summary card with key metrics and actions.
 *
 * @example
 * <PortfolioCard
 *   :portfolio="portfolio"
 *   :editable="true"
 *   @edit="handleEdit"
 *   @delete="handleDelete"
 * />
 */

interface Props {
  /** The portfolio data to display */
  portfolio: Portfolio;
  /** Whether the portfolio can be edited */
  editable?: boolean;
  /** Whether to show detailed metrics */
  showMetrics?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  showMetrics: true,
});

const emit = defineEmits<{
  /** Emitted when user clicks edit button */
  edit: [portfolio: Portfolio];
  /** Emitted when user clicks delete button */
  delete: [portfolio: Portfolio];
  /** Emitted when user clicks on the portfolio card */
  click: [portfolio: Portfolio];
}>();
</script>
```

### 2. API Documentation

```typescript
/**
 * Portfolio Application Service
 *
 * Handles all portfolio-related operations including CRUD operations
 * and business logic orchestration.
 */
export class PortfolioApplicationService {
  /**
   * Creates a new portfolio
   *
   * @param input - Portfolio creation data
   * @returns Promise resolving to created portfolio or error
   *
   * @example
   * const result = await portfolioService.createPortfolio({
   *   name: 'Real Estate Portfolio',
   *   owner: 'John Doe'
   * })
   *
   * if (result.success) {
   *   console.log('Portfolio created:', result.data)
   * } else {
   *   console.error('Error:', result.error)
   * }
   */
  async createPortfolio(
    input: CreatePortfolioInput,
  ): Promise<Result<MortgagePortfolio, PortfolioApplicationError>> {
    // Implementation
  }
}
```

## Security Standards

### 1. Input Validation

✅ **Validate all user inputs:**

```typescript
import { z } from "zod";

const PortfolioSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  owner: z.string().min(1, "Owner is required").max(100, "Owner too long"),
  description: z.string().max(500, "Description too long").optional(),
});

function validatePortfolioInput(input: unknown): Result<Portfolio, string> {
  const result = PortfolioSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error.errors[0].message };
  }
}
```

### 2. XSS Prevention

✅ **Use v-text instead of v-html for user content:**

```vue
<!-- ✅ Good: Safe text rendering -->
<p v-text="portfolio.description"></p>

<!-- ❌ Bad: Potential XSS vulnerability -->
<p v-html="portfolio.description"></p>
```

## Code Review Checklist

### Before Submitting PR

- [ ] All TypeScript types are properly defined
- [ ] No `any` types used
- [ ] All navigation uses RouterLink, not buttons with router.push
- [ ] Route constants are used instead of string literals
- [ ] Components follow naming conventions
- [ ] Loading and error states are handled
- [ ] Unit tests are written and passing
- [ ] API integration uses pure functions, not service classes
- [ ] Functional composition is used where appropriate
- [ ] Accessibility attributes are included
- [ ] Documentation is updated

### Code Review Focus Areas

1. **Type Safety**: Ensure all types are properly defined
2. **Navigation**: Check for proper RouterLink usage and route constants
3. **Route Constants**: Verify route constants are used instead of string literals
4. **Functional Programming**: Ensure pure functions are used instead of service classes
5. **Function Composition**: Check for proper use of pipe and compose patterns
6. **Error Handling**: Verify Result types are used consistently
7. **Component Structure**: Ensure Composition API best practices
8. **Performance**: Check for unnecessary re-renders
9. **Accessibility**: Verify ARIA labels and semantic HTML
10. **Testing**: Ensure adequate test coverage

Following these standards ensures our codebase remains maintainable, scalable, and professional as the application grows in complexity.
