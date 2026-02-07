<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>{{ isLogin ? '系统登录' : '新用户注册' }}</h2>

      <el-form :model="authForm" :rules="rules" ref="formRef" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="authForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="authForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>

        <el-collapse-transition>
          <el-form-item v-if="!isLogin" prop="rePassword">
            <el-input v-model="authForm.rePassword" type="password" placeholder="确认密码" prefix-icon="Check" show-password />
          </el-form-item>
        </el-collapse-transition>

        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleSubmit">
            {{ isLogin ? '登录' : '立即注册' }}
          </el-button>
        </el-form-item>

        <div class="switch-link">
          <el-link type="primary" underline="never" @click="toggleMode">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { loginAPI, registerAPI } from '@/api/user' 
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import md5 from 'js-md5'

const userStore = useUserStore()
const router = useRouter()
const formRef = ref(null)

const isLogin = ref(true)

const authForm = ref({
  username: '',
  password: '',
  rePassword: ''
})

// 基础规则校验
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 10, message: '用户名长度在 2-10 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于 6 位', trigger: 'blur' }
  ],
  rePassword: [
    {
      validator: (rule, value, callback) => {
        if (!isLogin.value && value !== authForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 切换模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  authForm.value = { username: '', password: '', rePassword: '' }
  formRef.value.clearValidate()
}

// 提交逻辑
const handleSubmit = async () => {
  if (!formRef.value) return
  
  // 1. 预校验
  await formRef.value.validate()

  const submitData = {
    username: authForm.value.username,
    password: md5(authForm.value.password)
  }

  try {
// Login.vue 中的 handleSubmit 方法修改
if (isLogin.value) {
  const res = await loginAPI(submitData)
  
  // 💡 核心修改：从登录接口的 data 中直接解构出 menuList
  const { accessToken, refreshToken, menuList } = res.data 
  
  // 1. 存储双 Token
  userStore.setTokens(accessToken, refreshToken)

  // 2. 💡 直接使用登录返回的 menuList，不要再请求 getMenuTreeAPI 了
  // 因为 getMenuTreeAPI 往往返回的是全量数据，而 res.data.menuList 才是权限过滤后的
  userStore.setMenuList(menuList || [])

  ElMessage.success(res.msg || '登录成功')
  
  // 3. 跳转首页（路由守卫会自动根据 menuList 生成路由）
  router.push('/user')
}
     else {
      // --- 执行注册 ---
      const res = await registerAPI(submitData)
      ElMessage.success(res.msg || '注册成功，请登录')
      isLogin.value = true 
    }
  } catch (error) {
    // 💡 这里的 catch 会捕获两类错误：
    // 1. 拦截器抛出的 res.code !== 200 的错误（如密码错误）
    // 2. 网络错误（如 404, 500）
    // 拦截器通常已经弹过 ElMessage 了，所以这里只需要打日志或做简单的清理
    console.error('业务操作失败:', error)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}
.login-card {
  width: 380px;
  padding: 10px;
}
h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #303133;
}
.switch-link {
  margin-top: 10px;
  text-align: right;
}
</style>