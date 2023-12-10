import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.view.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/timevalue",
      name: "timevalue",
      component: () => import("../views/TimeValue.view.vue"),
    },
    {
      path: "/mortgage",
      name: "mortgage",
      component: () => import("../views/Mortgage.view.vue"),
    },
    {
      path: "/fields",
      name: "fields",
      component: () => import("../views/Fields.view.vue"),
    },
  ],
});

export default router;
