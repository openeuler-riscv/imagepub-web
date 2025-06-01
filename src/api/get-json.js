import request from "@/utils/request";
import {useRoute} from "vue-router";

const route = useRoute();

export const getProductList = () => {
    return request.get('/v2/zh_CN/boards.json')
}

export const getProductVersion = () => {
    return request.get('/products/qemu/system.json')
}

export const fetchBoardDetail = async (productUri) => {
    const response = await fetch(`/${productUri}`);
    if (!response.ok) throw new Error(`请求失败，状态码: ${response.status}`);
    return response.json();
};