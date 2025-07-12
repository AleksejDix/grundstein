/**
 * Simplified Layout System
 * 
 * Single layout approach for MVP - one simple, flexible layout for all pages
 */

// The only layout we need
export { default as SimpleLayout } from "./SimpleLayout.vue";

// Legacy exports for compatibility during transition
export { default as BaseLayout } from "./SimpleLayout.vue";
export { default as DefaultLayout } from "./SimpleLayout.vue";
export { default as CenteredLayout } from "./SimpleLayout.vue";
export { default as FullWidthLayout } from "./SimpleLayout.vue";
export { default as SidebarLayout } from "./SimpleLayout.vue";
export { default as DashboardLayout } from "./SimpleLayout.vue";
export { default as FormLayout } from "./SimpleLayout.vue";
export { default as DetailLayout } from "./SimpleLayout.vue";

/**
 * Usage:
 * 
 * <SimpleLayout>
 *   <template #header>
 *     <PageHeader title="Page Title" />
 *   </template>
 *   <div>Your content here</div>
 * </SimpleLayout>
 * 
 * Features:
 * - Single column design
 * - Max width container (5xl = 1024px)
 * - Navigation header
 * - Optional page header slot
 * - Optional footer
 * - Responsive padding
 * - Clean, simple design
 */