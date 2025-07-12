import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

import router from "./router";
import { registerServiceWorker } from "./utils/serviceWorker";
import { performanceMonitor } from "./utils/performance";
import { errorLogger } from "./utils/errorLogger";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.directive("outline-fixer");

// Initialize error logging first
errorLogger.init();

// Global error handler for Vue
app.config.errorHandler = (err: unknown, instance, info) => {
  const error = err instanceof Error ? err : new Error(String(err));
  errorLogger.logError(error, {
    context: 'VueErrorHandler',
    info,
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
