import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user.store'

declare module 'vue-router' {
  interface RouteMeta {
    /** Rotas públicas não exigem sessão e não mostram sidebar/cabeçalho. */
    public?: boolean
  }
}


const routes: RouteRecordRaw[] = [
  { 
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'), 
    meta: { public: true }
  },
  { 
    path: '/', 
    name: 'dashboard', 
    component: () => import('@/views/DashboardView.vue') 
  },
  { 
    path: '/academico', 
    name: 'academic', 
    component: () => import('@/views/AcademicView.vue') 
  },
  { 
    path: '/financeiro', 
    name: 'financial', 
    component: () => import('@/views/FinancialView.vue') 
  },
  { 
    path: '/alunos', 
    name: 'students', 
    component: () => import('@/views/StudentsView.vue') 
  },
  { 
    path: '/professores', 
    name: 'teachers', 
    component: () => import('@/views/TeachersView.vue') 
  },
  { 
    path: '/comunicacoes', 
    name: 'communications', 
    component: () => import('@/views/CommunicationsView.vue') 
  },
  { 
    path: '/relatorios', 
    name: 'reports', 
    component: () => import('@/views/ReportsView.vue') 
  },
  { 
    path: '/:pathMatch(.*)*', 
    redirect: { name: 'dashboard' } 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guarda de navegação: sem sessão só se acede a rotas públicas; com sessão, /login volta ao painel
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!to.meta.public && !userStore.isAuthenticated) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined }
  }
  if (to.name === 'login' && userStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
