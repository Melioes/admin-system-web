import request from '@/utils/request'

// 1. 定义具体的接口函数
const loginAPI = (data) => {
    return request({
        url: '/login',
        method: 'post',
        data
    })
}
const registerAPI = (data) => {
    return request({
        url: '/register', // 💡 请确保与你后端 LoginController 中的 @PostMapping 路径一致
        method: 'post',
        data
    })
}
const getUserListAPI = () => {
    return request({
        url: '/user/list',
        method: 'get'
    })
}

const deleteUserAPI = (id) => {
    return request({
        url: `/user/delete`,
        method: 'delete',
        params: { id }
    })
}

const updateUserAPI = (data) => {
    return request({
        url: '/user/update',
        method: 'put',
        data
    })
}

const addUserAPI = (data) => {
    return request({ url: '/user/add', method: 'post', data })
}

// 修改 getUserListAPI，使用 params 接收分页和搜索条件
const getUserPageAPI = (params) => {
    return request({
        url: '/user/page', // 💡 注意：路径改为我们刚测试成功的 /page
        method: 'get',
        params // 💡 axios 会自动把对象转为 ?pageNum=1&pageSize=10...
    })
}

export {
    registerAPI,
    loginAPI,
    getUserListAPI,
    deleteUserAPI,
    updateUserAPI,
    addUserAPI,
    getUserPageAPI
}