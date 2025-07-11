/**
 * Layout System
 *
 * Provides a comprehensive layout system for the application with different
 * layout types optimized for specific use cases.
 */

// Base Layout
export { default as BaseLayout } from "./BaseLayout.vue";

// General Purpose Layouts
export { default as DefaultLayout } from "./DefaultLayout.vue";
export { default as CenteredLayout } from "./CenteredLayout.vue";
export { default as FullWidthLayout } from "./FullWidthLayout.vue";
export { default as SidebarLayout } from "./SidebarLayout.vue";

// Specialized Layouts
export { default as DashboardLayout } from "./DashboardLayout.vue";
export { default as FormLayout } from "./FormLayout.vue";
export { default as DetailLayout } from "./DetailLayout.vue";

/**
 * Layout Usage Guide:
 *
 * 1. BaseLayout - Core layout with navigation and footer
 *    - Use when you need full control over content structure
 *    - Provides navigation and optional footer
 *
 * 2. DefaultLayout - Standard page layout with max-width container
 *    - Use for most standard pages
 *    - Provides consistent spacing and max-width
 *
 * 3. CenteredLayout - Narrower centered layout
 *    - Use for forms, articles, or focused content
 *    - Max width of 4xl instead of 7xl
 *
 * 4. FullWidthLayout - Full-width layout with minimal padding
 *    - Use for tables, charts, or content that needs full width
 *    - Still has some padding for mobile
 *
 * 5. SidebarLayout - Two-column layout with sidebar
 *    - Use for documentation, settings, or filtered content
 *    - Sidebar is sticky and collapses on mobile
 *
 * 6. DashboardLayout - Complex dashboard layout
 *    - Use for dashboards and analytics pages
 *    - Provides slots for metrics, quick actions, and grid content
 *
 * 7. FormLayout - Optimized for forms
 *    - Use for create/edit forms
 *    - Provides styled form container with header/footer slots
 *
 * 8. DetailLayout - Optimized for detail pages
 *    - Use for showing detailed information about entities
 *    - Provides metrics row, primary content, and sidebar
 *
 * Examples:
 *
 * <DefaultLayout>
 *   <PageHeader title="Page Title" />
 *   <div>Content here</div>
 * </DefaultLayout>
 *
 * <FormLayout>
 *   <template #header>
 *     <h1>Create New Item</h1>
 *   </template>
 *   <form>...</form>
 * </FormLayout>
 *
 * <DashboardLayout>
 *   <template #header>
 *     <PageHeader title="Dashboard" />
 *   </template>
 *   <template #metrics>
 *     <MetricCard ... />
 *   </template>
 *   <template #primary>
 *     <div>Primary content</div>
 *   </template>
 *   <template #secondary>
 *     <div>Secondary content</div>
 *   </template>
 * </DashboardLayout>
 */
