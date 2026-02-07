import request from '@/utils/request'
const getMenuTreeAPI = () => request.get('/menu/tree')
    // 新增菜单
const addMenuAPI = (data) => request.post('/menu/add', data)

// 修改菜单
const updateMenuAPI = (data) => request.put('/menu/update', data)

// 删除菜单 (注意路径参数)
const deleteMenuAPI = (id) => request.delete(`/menu/${id}`)
    // 统一导出
export {
    getMenuTreeAPI,
    addMenuAPI,
    updateMenuAPI,
    deleteMenuAPI
}