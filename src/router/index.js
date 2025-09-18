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
      props: route => ({ lang: getLang(route) })
    },
    {
      path: "/board/:vendor/:product",
      name: "board",
      component: () => import("../pages/board/index.vue"),
      props: (route) => {
        return ({
        /* "v2/zh_CN/products/milkv/pioneer.json" */
        productUri:  `v2/${getLang(route)}/products/${route.params.vendor}/${route.params.product}.json` ,
        vendor:route.params.vendor,
        product:route.params.product,
        lang: getLang(route)
      })
      }
      
    },
    {
      path: "/release/:distro/:distro_rel/:vendor/:product/:image_receipe/",
      name: "image",
      component: () => import("../pages/image/index.vue"),
      props: (route) => ({
        productUri:  `v2/${getLang(route)}/products/${route.params.vendor}/${route.params.product}.json` ,
        version1: route.params.distro,
        version2: route.params.distro_rel,
        imagesuiteIndex:route.params.image_receipe,
        lang: getLang(route)
      })
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' // 重定向到首页
    }
  ]
});



router.beforeEach((to, from, next) => {

  //const redirectPath = to.query.redirectPath;
  
  // if (redirectPath) {
  //   // 复制查询参数并移除redirectPath
  //   const query = { ...to.query };
  //   delete query.redirectPath;
    
  //   // 跳转到原始请求的深层路由
  //   return next({
  //     path: '/' + redirectPath,
  //     query,
  //     hash: to.hash
  //   });
  // }


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