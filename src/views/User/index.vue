<template>
  <div style="padding: 20px; max-width: 1000px; margin: 0 auto;">
    <h1>用户管理系统 (Vue3 + MyBatis)</h1>

    <div style="margin-bottom: 20px;">
  <el-row :gutter="20" align="middle">
    
    <el-col :span="6">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button type="success" @click="resetSearch">刷新列表</el-button>
    </el-col>

    <el-col :span="18" style="display: flex; justify-content: flex-end; align-items: center;">
      <el-input 
        v-model="searchText" 
        style="width: 240px; margin-right: 10px;" 
        placeholder="根据用户名搜索" 
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
       
      />
      <el-button type="info" @click="handleSearch">搜索</el-button>
    </el-col>

  </el-row>
</div>

    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="gender" label="性别" width="100" />
      <el-table-column prop="age" label="年龄" width="100" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="confirmDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <MyPagination 
  v-model:pageNum="queryParams.pageNum" 
  v-model:pageSize="queryParams.pageSize"
  :total="total"
  @pagination="loadData" 
/>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="30%">
      <el-form :model="form" :rules="userRules" ref="userFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="1" :max="120" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MyPagination from '@/components/MyPagination/index.vue'
import { 
  getUserListAPI,
    deleteUserAPI,
    updateUserAPI,
    addUserAPI,
    getUserPageAPI 
} from '@/api/user.js'
const tableData = ref([])
const dialogVisible = ref(false)
const userFormRef = ref(null) // 💡 核心改动 2：引用表单实例
const searchText = ref('')
const form = ref({ id: null, username: '', password: '', gender: '男', age: 18 })
const queryParams = reactive({
    pageNum: 1,      // 当前页
    pageSize: 10,    // 每页条数
    username: ''     // 搜索关键词
})
// 2. 定义总条数
const total = ref(0)
// 💡 核心改动 3：定义详细的校验规则
const userRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    // 这里就是拦截 130 的关键：type 必须是 number
    { type: 'number', min: 1, max: 120, message: '年龄必须在 1~120 岁之间', trigger: 'change' }
  ]
})
const resetSearch = () => {
  
  searchText.value = ''        // 清空搜索框文字
  queryParams.username = ''    // 清空参数里的用户名
  queryParams.pageNum = 1      // 重置回第一页
  loadData() 
}
const loadData = async () => {
  try {
    // 💡 关键点：将 queryParams 传给新的 API
    const res = await getUserPageAPI(queryParams)
    console.log(res);
    
    tableData.value = res.data?.list || []   // 数组用 [] 兜底
    total.value = res.data?.total || 0
  } catch (error) {
    console.warn('获取分页列表失败')
  }
}

// 💡 搜索按钮触发的方法
const handleSearch = () => {
  queryParams.username = searchText.value
  queryParams.pageNum = 1 // 搜索时，必须强制回到第一页
  loadData()
}
// 💡 核心改动 4：修改保存函数，加入 validate 预校验
const saveUser = async () => {
  if (!userFormRef.value) return
  if (form.value.age > 120 || form.value.age < 1) {
    return ElMessage.warning('年龄范围必须在 1-120 岁之间！')
  }
  try {
    // 执行预校验，如果 age 为 130，这里会直接抛出错误并阻断代码运行
    await userFormRef.value.validate()

    const postData = { ...form.value }
    if (form.value.id) {
      const res = await updateUserAPI(postData)
      ElMessage.success(res.msg || "修改成功")
    } else {
      const res = await addUserAPI(postData)
      ElMessage.success(res.msg || "新增成功")
    }
    
    loadData()
    dialogVisible.value = false
  } catch (error) {
    // 如果是表单验证失败，Element Plus 会在 UI 上标红，我们无需额外处理
    console.error("提交被拦截:", error)
  }
}

const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除该用户吗？', '警告', { 
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await deleteUserAPI(id)
      ElMessage.success(res.msg || "删除成功")
      loadData()
    } catch (error) {}
  }).catch(() => {})
}

const handleAdd = () => {
  form.value = { id: null, username: '', password: '', gender: '男', age: 18 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>