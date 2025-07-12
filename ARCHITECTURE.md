# Grundstein Architecture - SIMPLIFIED

## Overview
Grundstein is a simple mortgage calculator with just 2 views:
1. **Overview** - Landing page with welcome message
2. **Create** - Form to calculate mortgage payments

## Structure
```
src/
├── App.vue              # Root component (just RouterView)
├── app/
│   └── views/
│       ├── CashFlowDashboard.view.vue  # Overview page
│       └── CreateMortgage.view.vue     # Create/calculate page
├── router/
│   ├── index.ts         # Vue Router setup (2 routes)
│   └── routes.ts        # Route helpers
└── main.ts              # App entry point
```

## No Complexity
- **NO layouts** - Views handle their own styling
- **NO components** - Everything is in the views
- **NO portfolio** - Just mortgage calculations
- **NO state management** - Local component state only

## Routes
- `/` - Overview page
- `/create` - Create mortgage page

That's it. Simple and focused.