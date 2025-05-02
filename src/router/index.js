import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      redirect: "/home"
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../pages/home/index.vue")
    },
    {
      path: "/board",
      name: "board",
      component: () => import("../pages/board/index.vue")
    },
    {
      path: "/image",
      name: "image",
      component: () => import("../pages/image/index.vue")
    }
  ]
});

export default router;
