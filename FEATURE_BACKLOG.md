# Mortgage Portfolio Management - Feature Backlog

**Project**: Grundstein Mortgage Calculator  
**Target Market**: German Market (DE) with extensible architecture  
**Architecture**: Domain-Driven Design with Functional Programming  
**Created**: 2025-07-12

## Executive Summary

This backlog defines 10 incremental, customer-facing features that build upon the robust domain layer (400+ tests) to create a complete mortgage calculator experience. Each feature is designed to be deliverable within 1-3 days and provides immediate customer value while building toward comprehensive portfolio management.

**Current State Analysis:**

- ✅ **Domain Layer**: Robust with 400+ tests covering all mortgage calculations
- ✅ **Application Layer**: MortgageService and MortgageAdapter ready for UI integration
- ✅ **Infrastructure**: Vue 3 + Tailwind CSS + Chart.js setup complete
- ❌ **Presentation Layer**: Minimal - only placeholder pages exist
- ✅ **German Market Features**: Sondertilgung, BaFin compliance, EUR formatting

## Feature Prioritization Strategy

**Build Foundation → Add Complexity → Enable Advanced Workflows**

1. **Foundation Features (F1-F3)**: Basic input, calculation, and display
2. **Core Features (F4-F6)**: Interactive editing, extra payments, visualizations
3. **Advanced Features (F7-F10)**: Portfolio management, optimization, persistence

---

## Feature Definitions

### F1: Basic Mortgage Input Form

**Priority**: P0 (Must Have)  
**Effort**: 2-3 days  
**Dependencies**: None

#### User Story

As a **prospective homebuyer**, I want to **input basic mortgage parameters** so that I can **get an initial payment calculation**.

#### Acceptance Criteria

- [ ] Input form with loan amount, interest rate, and term (years or months)
- [ ] German locale formatting (EUR currency, decimal comma)
- [ ] Real-time validation using domain types (LoanAmount, InterestRate, MonthCount)
- [ ] Error messages in German for invalid inputs
- [ ] Responsive design for mobile and desktop
- [ ] Basic payment calculation display (monthly payment only)

#### Technical Implementation

- **Components**: `MortgageInputForm.vue`, `FormField.vue`, `CurrencyInput.vue`
- **Domain Integration**: Use `useMortgageAdapter()` composable
- **Validation**: Leverage domain type validation (createLoanAmount, createInterestRate)
- **Styling**: Tailwind CSS with German design patterns

#### Definition of Done

- Form accepts valid German mortgage parameters (€50K-€2M, 0.1%-15%, 5-40 years)
- Displays monthly payment in correct EUR format (€1.234,56)
- Shows validation errors for edge cases
- Works on mobile devices (responsive design)
- No TypeScript errors, 90%+ test coverage

---

### F2: Payment Breakdown Display

**Priority**: P0 (Must Have)  
**Effort**: 1-2 days  
**Dependencies**: F1

#### User Story

As a **mortgage applicant**, I want to **see how my monthly payment breaks down** so that I can **understand principal vs interest allocation**.

#### Acceptance Criteria

- [ ] Monthly payment breakdown (principal, interest, total)
- [ ] First year summary (total payments, interest, principal, ending balance)
- [ ] Principal percentage calculation and display
- [ ] German formatting for all financial figures
- [ ] Responsive card layout

#### Technical Implementation

- **Components**: `PaymentBreakdown.vue`, `FinancialSummary.vue`
- **Domain Integration**: Use `MonthlyPayment` domain type from calculations
- **Data Flow**: `MortgageAdapter.presentation` computed property
- **Formatting**: `formatEuros()` and `formatPercentage()` from adapter

#### Definition of Done

- Shows accurate payment breakdown for €100K @ 5.6% = €1,441.76/month
- Displays principal percentage (starts ~67% for German mortgages)
- All currency formatted correctly (€1.234,56)
- First year projections accurate
- Visual hierarchy clear and accessible

---

### F3: Interactive Parameter Locking

