# Routing Documentation

## Overview

This application uses Vue Router for client-side routing. Currently, it has a simple two-page structure focused on mortgage calculations.

**Last Updated:** 2025-07-12 - Updated to reflect actual implementation.

## Current Routes

The application has only 2 routes:

| Path      | Route Name | Component                    | Description                       |
| --------- | ---------- | ---------------------------- | --------------------------------- |
| `/`       | `overview` | `CashFlowDashboard.view.vue` | Landing page with welcome message |
| `/create` | `create`   | `CreateMortgage.view.vue`    | Mortgage calculator page          |

## Router Configuration

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "overview",
      component: () => import("../app/views/CashFlowDashboard.view.vue"),
    },
    {
      path: "/create",
      name: "create",
      component: () => import("../app/views/CreateMortgage.view.vue"),
    },
  ],
});
```

## Navigation

### Using RouterLink

```vue
<RouterLink :to="routes.create()" class="btn btn-primary">
  Create New Mortgage
</RouterLink>
```

### Using Route Helpers

```typescript
// src/router/routes.ts
export const routes = {
  overview: () => ({ name: "overview" }),
  create: () => ({ name: "create" }),
};
```

## File Structure

```
src/
├── router/
│   ├── index.ts       # Router configuration
│   └── routes.ts      # Route helper functions
└── app/
    └── views/
        ├── CashFlowDashboard.view.vue  # Landing page
        └── CreateMortgage.view.vue      # Calculator page
```

## Future Considerations

If the application expands, consider implementing:

1. **Additional Calculator Views**: Different calculation modes or scenarios
2. **Results Page**: Dedicated page for displaying calculation results
3. **Help/Documentation**: In-app help pages
4. **Settings**: User preferences for calculation defaults

## Best Practices

1. **Keep It Simple**: With only 2 routes, avoid over-engineering
2. **Lazy Loading**: Routes already use dynamic imports for code splitting
3. **Type Safety**: Use the route helper functions for navigation
4. **Consistent Naming**: Follow the established pattern for any new routes

## Navigation Flow

```
Landing Page (/)
    │
    └─→ Create Mortgage (/create)
            │
            └─→ (Results displayed on same page)
```

The application is designed as a single-page calculator where results are displayed inline rather than navigating to separate pages.
