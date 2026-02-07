import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

// 💡 1. 独立实例：专门用于刷新 Token，避免请求拦截器逻辑冲突
const refreshInstance = axios.create({
    baseURL: '/api' // 确保与 request 实例一致
})

const request = axios.create({
    baseURL: '/api',
    timeout: 5000
})

let isRefreshing = false // 标记是否正在刷新中
let requestsQueue = [] // 存储因为 401 而挂起的请求队列

// --- 请求拦截器 ---
request.interceptors.request.use(config => {
    const userStore = useUserStore()
    if (userStore.token) {
        config.headers['token'] = userStore.token
    }
    return config
}, error => Promise.reject(error))

// --- 响应拦截器 ---
request.interceptors.response.use(response => {
    const res = response.data || {}
        // 业务 code 校验
    if (res.code !== 200) {
        ElMessage.error(res.msg || '服务器开小差了')
        return Promise.reject(new Error(res.msg))
    }
    return res
}, async error => {
    const { config, response } = error
    console.log(error, 'error');

    console.log(config, 'config');
    console.log(response, 'response');

    const userStore = useUserStore()

    // 💡 1. 核心：处理 401 自动续期
    if (response && response.status === 401 && !config.url.includes('/refresh')) {

        if (!isRefreshing) {
            isRefreshing = true

            try {
                // 💡 2. 发起换票请求
                const res = await refreshInstance.post('/refresh', {
                        refreshToken: userStore.refreshToken
                    })
                    // console.log('res', res);

                // 此时 res.data 就是你看到的那个 {code: 401, msg: "...", data: null}
                if (res.data.code !== 200) {
                    // 如果 code 不等于 200，说明长票也过期了
                    // 抛出错误，代码会直接跳到下面的 catch 块，从而停止死循环
                    throw new Error(res.data.msg || 'RefreshToken Expired')
                }

                // 💡 4. 只有 code 等于 200，才执行更新和重试
                const newAccessToken = res.data.data
                    // console.log('newAccessToken', newAccessToken);

                userStore.token = newAccessToken

                requestsQueue.forEach(callback => callback(newAccessToken))
                requestsQueue = []

                config.headers['token'] = newAccessToken
                return request(config)

            } catch (refreshError) {
                // 💡 5. 换票彻底失败（长票过期），清理数据并跳转
                console.warn('--- 长票已失效，跳转登录页 ---')
                userStore.removeToken()
                router.push('/login')
                ElMessage.error('身份已过期，请重新登录')
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        } else {
            // 💡 6. 正在刷新中，挂起请求
            return new Promise(resolve => {
                requestsQueue.push(newToken => {
                    config.headers['token'] = newToken
                    resolve(request(config))
                })
            })
        }
    }

    // 💡 7. 兜底错误提示（使用兼容性写法防止插件加空格）
    const errorMsg = (error.response && error.response.data && error.response.data.msg) || '系统繁忙，请稍后再试';
    ElMessage.error(errorMsg);

    return Promise.reject(error)
})

export default request