<template>
  <div class="menu-manage-container">
    <CardHeader>
        <template #actions>
          <el-button type="primary" icon="Plus" @click="handleOpenDialog('add')">
            添加级别
          </el-button>
        </template>
      </CardHeader>
    <el-card shadow="never">

      <template #header>
        <div class="header-content">
          <div class="left">
            <el-input
              v-model="filterText"
              placeholder="输入关键字进行过滤"
              style="width: 300px; margin-right: 15px"
              clearable
            />
            <el-button type="primary" icon="Plus" @click="openDialog('add', null)">新增顶级菜单</el-button>
          </div>
          <div class="right">
            <el-tag type="info" class="status-tag">■ 菜单栏</el-tag>
            <el-tag type="warning" class="status-tag">■ 二级页面</el-tag>
            <el-tag class="status-tag">■ 接口</el-tag>
          </div>
        </div>
      </template>

      <el-tree
        ref="treeRef"
        :data="localMenuData"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        :filter-node-method="filterNode"
        highlight-current
        class="menu-tree"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span class="label-box">
              <el-icon v-if="data.icon" class="node-icon">
                <component :is="data.icon" />
              </el-icon>
              <span :class="{ 'is-dir': data.children && data.children.length > 0 }">
                {{ node.label }}
              </span>
            </span>
            
            <span class="ops-box">
              <el-button link type="primary" @click.stop="openDialog('add', data)">新增子项</el-button>
              <el-button link type="warning" @click.stop="openDialog('edit', data)">修改</el-button>
              <el-button link type="danger" @click.stop="handleDelete(data)">删除</el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.type === 'add' ? '新增菜单' : '修改'" width="550px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="上级菜单">
          <el-input v-model="dialog.parentTitle" disabled />
        </el-form-item>
        
        <el-form-item label="菜单名称" required>
          <el-input v-model="form.title" placeholder="请输入菜单名称" />
        </el-form-item>

        <el-form-item label="菜单图标">
          <el-input v-model="form.icon" placeholder="图标组件名，如: User" />
        </el-form-item>

        <el-form-item label="路由地址">
          <el-input v-model="form.path" placeholder="URL 路径，如: /user" />
        </el-form-item>

        <el-form-item label="组件名称">
          <el-input v-model="form.component" placeholder="views 下的路径，如: System/Menu" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="doSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import CardHeader from '@/components/CardHeader/index.vue'
import { ref, watch, onMounted } from 'vue' // 💡 移除了 computed
import { addMenuAPI, updateMenuAPI, deleteMenuAPI, getMenuTreeAPI } from '@/api/menu'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 数据定义 ---
// 💡 移除 userStore，因为管理页面不应该修改登录用户的权限菜单缓存
const filterText = ref('')
const treeRef = ref(null)

// 💡 关键修改：定义一个本地变量来存储全量菜单，不影响全局 Store
const localMenuData = ref([]) 

const defaultProps = {
  children: 'children',
  label: 'title',
}

const dialog = ref({
  visible: false,
  type: 'add',
  parentTitle: ''
})

const form = ref({
  id: null,
  parentId: 0,
  title: '',
  icon: '',
  path: '',
  component: ''
})

// --- 逻辑处理 ---

// 加载菜单数据到本地变量
const loadMenuData = async () => {
  try {
    const res = await getMenuTreeAPI()
    if (res.code === 200) {
      // ✅ 修正：只存入当前组件的 localMenuData，不再污染全局侧边栏
      localMenuData.value = res.data || []
    }
  } catch (error) {
    console.error('加载菜单失败', error)
  }
}

// 过滤节点
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.title.includes(value)
}

// 打开弹窗
const openDialog = (type, data) => {
  dialog.value.type = type
  dialog.value.visible = true
  
  if (type === 'add') {
    dialog.value.parentTitle = data ? data.title : '顶级菜单'
    form.value = {
      id: null,
      parentId: data ? data.id : 0,
      title: '',
      icon: '',
      path: '',
      component: ''
    }
  } else {
    dialog.value.parentTitle = '编辑模式'
    form.value = { ...data } // 数据回显
  }
}

// 保存（新增/修改）
const doSave = async () => {
  if (!form.value.title) return ElMessage.warning('菜单名称不能为空')

  try {
    const api = dialog.value.type === 'add' ? addMenuAPI : updateMenuAPI
    const res = await api(form.value) 
    
    ElMessage.success(res.msg || '操作成功') 
    dialog.value.visible = false
    // ✅ 刷新本地数据
    await loadMenuData() 
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 删除
const handleDelete = (data) => {
  ElMessageBox.confirm(`确定要删除菜单【${data.title}】吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteMenuAPI(data.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // ✅ 刷新本地数据
      await loadMenuData() 
    }
  }).catch(() => {})
}

onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.menu-manage-container { padding: 20px; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.status-tag { margin-left: 10px; border: none; background: transparent; font-weight: bold; }
.menu-tree { margin-top: 15px; }
.custom-tree-node { flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px; }
.label-box { display: flex; align-items: center; }
.node-icon { margin-right: 8px; color: #909399; }
.is-dir { font-weight: 500; color: #303133; }
.ops-box { opacity: 0.2; transition: opacity 0.3s; }
.custom-tree-node:hover .ops-box { opacity: 1; }
:deep(.el-tree-node__content) { height: 40px; }
:deep(.el-tree-node__expand-icon) { font-size: 16px; }
</style>