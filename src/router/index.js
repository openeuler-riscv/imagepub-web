import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      redirect: (to) => {
        // 保留lang参数
        const lang = to.query.lang;
        return lang ? { path: "/home", query: { lang } } : "/home";
      }
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../pages/home/index.vue"),
      props: route => ({ lang: route.query.lang })
    },
    {
      path: "/board",
      name: "board",
      component: () => import("../pages/board/index.vue"),
      props: route => ({ lang: route.query.lang })
    },
    {
      path: "/image",
      name: "image",
      component: () => import("../pages/image/index.vue"),
      props: route => ({ lang: route.query.lang })
    }
  ]
});

export default router;