**Priority**: P0 (Must Have)  
**Effort**: 2-3 days  
**Dependencies**: F1, F2

#### User Story

As a **mortgage calculator user**, I want to **lock any parameter and have others recalculate** so that I can **explore different scenarios with constraints**.

#### Acceptance Criteria

- [ ] Lock/unlock toggles for amount, rate, term, and payment
- [ ] Automatic recalculation when unlocked parameters change
- [ ] Visual indication of locked vs calculated parameters
- [ ] Prevent impossible combinations (e.g., payment too low)
- [ ] Smart defaults for German mortgage scenarios

#### Technical Implementation

- **State Management**: Reactive lock state in `useMortgageAdapter`
- **Calculation Logic**: Use domain calculation functions for reverse calculations
- **UI Components**: `LockableInput.vue` with lock icon toggle
- **Domain Integration**: `calculateLoanTerm()`, `calculateMonthlyPayment()` functions

#### Definition of Done

- Can lock payment and calculate required term (reverse calculation)
- Can lock term and calculate required payment (forward calculation)
- Handles edge cases gracefully (payment too low, term too long)
- Visual feedback for locked parameters
- Maintains German mortgage conventions

---

### F4: Editable Results with Live Updates

**Priority**: P1 (Should Have)  
**Effort**: 2-3 days  
**Dependencies**: F1, F2, F3

#### User Story

As a **mortgage shopper**, I want to **directly edit calculated values** so that I can **quickly adjust scenarios without going back to input forms**.

#### Acceptance Criteria

- [ ] Click-to-edit functionality for payment breakdown values
- [ ] Inline editing with validation and immediate feedback
- [ ] Auto-save behavior (immediate recalculation)
- [ ] Undo/reset capability for accidental changes
- [ ] German keyboard support (decimal comma)

#### Technical Implementation

- **Components**: `EditableAmount.vue`, `EditableNumber.vue` (reusable)
- **State Management**: Optimistic updates with validation rollback
- **Domain Integration**: Use Result types for validation feedback
- **UX Pattern**: Double-click to edit, Enter to save, Escape to cancel

#### Definition of Done

- Can edit monthly payment and see term recalculate
- Can edit loan amount and see payment recalculate
- Validation prevents invalid states
- Smooth UX with loading states
- Keyboard navigation accessible

---

### F5: Sondertilgung (Extra Payments) Calculator

**Priority**: P1 (Should Have)  
**Effort**: 3 days  
**Dependencies**: F1, F2, F3

#### User Story

As a **German mortgage holder**, I want to **plan extra payments (Sondertilgung)** so that I can **reduce my total interest and pay off early**.

#### Acceptance Criteria

- [ ] Add extra payments by month/year with amount
- [ ] Percentage limits (5%, 10%, 20%, unlimited) per German banking rules
- [ ] Impact calculation (interest saved, term reduction)
- [ ] Multiple extra payment scenarios
- [ ] Validation against yearly Sondertilgung limits

#### Technical Implementation

- **Domain Integration**: Use `SondertilgungPlan` and `calculateSondertilgungImpact()`
- **Components**: `ExtraPaymentPlanner.vue`, `SondertilgungRules.vue`
- **Business Logic**: German market compliance (BaFin regulations)
- **State Management**: Extra payments as array in adapter

#### Definition of Done

- Can add €5,000 extra payment in month 24
- Shows impact: €X interest saved, Y months earlier payoff
- Enforces 5% yearly limit by default (configurable to 10%, 20%, unlimited)
- Validates payment timing and amounts
- Clear visualization of savings

---

### F6: Payment Schedule Visualization

**Priority**: P1 (Should Have)  
**Effort**: 2-3 days  
**Dependencies**: F2, F5

#### User Story

As a **mortgage analyst**, I want to **visualize my payment schedule over time** so that I can **see how principal/interest balance changes**.

#### Acceptance Criteria

