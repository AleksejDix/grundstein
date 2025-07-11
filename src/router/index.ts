import { createRouter, createWebHistory } from "vue-router";
import { ROUTE_NAMES } from "./routes";

/**
 * RESTful Resource-Based Routing
 * Following Laravel/Rails conventions for scalable routing
 *
 * Resource naming conventions:
 * - GET    /resources         -> resources.index
 * - GET    /resources/create  -> resources.create
 * - POST   /resources         -> resources.store
 * - GET    /resources/:id     -> resources.show
 * - GET    /resources/:id/edit -> resources.edit
 * - PUT    /resources/:id     -> resources.update
 * - DELETE /resources/:id     -> resources.destroy
 */

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Dashboard (root)
    {
      path: "/",
      name: ROUTE_NAMES.DASHBOARD.INDEX,
      component: () => import("../views/CashFlowDashboard.view.vue"),
    },

    // Portfolio Resource Routes
    {
      path: "/portfolios",
      name: ROUTE_NAMES.PORTFOLIOS.INDEX,
      component: () => import("../views/PortfolioDashboard.view.vue"),
    },
    {
      path: "/portfolios/create",
      name: ROUTE_NAMES.PORTFOLIOS.CREATE,
      component: () => import("../views/PortfolioCreate.view.vue"),
    },
    {
      path: "/portfolios/:id",
      name: ROUTE_NAMES.PORTFOLIOS.SHOW,
      component: () => import("../views/PortfolioDetail.view.vue"),
    },
    {
      path: "/portfolios/:id/edit",
      name: ROUTE_NAMES.PORTFOLIOS.EDIT,
      component: () => import("../views/PortfolioEdit.view.vue"),
    },

    // Mortgage Resource Routes
    {
      path: "/mortgages",
      name: ROUTE_NAMES.MORTGAGES.INDEX,
      component: () => import("../views/MortgageIndex.view.vue"),
    },
    {
      path: "/mortgages/create",
      name: ROUTE_NAMES.MORTGAGES.CREATE,
      component: () => import("../views/CreateMortgage.view.vue"),
    },
    {
      path: "/mortgages/:id",
      name: ROUTE_NAMES.MORTGAGES.SHOW,
      component: () => import("../views/MortgageDetailView.vue"),
    },
    {
      path: "/mortgages/:id/edit",
      name: ROUTE_NAMES.MORTGAGES.EDIT,
      component: () => import("../views/MortgageEdit.view.vue"),
    },

    // Nested Resource: Portfolio Mortgages
    {
      path: "/portfolios/:portfolioId/mortgages",
      name: ROUTE_NAMES.PORTFOLIOS.MORTGAGES.INDEX,
      component: () => import("../views/PortfolioMortgageIndex.view.vue"),
    },
    {
      path: "/portfolios/:portfolioId/mortgages/create",
      name: ROUTE_NAMES.PORTFOLIOS.MORTGAGES.CREATE,
      component: () => import("../views/PortfolioMortgageCreate.view.vue"),
    },

    // Legacy routes (to be deprecated)
    {
      path: "/old-calculator",
      name: ROUTE_NAMES.LEGACY.CALCULATOR,
      component: () => import("../views/MortgageModern.view.vue"),
    },
    {
      path: "/mortgage-calculator",
      name: ROUTE_NAMES.LEGACY.MORTGAGE_CALCULATOR,
      component: () => import("../views/MortgageCalculator.view.vue"),
    },

    // Compatibility redirects
    {
      path: "/portfolio",
      redirect: "/portfolios",
    },
    {
      path: "/create-mortgage",
      redirect: "/mortgages/create",
    },
    {
      path: "/mortgage/:id",
      redirect: (to) => `/mortgages/${to.params.id}`,
    },
    {
      path: "/mortgage-detail",
      redirect: "/mortgages/demo-berlin-apartment",
    },
  ],
});

export default router;
