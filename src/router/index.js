import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getMenuTreeAPI } from '@/api/menu'

// 1. 扫描 views 目录下所有的 .vue 文件
const modules =
    import.meta.glob('../views/**/*.vue')

const routes = [{
        path: '/login',
        name: 'Login',
        component: () =>
            import ('@/components/Login.vue'),
        meta: { isPublic: true }
    },
    {
        path: '/',
        name: 'Layout',
        component: () =>
            import ('@/layout/index.vue'),
        // redirect: '/user',
        children: []
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// const generateDynamicRoutes = (menuList) => {
//     const result = []
//     menuList.forEach(item => {
//         if (!item.component && item.children && item.children.length > 0) {
//             result.push(...generateDynamicRoutes(item.children))
//             return
//         }

//         const componentPath = `../views/${item.component}.vue`
//         const componentFn = modules[componentPath]

//         if (!componentFn) {
//             console.error(`❌ 组件匹配失败！\n后端 component: "${item.component}"\n期望路径: "${componentPath}"`)
//             return
//         }

//         result.push({
//             path: item.path.startsWith('/') ? item.path.substring(1) : item.path,
//             name: item.path.replace(/\//g, '_'),
//             component: componentFn,
//             meta: { title: item.title, icon: item.icon }
//         })
//     })
//     return result
// }


const generateDynamicRoutes = (menuList) => {
        const result = []

        menuList.forEach(item => {
            // --- 打印当前处理的原始数据 (方便对比后端返回的数据) ---
            // console.log(`🔍 正在处理菜单项: ${item.title}`, item)

            // 情况 A：如果是目录（没有组件，但有子菜单）
            if (!item.component && item.children && item.children.length > 0) {
                result.push(...generateDynamicRoutes(item.children))
                return
            }

            // 情况 B：如果是具体页面
            const componentPath = `../views/${item.component}.vue`
            const componentFn = modules[componentPath]

            if (!componentFn) {
                console.error(`❌ 组件匹配失败！\n菜单名称: ${item.title}\n路径: "${componentPath}"`)
                return
            }

            const formattedPath = item.path.startsWith('/') ? item.path : `/${item.path}`

            // 构建路由对象
            const routeObj = {
                path: formattedPath,
                name: item.path.replace(/\//g, '_'),
                component: componentFn,
                meta: {
                    title: item.title, // 👈 重点检查这个字段
                    icon: item.icon,
                    parentId: item.parentId
                }
            }

            // --- 核心打印：确认路由对象生成结果 ---
            console.group(`🚀 路由挂载成功: ${item.title}`)
            console.log(`路径(Path):`, routeObj.path)
            console.log(`元信息(Meta):`, routeObj.meta)
            console.log(`组件函数(Component):`, routeObj.component)
            console.groupEnd()

            result.push(routeObj)
        })

        return result
    }
    // let isRoutesLoaded = false

// router.beforeEach(async(to, from, next) => {
//     const userStore = useUserStore()

//     // 1. 未登录拦截
//     if (to.path !== '/login' && !userStore.token) {
//         return next('/login')
//     }

//     // 2. 登录后且路由未加载的情况
//     if (userStore.token && !isRoutesLoaded && to.path !== '/login') {
//         try {
//             // 💡 优先从 userStore 拿现成的菜单（登录页已经存好的）
//             let menuData = userStore.menuList

//             // 💡 如果 Store 里没菜单（比如按了 F5 刷新）
//             if (!menuData || menuData.length === 0) {
//                 console.log('🔄 路由守卫：正在重新拉取菜单...')

//                 // 拦截器保证了：如果 code !== 200，这里会直接跳到 catch
//                 const res = await getMenuTreeAPI()
//                 menuData = res.data || []

//                 // 存入 Store 同步给侧边栏
//                 userStore.setMenuList(menuData)
//             }

//             // 3. 开始生成并挂载动态路由
//             const dynamicRoutes = generateDynamicRoutes(menuData)
//             dynamicRoutes.forEach(route => {
//                 router.addRoute('Layout', route)
//             })

//             // 4. 标记已加载，重定向到目标页面
//             isRoutesLoaded = true
//             if (to.path === '/' || to.path === '') {
//                 return next({ path: '/user', replace: true })
//             }
//             return next({...to, replace: true })

//         } catch (error) {
//             // 💡 拦截器报错（Token失效/接口异常）都会进这里
//             console.error('🛡️ 路由守卫拦截错误:', error)

//             // 清理状态并踢回登录页
//             userStore.removeToken()
//             isRoutesLoaded = false // 确保状态重置
//             return next('/login')
//         }
//     }

//     next()
// })


let isRoutesLoaded = false

router.beforeEach(async(to, from, next) => {
    const userStore = useUserStore()

    // 1. 未登录拦截
    if (to.path !== '/login' && !userStore.token) {
        return next('/login')
    }

    // 2. 登录后且路由未加载的情况
    if (userStore.token && !isRoutesLoaded && to.path !== '/login') {
        try {
            // 💡 这里是关键修改：
            // 因为开启了 persist: true，即使 F5 刷新，userStore.menuList 也会自动从本地恢复
            let menuData = userStore.menuList

            // 💡 如果实在没有菜单（比如手动清空了缓存，或者第一次登录还没存上）
            if (!menuData || menuData.length === 0) {
                console.log('🛡️ 路由守卫：未发现菜单数据，请重新登录')
                userStore.removeToken()
                isRoutesLoaded = false
                return next('/login')
            }

            console.log('🚀 路由守卫：正在挂载动态路由...', menuData)

            // 3. 开始生成并挂载动态路由
            const dynamicRoutes = generateDynamicRoutes(menuData)
            dynamicRoutes.forEach(route => {
                // 确保 'Layout' 是你主页面的 name，否则会导致路由无法嵌套
                router.addRoute('Layout', route)
            })

            // 4. 标记已加载，重定向到目标页面
            isRoutesLoaded = true

            // 
            if (to.path === '/' || to.path === '') {
                return next({ path: '/user', replace: true })
            }
            return next({...to, replace: true })

        } catch (error) {
            console.error('🛡️ 路由守卫拦截错误:', error)
            userStore.removeToken()
            isRoutesLoaded = false
            return next('/login')
        }
    }
    const siteTitle = 'Workbench · 成员管理' // 比如：瑞生考勤系统
    if (to.meta && to.meta.title) {
        document.title = `${to.meta.title} - ${siteTitle}`
    } else {
        document.title = siteTitle
    }
    next()
})

export function resetRouterFlag() {
    isRoutesLoaded = false
}

export default router