- [ ] Interactive chart showing principal vs interest over time
- [ ] Zoom functionality for different time periods (1yr, 5yr, full term)
- [ ] Extra payments highlighted on timeline
- [ ] Responsive design for mobile viewing
- [ ] Export capability (PNG/PDF)

#### Technical Implementation

- **Charting**: Chart.js/vue-chartjs with Vue 3 support
- **Data Source**: `generateAmortizationSchedule()` from domain layer
- **Components**: `AmortizationChart.vue`, `ChartControls.vue`
- **Performance**: Virtualization for long-term mortgages (40 years)

#### Definition of Done

- Chart displays accurate amortization curve
- Shows crossover point where principal > interest
- Extra payments visible as spikes/annotations
- Smooth zooming and panning
- Mobile responsive with touch gestures

---

### F7: Mortgage Scenarios Comparison

**Priority**: P2 (Could Have)  
**Effort**: 3 days  
**Dependencies**: F1, F2, F3, F5

#### User Story

As a **mortgage shopper**, I want to **compare different mortgage scenarios side-by-side** so that I can **make informed decisions about terms and lenders**.

#### Acceptance Criteria

- [ ] Add/remove multiple mortgage scenarios
- [ ] Side-by-side comparison table
- [ ] Key metrics comparison (total interest, monthly payment, term)
- [ ] Scenario naming and saving
- [ ] Best/worst scenario highlighting

#### Technical Implementation

- **State Management**: Scenario array in Pinia store
- **Components**: `ScenarioComparison.vue`, `ScenarioCard.vue`
- **Domain Integration**: Use `compareScenarios()` from MortgageService
- **Persistence**: LocalStorage for temporary scenario saving

#### Definition of Done

- Can compare 3+ mortgage scenarios simultaneously
- Clear visual hierarchy for comparison metrics
- Ability to clone and modify existing scenarios
- Highlights best scenario based on user priorities
- Scenarios persist during browser session

---

### F8: Portfolio Dashboard

**Priority**: P2 (Could Have)  
**Effort**: 2-3 days  
**Dependencies**: F7

#### User Story

As a **property investor**, I want to **see an overview of all my mortgages** so that I can **manage my portfolio efficiently**.

#### Acceptance Criteria

- [ ] Portfolio summary (total loan amounts, monthly payments, equity)
- [ ] Individual mortgage cards with key metrics
- [ ] Add/edit/delete mortgages in portfolio
- [ ] Portfolio-wide optimizations and recommendations
- [ ] German tax implications display

#### Technical Implementation

- **Domain Layer**: `MortgagePortfolio` entity (already exists)
- **Components**: `PortfolioDashboard.vue`, `MortgageCard.vue`, `PortfolioMetrics.vue`
- **State Management**: Portfolio store with CRUD operations
- **Business Logic**: Portfolio-level calculations and analysis

#### Definition of Done

- Displays multiple mortgages in clean dashboard layout
- Portfolio totals calculated correctly
- Can add new mortgage from dashboard
- Individual mortgage quick actions (edit, delete, analyze)
- Performance optimized for 10+ mortgages

---

### F9: Optimization Recommendations Engine

**Priority**: P2 (Could Have)  
**Effort**: 3 days  
**Dependencies**: F5, F7, F8

#### User Story

As a **mortgage portfolio owner**, I want to **receive optimization recommendations** so that I can **reduce costs and improve my financial position**.

#### Acceptance Criteria

- [ ] Refinancing opportunity detection
- [ ] Optimal extra payment allocation across portfolio
- [ ] Debt avalanche vs snowball strategy comparison
- [ ] Interest rate sensitivity analysis
- [ ] Personalized action recommendations

#### Technical Implementation

- **Domain Logic**: Portfolio optimization algorithms
- **Components**: `OptimizationEngine.vue`, `RecommendationCard.vue`
- **Analysis**: Use existing calculation functions for scenario modeling
- **ML/Rules**: Simple rule-based recommendations (extensible to ML)

#### Definition of Done

