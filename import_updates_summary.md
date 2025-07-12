# Import Path Updates Summary

## Updated Files

### Router

- **src/router/index.ts**: Updated all view imports from `../views/` to `../app/views/`

### Infrastructure

- **src/infrastructure/persistence/PortfolioRepository.ts**: Updated domain import from `../../domain` to `../../core/domain`

### Services

- **src/services/RealisticMortgageDataService.ts**: Updated domain imports from `../domain` to `../core/domain` and require paths

### Application Services

- **src/app/services/application/services/MortgageService.ts**: Updated domain import from `../../domain` to `../../../../core/domain`
- **src/app/services/application/services/PortfolioApplicationService.ts**: Updated domain and infrastructure imports to use correct paths

### Adapters

- **src/app/adapters/MortgageAdapter.ts**: Updated application service import from `../../application/services/` to `../services/application/services/`

### Views

All views in `src/app/views/` were updated for:

1. Domain imports: `../domain` → `../../core/domain`
2. Application service imports: `../application/services/` → `../services/application/services/`
3. Infrastructure imports: `../infrastructure/` → `../../infrastructure/`
4. Router imports: `../router/routes` → `../../router/routes`
5. Store imports: `../stores/` → `../../stores/`

Updated view files:

- CashFlowDashboard.view.vue
- CreateMortgage.view.vue
- MortgageEdit.view.vue
- MortgageShow.view.vue
- MortgageIndex.view.vue
- MortgageDetailView.vue
- PortfolioCreate.view.vue
- PortfolioDashboard.view.vue
- PortfolioDetail.view.vue
- PortfolioEdit.view.vue
- PortfolioMortgageCreate.view.vue
- PortfolioMortgageIndex.view.vue

### Components

- **src/app/components/mortgage/PaymentSchedule.vue**:
  - Updated domain import from `../../../domain` to `../../../core/domain`
  - Updated application service import from `../../../application/services/` to `../../services/application/services/`

### Tests

- **src/app/views/**tests**/PortfolioDashboard.test.ts**: Updated application service imports

## Key Import Pattern Changes

1. **Domain imports**: All paths now point to `core/domain` instead of `domain`
2. **Application service imports**: Now use `app/services/application/services/` path
3. **Infrastructure imports**: Updated to reference correct relative paths
4. **Router imports**: Updated to reference correct relative paths from app layer
5. **Store imports**: Updated to reference correct relative paths from app layer

## Import Path Mapping

| Old Path                   | New Path                                |
| -------------------------- | --------------------------------------- |
| `../domain`                | `../core/domain` or `../../core/domain` |
| `../application/services/` | `../services/application/services/`     |
| `../infrastructure/`       | `../../infrastructure/`                 |
| `../router/routes`         | `../../router/routes`                   |
| `../stores/`               | `../../stores/`                         |
| `../layouts`               | `../layouts` (unchanged)                |
| `../components/`           | `../components/` (unchanged)            |
