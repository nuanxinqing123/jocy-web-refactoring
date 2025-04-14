import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import './style.css'
import '@arco-design/web-vue/dist/arco.css';
import './assets/style/main.less'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue';
import IconComponents from './components/icons'
import Vconsole from 'vconsole'

// 创建Pinia实例
const pinia = createPinia()

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/Home.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('./pages/Library.vue')
    },
    {
      path: '/collect',
      name: 'collect',
      component: () => import('./pages/Collect.vue')
    },
    {
      path: '/historical',
      name: 'historical',
      component: () => import('./pages/Historical.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./pages/Search.vue')
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: () => import('./pages/detail/index.vue')
    },
    {
      path: '/video/:id',
      name: 'video',
      component: () => import('./pages/video/index.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('./pages/NotFound.vue')
    }
  ]
})

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(pinia)
app.use(router)
app.use(ArcoVue)
app.use(IconComponents)
if (process.env.NODE_ENV !== 'production') { // 测试和开发打开，生产不能打开
  let vConsole = new Vconsole()
  app.use(vConsole)
}

// 挂载应用
app.mount('#app')
