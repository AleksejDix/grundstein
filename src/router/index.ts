import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("../views/MortgageModern.view.vue"),
    },
    {
      path: "/portfolio",
      name: "portfolio",
      component: () => import("../views/DebtOverview.view.vue"),
    },
    {
      path: "/calculator",
      name: "calculator",
      component: () => import("../views/DebtCalculator.view.vue"),
    },
    {
      path: "/mortgage/:id?",
      name: "mortgage-details",
      component: () => import("../views/Mortgage.view.vue"),
    },
    {
      path: "/mortgage-calculator",
      name: "mortgage-calculator",
      component: () => import("../views/MortgageCalculator.view.vue"),
    },
  ],
});

export default router;
