import request from "@/utils/request";
export const getProductList = () => {
    return request.get('/boards.json')
}