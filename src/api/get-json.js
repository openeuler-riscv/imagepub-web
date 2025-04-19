import request from "@/utils/request";
export const getProductList = () => {
    return request.get('/boards.json')
}

export const getProductVersion = () => {
    return request.get('/products/qemu/system.json')
}