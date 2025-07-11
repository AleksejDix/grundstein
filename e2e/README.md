# E2E Testing with Playwright

This directory contains end-to-end tests for the Grundstein Mortgage Portfolio Management application.

## Structure

```
e2e/
├── page-objects/           # Page Object Models for maintainable tests
│   ├── CreateMortgagePage.ts
│   └── PortfolioModal.ts
├── fixtures/              # Test data and utilities
│   └── mortgage-data.ts
├── create-mortgage.spec.ts          # Basic E2E tests
├── create-mortgage-improved.spec.ts # Enhanced tests with page objects
└── README.md
```

## Running Tests

### Prerequisites

- Ensure the development server is running: `npm run dev`
- Install Playwright browsers: `npx playwright install`

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test create-mortgage.spec.ts

# Run improved tests only
npx playwright test create-mortgage-improved.spec.ts

# Run tests in headed mode (with browser UI)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
```

## Test Coverage

### Create Mortgage Tests

- ✅ Form display and validation
- ✅ Default values and field visibility
- ✅ Mortgage calculations (German and Swiss markets)
- ✅ Required field validation with specific error messages
- ✅ Form reset functionality
- ✅ Portfolio creation workflow
- ✅ Different fixed rate periods
- ✅ High-value and low-value mortgages
- ✅ Past start dates and elapsed months
- ✅ Edge cases (very high/low payments)
- ✅ Currency formatting
- ✅ Detailed calculation breakdown

### Page Objects

- **CreateMortgagePage**: Main form interactions and validations
- **PortfolioModal**: Portfolio selection modal
- **CreatePortfolioModal**: Portfolio creation modal

### Test Data

- Standard German mortgage scenarios
- Swiss mortgage scenarios
- High/low value mortgages
- Edge cases and validation scenarios
- Portfolio creation data

## Best Practices

1. **Page Object Model**: All tests use page objects for maintainability
2. **Test Data**: Centralized test data in fixtures
3. **Explicit Waits**: Use `expect()` with timeout for async operations
4. **Error Handling**: Proper validation of error messages and edge cases
5. **Reusable Components**: Modular page objects for different UI components

## Configuration

Tests are configured via `playwright.config.ts`:

- Base URL: `http://localhost:5173`
- Browsers: Chrome, Firefox, Safari
- Timeout: 30 seconds per test
- Retry: 2 retries on CI

## CI/CD Integration

Tests run automatically on CI with:

- Headless mode enabled
- HTML reporter for results
- Test artifacts (screenshots, videos) on failure
- Parallel execution disabled for stability

## Adding New Tests

1. Create test data in `fixtures/mortgage-data.ts`
2. Add page object methods if needed
3. Write test using page objects
4. Follow naming convention: `feature-name.spec.ts`
5. Include proper test descriptions and assertions

## Debugging

- Use `--debug` flag to step through tests
- Add `await page.pause()` for breakpoints
- Use `--headed` to see browser actions
- Check HTML report for detailed failure information
