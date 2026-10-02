import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import BlockedView from '@/views/BlockedView.vue' // <--- Importe a nova view

// Importação das rotas modularizadas
import { academicRoutes } from './modules/academic.routes'
import { financialRoutes } from './modules/financial.routes'
import { studentsRoutes } from './modules/students.routes'
import { teachersRoutes } from './modules/teachers.routes'
import { communicationsRoutes } from './modules/communications.routes'
import { reportsRoutes } from './modules/reports.routes'
import { settingsRoutes } from './modules/settings.routes'

declare module 'vue-router' {
  interface RouteMeta {
    /** Rotas públicas não exigem sessão e não mostram sidebar/cabeçalho. */
    public?: boolean
    /** Permissão necessária para acessar a rota (ex: 'academic_year.manage') */
    permition?: string
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/acesso-negado', name: 'unauthorized', component: UnauthorizedView, meta: { public: true } },
  { path: '/conta-bloqueada', name: 'blocked', component: BlockedView, meta: { public: true } }, // <--- Nova rota pública

  // Agrupando todas as rotas dos módulos via spread operator (...)
  ...academicRoutes,
  ...financialRoutes,
  ...studentsRoutes,
  ...teachersRoutes,
  ...communicationsRoutes,
  ...reportsRoutes,
  ...settingsRoutes,

  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // 1. Autenticação (a store já faz initUser() ao ser criada)
  if (!to.meta.public && !userStore.isAuthenticated) {
    return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined }
  }

  // 2. Já autenticado tentando acessar o login
  if (to.name === 'login' && userStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // 3. Rotas protegidas: espera roles/permissões e valida a permissão da rota
  if (!to.meta.public) {
    try {
      await userStore.loadAccess()
    } catch {
      return { name: 'login' }
    }

    // --- NOVO: Se o utilizador estiver bloqueado, redireciona para a página de bloqueio ---
    // (Garante que não entra em loop se já estiver indo para a rota 'blocked')
    if (userStore.currentUser?.status === 'BLOCKED' && to.name !== 'blocked') {
      return { name: 'blocked' }
    }

    if (to.meta.permition && !userStore.getPermition(to.meta.permition)) {
      return { name: 'unauthorized' }
    }
  }
})

export default router