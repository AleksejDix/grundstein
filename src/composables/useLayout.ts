import { ref, computed } from "vue";

/**
 * Layout Composable
 *
 * Provides utilities for managing layout state and responsive behavior.
 */

// Global layout state
const isSidebarOpen = ref(false);
const currentBreakpoint = ref("lg");

export function useLayout() {
  // Breakpoint detection
  const isDesktop = computed(() =>
    ["lg", "xl", "2xl"].includes(currentBreakpoint.value)
  );
  const isTablet = computed(() => currentBreakpoint.value === "md");
  const isMobile = computed(() =>
    ["sm", "xs"].includes(currentBreakpoint.value)
  );

  // Sidebar management
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const openSidebar = () => {
    isSidebarOpen.value = true;
  };

  // Layout utilities
  const getContainerClasses = (
    type: "default" | "centered" | "full" | "narrow" = "default"
  ) => {
    const base = "mx-auto px-4 sm:px-6 lg:px-8";

    switch (type) {
      case "centered":
        return `${base} max-w-4xl`;
      case "full":
        return "px-4 sm:px-6 lg:px-8";
      case "narrow":
        return `${base} max-w-2xl`;
      default:
        return `${base} max-w-7xl`;
    }
  };

  const getGridClasses = (
    columns: number = 1,
    breakpoint: "sm" | "md" | "lg" | "xl" = "md"
  ) => {
    const baseClasses = "grid gap-6";

    if (columns === 1) return `${baseClasses} grid-cols-1`;
    if (columns === 2)
      return `${baseClasses} grid-cols-1 ${breakpoint}:grid-cols-2`;
    if (columns === 3)
      return `${baseClasses} grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-3`;
    if (columns === 4)
      return `${baseClasses} grid-cols-1 ${breakpoint}:grid-cols-2 lg:grid-cols-4`;

    return baseClasses;
  };

  // Responsive utilities
  const updateBreakpoint = (width: number) => {
    if (width >= 1536) currentBreakpoint.value = "2xl";
    else if (width >= 1280) currentBreakpoint.value = "xl";
    else if (width >= 1024) currentBreakpoint.value = "lg";
    else if (width >= 768) currentBreakpoint.value = "md";
    else if (width >= 640) currentBreakpoint.value = "sm";
    else currentBreakpoint.value = "xs";
  };

  // Initialize breakpoint detection
  if (typeof window !== "undefined") {
    updateBreakpoint(window.innerWidth);

    window.addEventListener("resize", () => {
      updateBreakpoint(window.innerWidth);
    });
  }

  return {
    // State
    isSidebarOpen,
    currentBreakpoint,

    // Computed
    isDesktop,
    isTablet,
    isMobile,

    // Methods
    toggleSidebar,
    closeSidebar,
    openSidebar,
    getContainerClasses,
    getGridClasses,
    updateBreakpoint,
  };
}

/**
 * Layout Configuration Types
 */
export type LayoutType =
  | "default"
  | "centered"
  | "fullWidth"
  | "sidebar"
  | "dashboard"
  | "form"
  | "detail";

export interface LayoutConfig {
  type: LayoutType;
  showFooter?: boolean;
  containerType?: "default" | "centered" | "full" | "narrow";
  sidebarWidth?: "narrow" | "default" | "wide";
}

/**
 * Layout Presets
 */
export const layoutPresets: Record<string, LayoutConfig> = {
  // Page types
  home: { type: "dashboard", showFooter: true },
  list: { type: "default" },
  create: { type: "form", containerType: "centered" },
  edit: { type: "form", containerType: "centered" },
  detail: { type: "detail" },

  // Special layouts
  docs: { type: "sidebar", containerType: "default" },
  settings: { type: "sidebar", containerType: "default" },
  analytics: { type: "dashboard", containerType: "full" },

  // Full width layouts
  table: { type: "fullWidth" },
  chart: { type: "fullWidth" },

  // Centered layouts
  auth: { type: "centered", containerType: "narrow" },
  article: { type: "centered", containerType: "centered" },
};

export function getLayoutConfig(preset: string): LayoutConfig {
  return layoutPresets[preset] || layoutPresets.list;
}
