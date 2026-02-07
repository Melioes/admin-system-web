import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // 1. 准备 Token
    const token = ref('')
    const refreshToken = ref('')

    // 💡 2. 追加：准备存储菜单数据
    // 这样侧边栏就可以通过 userStore.menuList 直接获取数据进行渲染
    const menuList = ref([])

    // 存储 Token 的方法
    const setTokens = (accessToken, refToken) => {
        token.value = accessToken
        refreshToken.value = refToken
    }

    // 💡 3. 追加：存储菜单的方法
    const setMenuList = (list) => {
        menuList.value = list
    }

    // 清除所有数据（登录失效或退出登录时调用）
    const removeToken = () => {
        token.value = ''
        refreshToken.value = ''
        menuList.value = [] // 💡 清除 Token 时顺便清空菜单
    }

    // 记得把新定义的变量和方法 return 出去
    return {
        token,
        refreshToken,
        menuList,
        setTokens,
        setMenuList,
        removeToken
    }
}, {
    persist: true // 💡 依然开启持久化，menuList 会自动保存到 localStorage/sessionStorage
})