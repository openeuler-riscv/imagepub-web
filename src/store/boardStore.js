import { defineStore } from 'pinia';

export const useBoardStore = defineStore('board', {
    state: () => ({
        boardDetail: null
    }),
    actions: {
        setBoardDetail(detail) {
            this.boardDetail = detail;
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'boardStore', // 存储在本地存储中的键名
                storage: localStorage // 使用本地存储，也可以换成 sessionStorage
            }
        ]
    }
});