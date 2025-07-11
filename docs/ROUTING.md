# Routing Documentation

## Overview

This application follows **RESTful resource-based routing** conventions inspired by Laravel and Ruby on Rails. This approach provides a consistent, predictable URL structure that scales with application complexity.

## Routing Conventions

### Resource Routes

Following Laravel/Rails naming conventions:

| HTTP Method | URL Pattern           | Route Name          | Controller Action | Description                      |
| ----------- | --------------------- | ------------------- | ----------------- | -------------------------------- |
| GET         | `/resources`          | `resources.index`   | `index()`         | List all resources               |
| GET         | `/resources/create`   | `resources.create`  | `create()`        | Show form to create new resource |
| POST        | `/resources`          | `resources.store`   | `store()`         | Store new resource               |
| GET         | `/resources/:id`      | `resources.show`    | `show()`          | Show specific resource           |
| GET         | `/resources/:id/edit` | `resources.edit`    | `edit()`          | Show form to edit resource       |
| PUT/PATCH   | `/resources/:id`      | `resources.update`  | `update()`        | Update specific resource         |
| DELETE      | `/resources/:id`      | `resources.destroy` | `destroy()`       | Delete specific resource         |

### Nested Resources

For resources that belong to other resources:

| HTTP Method | URL Pattern                         | Route Name               | Description             |
| ----------- | ----------------------------------- | ------------------------ | ----------------------- |
| GET         | `/parent/:parentId/children`        | `parent.children.index`  | List children of parent |
| GET         | `/parent/:parentId/children/create` | `parent.children.create` | Create child for parent |
| POST        | `/parent/:parentId/children`        | `parent.children.store`  | Store child for parent  |

## Application Routes

### Dashboard Routes

- **GET** `/` → `dashboard.index`
  - Main dashboard with cash flow overview

### Portfolio Routes

- **GET** `/portfolios` → `portfolios.index`
  - List all portfolios
- **GET** `/portfolios/create` → `portfolios.create`
  - Show form to create new portfolio
- **POST** `/portfolios` → `portfolios.store`
  - Store new portfolio
- **GET** `/portfolios/:id` → `portfolios.show`
  - Show specific portfolio details
- **GET** `/portfolios/:id/edit` → `portfolios.edit`
  - Show form to edit portfolio
- **PUT** `/portfolios/:id` → `portfolios.update`
  - Update portfolio
- **DELETE** `/portfolios/:id` → `portfolios.destroy`
  - Delete portfolio

### Mortgage Routes

- **GET** `/mortgages` → `mortgages.index`
  - List all mortgages
- **GET** `/mortgages/create` → `mortgages.create`
  - Show form to create new mortgage
- **POST** `/mortgages` → `mortgages.store`
  - Store new mortgage
- **GET** `/mortgages/:id` → `mortgages.show`
  - Show specific mortgage details
- **GET** `/mortgages/:id/edit` → `mortgages.edit`
  - Show form to edit mortgage
- **PUT** `/mortgages/:id` → `mortgages.update`
  - Update mortgage
- **DELETE** `/mortgages/:id` → `mortgages.destroy`
  - Delete mortgage

### Nested Portfolio-Mortgage Routes

- **GET** `/portfolios/:portfolioId/mortgages` → `portfolios.mortgages.index`
  - List mortgages within specific portfolio
- **GET** `/portfolios/:portfolioId/mortgages/create` → `portfolios.mortgages.create`
  - Create mortgage within specific portfolio
- **POST** `/portfolios/:portfolioId/mortgages` → `portfolios.mortgages.store`
  - Store mortgage within specific portfolio

## File Structure

```
src/
├── router/
│   └── index.ts                 # Main router configuration
├── views/
│   ├── CashFlowDashboard.view.vue      # dashboard.index
│   ├── PortfolioDashboard.view.vue     # portfolios.index
│   ├── PortfolioCreate.view.vue        # portfolios.create
│   ├── PortfolioDetail.view.vue        # portfolios.show
│   ├── PortfolioEdit.view.vue          # portfolios.edit
│   ├── CreateMortgage.view.vue         # mortgages.create
│   ├── MortgageIndex.view.vue          # mortgages.index
│   ├── MortgageShow.view.vue           # mortgages.show
│   └── MortgageEdit.view.vue           # mortgages.edit
└── components/
    └── Navigation.vue           # Centralized navigation component
```

## Best Practices

### 1. Use Route Constants for Type Safety

❌ **Bad**: Using string literals

```vue
<RouterLink :to="{ name: 'portfolios.index' }">Portfolios</RouterLink>
<RouterLink
  :to="{ name: 'portfolios.show', params: { id: '123' } }"
>Portfolio</RouterLink>
```

✅ **Good**: Using route constants

```vue
<RouterLink :to="routes.portfolios.index()">Portfolios</RouterLink>
<RouterLink :to="routes.portfolios.show('123')">Portfolio</RouterLink>
```

