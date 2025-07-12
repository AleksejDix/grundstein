/**
 * User Store
 *
 * Global user preferences and settings
 * Pure UI state only
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  // User preferences
  const locale = ref<"de" | "en">("de");
  const theme = ref<"light" | "dark">("light");
  const fontSize = ref<"small" | "medium" | "large">("medium");

  return {
    locale,
    theme,
    fontSize,
  };
});
