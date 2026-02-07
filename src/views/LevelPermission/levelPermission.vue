<template>
  <div class="level-permission-container">
    <el-card shadow="never">
      <CardHeader>
        <template #actions>
          <el-button type="primary" icon="Plus" @click="handleOpenDialog('add')">
            添加级别
          </el-button>
        </template>
      </CardHeader>

      <ManagementBaseTable 
        ref="tableRef"
        :api="getRoleListAPI" 
        :columns="roleColumns"
      >
        <template #roleName="{ row }">
          <span class="role-name-text">{{ row.name }}</span>
        </template>

        <template #operate="{ row }">
          <el-button link type="primary" icon="Edit" @click="handleOpenDialog('edit', row)">编辑权限</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </ManagementBaseTable>

      <!-- <el-divider content-position="left">下方为旧表格对比区</el-divider>
      <el-table :data="roleList" border stripe style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column label="级别名称" prop="name" width="180" align="center">
          <template #default="{ row }">
            <span class="role-name-text">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="职位描述" prop="description" show-overflow-tooltip />
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button link type="primary" icon="Edit" @click="handleOpenDialog('edit', row)">编辑权限</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table> -->
    </el-card>

    <el-dialog 
      v-model="permVisible" 
      :title="dialogType === 'add' ? '新增级别' : `权限配置 - ${currentRole.name}`" 
      width="450px" 
      destroy-on-close
    >
      <el-form label-width="80px">
        <el-form-item label="级别名称" required>
          <el-input v-model="currentRole.name" placeholder="请输入级别名称" />
        </el-form-item>
        <!-- 新增：角色编码输入框 -->
        <el-form-item label="角色编码" required v-if="dialogType === 'add'">
          <el-input 
            v-model="currentRole.code" 
            placeholder="请输入角色编码（如：ADMIN、USER）"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="权限分配">
          <div class="tree-container">
            <el-tree
              ref="treeRef"
              :data="menuTree"
              show-checkbox
              node-key="id"
              :default-expand-all="false"
              highlight-current
              :props="{ label: 'title', children: 'children' }"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPermissions">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import CardHeader from '@/components/CardHeader/index.vue'
import ManagementBaseTable from '@/components/ManagementBaseTable/index.vue'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getRoleListAPI, 
  getRolePermsAPI, 
  saveRolePermsAPI, 
  deleteRoleAPI,
  addRoleAPI,
  updateRoleAPI 
} from '@/api/role'
import { getMenuTreeAPI } from '@/api/menu'

// --- 状态定义 ---
const tableRef = ref(null) // 用于刷新高阶表格的引用
const loading = ref(false)
const roleList = ref([])   // 旧表格用的数据
const menuTree = ref([]) 
const permVisible = ref(false)
const dialogType = ref('add') 
const treeRef = ref(null)
// 新增：给currentRole添加code字段
const currentRole = ref({ id: null, name: '', code: '', description: '' })

/**
 * 💡 关键：列配置重构
 * 为了对接 ManagementBaseTable 的插槽，我们给需要自定义的列加上 slot 属性
 */
const roleColumns = [
  { label: '级别名称', slot: 'roleName', width: '180', align: 'center' }, // 👈 指向 #roleName 插槽
  { prop: 'description', label: '职位描述', 'show-overflow-tooltip': true, align: 'center'  }, // 💡 普通列直接传 prop
  { label: '操作', slot: 'operate', width: '220', align: 'center' }         // 👈 指向 #operate 插槽
]

// --- 原有的 fetchRoleList (供旧表格使用) ---
// const fetchRoleList = async () => {
//   loading.value = true
//   try {
//     const res = await getRoleListAPI()
//     if (res.code === 200) roleList.value = res.data
//   } finally {
//     loading.value = false
//   }
// }

// --- 打开弹窗 ---
const handleOpenDialog = async (type, row = null) => {
  dialogType.value = type
  permVisible.value = true
  if (menuTree.value.length === 0) {
    const menuRes = await getMenuTreeAPI()
    if (menuRes.code === 200) menuTree.value = menuRes.data
  }
  if (type === 'add') {
    // 新增：重置code字段
    console.log('点击了新增按钮');
    console.log('完成了新增功能');
    console.log('同事改的代码');
    
    
    
    currentRole.value = { id: null, name: '', code: '', description: '' }
    nextTick(() => {
      const defaultKeys = [1] 
      treeRef.value?.setCheckedKeys(defaultKeys, false)
    })
  } else {
    currentRole.value = { ...row }
    const permRes = await getRolePermsAPI(row.id)
    if (permRes.code === 200) {
      nextTick(() => {
        treeRef.value?.setCheckedKeys(permRes.data, false)
      })
    }
  }
}

// --- 提交保存 ---

const submitPermissions = async () => {
  // 新增：新增时校验code不能为空
  if (dialogType.value === 'add' && !currentRole.value.code) {
    return ElMessage.warning('角色编码不能为空')
  }
  if (!currentRole.value.name) return ElMessage.warning('级别名称不能为空')
  const checkedKeys = treeRef.value.getCheckedKeys()
  const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
  const finalIds = [...checkedKeys, ...halfCheckedKeys]

  try {
    loading.value = true
    if (dialogType.value === 'add') {
      const addRes = await addRoleAPI(currentRole.value)
      // 1. 严格校验返回码
      if (addRes.code !== 200) {
        ElMessage.error(addRes.msg || '新增角色失败')
        return
      }
      // 2. 安全获取ID，兼容后端返回null的情况
      const newRoleId = addRes.data?.id || addRes.data
      // 3. 如果ID依然为空，手动抛出异常触发catch
      if (!newRoleId) {
        throw new Error('后端返回数据异常，未获取到角色ID')
      }
      // 4. 分配权限
      await saveRolePermsAPI(newRoleId, finalIds)
      ElMessage.success('新增成功')
    } else {
      // 编辑逻辑不变
      await updateRoleAPI(currentRole.value)
      await saveRolePermsAPI(currentRole.value.id, finalIds)
      ElMessage.success('更新成功')
    }
    // 5. 关闭弹窗
    permVisible.value = false
    // 6. 强制刷新表格数据（无论是否报错，都要刷新）
    await nextTick() // 等待DOM更新
    tableRef.value.refresh() 
  } catch (err) {
    console.error('提交失败：', err)
    ElMessage.error('操作失败：' + (err.message || '系统异常'))
  } finally {
    loading.value = false
  }
}

// 删除逻辑
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除 ${row.name} 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await deleteRoleAPI(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      tableRef.value.refresh() // 刷新高阶表格
      // fetchRoleList()         // 刷新旧表格
    }
  })
}

// onMounted(() => {
//   fetchRoleList()
// })
</script>