import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "overview",
      component: () => import("../app/views/CashFlowDashboard.view.vue"),
    },
    {
      path: "/create",
      name: "create",
      component: () => import("../app/views/CreateMortgage.view.vue"),
    },
  ],
});

export default router;