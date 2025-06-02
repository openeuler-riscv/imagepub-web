import { createRouter, createWebHistory } from "vue-router";
import { getCookie } from "@/utils/cookie.js";

const DEFAULT_LANG = 'zh_CN';

// 获取语言函数：优先从路由参数获取，其次从Cookie获取，最后使用默认值
function getLang(route) {
  return route.query.lang || getCookie('lang') || DEFAULT_LANG;
}

// 确保所有路由跳转都携带lang参数
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      redirect: (to) => {
        const lang = getLang(to);
        return { path: "/home", query: { lang } };
      }
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../pages/home/index.vue"),
      props: route => ({ lang: getLang(route) })
    },
    {
      path: "/board/:productUri(.*)",
      name: "board",
      component: () => import("../pages/board/index.vue"),
      props: (route) => ({
        productUri: route.params.productUri,
        lang: getLang(route)
      })
    },
    {
      path: "/image/:productUri(.*)/:version1/:version2/:date",
      name: "image",
      component: () => import("../pages/image/index.vue"),
      props: (route) => ({
        productUri: route.params.productUri,
        version1: route.params.version1,
        version2: route.params.version2,
        date: route.params.date,
        lang: getLang(route)
      })
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (!to.query.lang) {
    const lang = getLang(from);
    next({
      ...to,
      query: { ...to.query, lang }
    });
  } else {
    next();
  }
});

export default router;