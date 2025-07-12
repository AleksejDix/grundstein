import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import App from "./App.vue";

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { errorLogger } from "./utils/errorLogger";
import { performanceMonitor } from "./utils/performance";
import { registerServiceWorker } from "./utils/serviceWorker";

import "./assets/main.css";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

app.use(pinia);
app.use(router);
app.directive("outline-fixer");

// Initialize error logging first
errorLogger.init();

// Global error handler for Vue
app.config.errorHandler = (err: unknown, instance, _info) => {
  const error = err instanceof Error ? err : new Error(String(err));
  errorLogger.logError(error, {
    context: "VueErrorHandler",
    instance: instance?.$.type?.name,
  });
};

app.mount("#app");

if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Initialize performance monitoring
performanceMonitor.init();

// Track route changes for performance monitoring
router.afterEach((to) => {
  performanceMonitor.trackRouteChange(to.path);
});