### 2. Use RouterLink for Navigation

❌ **Bad**: Using buttons with router.push()

```vue
<Button @click="$router.push('/portfolios/create')" />
```

✅ **Good**: Using RouterLink with route constants

```vue
<RouterLink :to="routes.portfolios.create()" class="btn btn-primary">
  Create Portfolio
</RouterLink>
```

### 3. Import Route Constants

```typescript
// In your component
import { routes, ROUTE_NAMES } from "@/router/routes";

// Use helper functions for cleaner code
router.push(routes.portfolios.show(portfolioId));

// Or use constants directly when needed
const routeName = ROUTE_NAMES.PORTFOLIOS.INDEX;
```

### 4. Consistent Route Naming

- Use dot notation: `resource.action`
- Use plural resource names: `portfolios`, `mortgages`
- Use standard actions: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy`

### 5. URL Structure

- Use plural nouns for resources: `/portfolios`, `/mortgages`
- Use kebab-case for multi-word resources: `/portfolio-templates`
- Use numeric IDs for resources: `/portfolios/123`

### 6. Route Parameters

- Use descriptive parameter names: `:portfolioId`, `:mortgageId`
- Validate parameters in route guards
- Use TypeScript for parameter types

## Route Guards

### Authentication Guard

```typescript
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});
```

### Permission Guard

```typescript
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresPermission)) {
    if (!hasPermission(to.meta.requiresPermission)) {
      next("/unauthorized");
    } else {
      next();
    }
  } else {
    next();
  }
});
```

## Migration from Legacy Routes

### Compatibility Redirects

The router includes redirects for legacy routes:

- `/portfolio` → `/portfolios`
- `/create-mortgage` → `/mortgages/create`
- `/mortgage/:id` → `/mortgages/:id`

### Deprecation Timeline

1. **Phase 1**: Add new routes with redirects (✅ Complete)
2. **Phase 2**: Update all internal links to use new routes
3. **Phase 3**: Add deprecation warnings for legacy routes
4. **Phase 4**: Remove legacy routes

## Testing Routes

### Unit Tests

```typescript
import { createRouter, createWebHistory } from "vue-router";
import router from "@/router";

describe("Router", () => {
  test("portfolios.index route", async () => {
    await router.push("/portfolios");
    expect(router.currentRoute.value.name).toBe("portfolios.index");
  });

  test("portfolios.show route", async () => {
    await router.push("/portfolios/123");
    expect(router.currentRoute.value.name).toBe("portfolios.show");
    expect(router.currentRoute.value.params.id).toBe("123");
  });
});
```

### E2E Tests

```typescript
test("Portfolio navigation flow", async ({ page }) => {
  await page.goto("/portfolios");
  await page.click("text=Create Portfolio");
  await expect(page).toHaveURL("/portfolios/create");

  await page.fill('[name="name"]', "Test Portfolio");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portfolios\/\d+/);
});
```

## API Integration

### RESTful API Endpoints

Match frontend routes with backend API endpoints:

```typescript
// Frontend: /portfolios → Backend: GET /api/portfolios
// Frontend: /portfolios/123 → Backend: GET /api/portfolios/123
// Frontend: /portfolios/create → Backend: POST /api/portfolios
```

### Service Layer

```typescript
class PortfolioService {
  async index(): Promise<Portfolio[]> {
    return await apiClient.get("/api/portfolios");
  }

  async show(id: string): Promise<Portfolio> {
    return await apiClient.get(`/api/portfolios/${id}`);
  }

  async store(data: CreatePortfolioRequest): Promise<Portfolio> {
    return await apiClient.post("/api/portfolios", data);
  }

  async update(id: string, data: UpdatePortfolioRequest): Promise<Portfolio> {
    return await apiClient.put(`/api/portfolios/${id}`, data);
  }

  async destroy(id: string): Promise<void> {
    return await apiClient.delete(`/api/portfolios/${id}`);
  }
}
```

## Performance Considerations

### Lazy Loading

All routes use dynamic imports for code splitting:

```typescript
{
  path: '/portfolios',
  component: () => import('../views/PortfolioDashboard.view.vue')
}
```

### Route Caching

Implement route-level caching for static resources:

```typescript
{
  path: '/portfolios/:id',
  component: () => import('../views/PortfolioDetail.view.vue'),
  meta: {
    cache: true,
    cacheTTL: 300 // 5 minutes
  }
}
```

## Troubleshooting

### Common Issues

1. **404 on Direct Access**: Ensure server is configured for SPA routing
2. **Parameter Not Found**: Check parameter names match route definition
3. **Navigation Guards Loop**: Ensure guards don't redirect to themselves

### Debug Tools

```typescript
// Enable router debugging
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Add navigation logging
router.beforeEach((to, from) => {
  console.log(`Navigating from ${from.name} to ${to.name}`);
});
```

This routing system provides a solid foundation for scaling the application while maintaining consistency and predictability across all routes.