- Identifies refinancing opportunities when rates drop 0.5%+
- Recommends optimal Sondertilgung allocation across mortgages
- Quantifies potential savings for each recommendation
- Prioritizes recommendations by impact and effort
- Clear action steps for each recommendation

---

### F10: Data Persistence and Sharing

**Priority**: P3 (Nice to Have)  
**Effort**: 2-3 days  
**Dependencies**: F8

#### User Story

As a **mortgage calculator user**, I want to **save my scenarios and share them** so that I can **collaborate with advisors and family members**.

#### Acceptance Criteria

- [ ] Save/load mortgage scenarios to browser storage
- [ ] Export scenarios as PDF reports
- [ ] Share scenarios via URL (read-only)
- [ ] Import/export as JSON for backup
- [ ] Data privacy compliance (GDPR)

#### Technical Implementation

- **Persistence**: LocalStorage with data migration strategy
- **Export**: PDF generation with mortgage calculation summaries
- **Sharing**: URL-based scenario sharing with data compression
- **Privacy**: No personal data stored, only calculation parameters

#### Definition of Done

- Scenarios persist across browser sessions
- Can generate professional PDF mortgage analysis
- Shareable URLs work for read-only viewing
- Export/import maintains data integrity
- Complies with German data protection requirements

---

## Implementation Timeline

### Sprint 1 (Week 1): Foundation

- **Days 1-3**: F1 - Basic Mortgage Input Form
- **Days 4-5**: F2 - Payment Breakdown Display

### Sprint 2 (Week 2): Interactivity

- **Days 1-3**: F3 - Interactive Parameter Locking
- **Days 4-6**: F4 - Editable Results with Live Updates

### Sprint 3 (Week 3): German Features

- **Days 1-3**: F5 - Sondertilgung Calculator
- **Days 4-6**: F6 - Payment Schedule Visualization

### Sprint 4 (Week 4): Portfolio Features

- **Days 1-3**: F7 - Mortgage Scenarios Comparison
- **Days 4-6**: F8 - Portfolio Dashboard

### Sprint 5 (Week 5): Advanced Features

- **Days 1-3**: F9 - Optimization Recommendations Engine
- **Days 4-6**: F10 - Data Persistence and Sharing

## Success Metrics

### User Experience

- **Usability**: Complete mortgage calculation in < 2 minutes
- **Accuracy**: Domain calculations match real banking scenarios
- **Performance**: Sub-500ms response time for all calculations
- **Accessibility**: WCAG 2.1 AA compliance

### Technical Quality

- **Test Coverage**: 90%+ for all new UI components
- **Type Safety**: Zero TypeScript errors in production
- **Domain Integration**: No primitive obsession in presentation layer
- **Performance**: < 100KB bundle size for initial feature set

### Business Value

- **German Market**: Full compliance with BaFin mortgage regulations
- **User Retention**: Saved scenarios persist across sessions
- **Feature Adoption**: 80%+ of users try Sondertilgung calculator
- **Platform Foundation**: Architecture supports multi-currency expansion

## Risk Mitigation

### Technical Risks

- **Domain Integration Complexity**: Mitigated by robust MortgageAdapter layer
- **Chart Performance**: Addressed with data virtualization for long schedules
- **Mobile Responsiveness**: Ensured through mobile-first design approach

### Product Risks

- **Feature Complexity**: Each feature independently valuable and testable
- **User Adoption**: German-specific features differentiate from generic calculators
- **Scope Creep**: Clear acceptance criteria and definition of done for each feature

## Dependencies and Assumptions

### External Dependencies

- Vue 3 Composition API (stable)
- Chart.js 4.x (stable)
- Tailwind CSS 3.x (stable)

### Internal Dependencies

- Domain layer stability (✅ Complete with 400+ tests)
- MortgageService API (✅ Ready for integration)
- German locale support (✅ Built into domain types)

### Assumptions

- German market focus remains primary target
- Users have basic mortgage knowledge
- Browser support: Modern browsers with ES2020 support
- No server-side persistence required initially

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-12  
**Next Review**: After Sprint 1 completion
