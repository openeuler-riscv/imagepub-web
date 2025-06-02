import request from "@/utils/request";
import {useRoute} from "vue-router";
import {getCookie} from "@/utils/cookie.js";


export const getProductList = () => {
    let lang = getCookie("lang");
    if (!lang) {
        lang = "zh_CN"; //默认中文
    }
    console.log("lag",lang);
    return request.get(`/v2/${lang}/boards.json`);
}

export const getProductVersion = () => {
    return request.get('/products/qemu/system.json')
}