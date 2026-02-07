import request from '@/utils/request'

/**
 * 获取所有级别列表
 * 对应后端: @GetMapping("/list")
 */
const getRoleListAPI = () => {
    return request.get('/role/list')
}

/**
 * 获取指定角色的权限ID数组
 * 对应后端: @GetMapping("/perm/{roleId}")
 */
const getRolePermsAPI = (roleId) => {
    return request.get(`/role/perm/${roleId}`)
}

/**
 * 保存权限分配
 * 对应后端: @PostMapping("/perm/{roleId}")
 */
const saveRolePermsAPI = (roleId, menuIds) => {
    return request.post(`/role/perm/${roleId}`, menuIds)
}

/**
 * 基础 CRUD
 */
const addRoleAPI = (data) => request.post('/role/add', data)
const updateRoleAPI = (data) => request.put('/role/update', data)
const deleteRoleAPI = (id) => request.delete(`/role/delete/${id}`)
export {
    getRoleListAPI,
    getRolePermsAPI,
    saveRolePermsAPI,
    addRoleAPI,
    updateRoleAPI,
    deleteRoleAPI
}