import { createRouter, createWebHistory } from "vue-router";
import { getCookie } from "@/utils/cookie.js";

const DEFAULT_LANG = 'zh_CN';

// 获取语言函数：优先从路由参数获取，其次从Cookie获取，最后使用默认值
function getLang(route) {
  // console.log(route.query.lang || getCookie('lang') || DEFAULT_LANG)
  return route.query.lang || getCookie('lang') || DEFAULT_LANG;
}

// 确保所有路由跳转都携带lang参数
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "",
      name: "root",
      component: () => import("../pages/home/index.vue"),
      props: route => ({ lang: getLang(route) }),
      // redirect: (to) => {
      //   const lang = getLang(to);
      //   return { path: "/", query: { lang } };
      // }
    },
    {
      path: "/board/:vendor/:product",
      name: "board",
      component: () => import("../pages/board/index.vue"),
      props: (route) => {
        return ({
        /* "v2/zh_CN/products/milkv/pioneer.json" */
        productUri:  `v2/${getLang(route)}/products/${route.params.vendor}/${route.params.product}.json` ,
        lang: getLang(route)
      })
      }
      
    },
    {
      path: "/release/:distro/:distro_rel/:vendor/:product/:image_receipe/",
      name: "image",
      component: () => import("../pages/image/index.vue"),
      props: (route) => ({
        productUri: route.params.product,
        version1: route.params.distro,
        version2: route.params.distro_rel,
        // date: route.params.date,
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