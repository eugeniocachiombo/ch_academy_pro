import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * Rotas da aplicação. O `name` de cada rota é o mesmo id usado em TabId
 * (general_service.ts), por isso o resto do código continua a falar em "abas".
 * As views são carregadas sob demanda (lazy) – isto também evita import circular
 * com general_service.ts.
 */
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/academico', name: 'academic', component: () => import('@/views/AcademicView.vue') },
  { path: '/financeiro', name: 'financial', component: () => import('@/views/FinancialView.vue') },
  { path: '/alunos', name: 'students', component: () => import('@/views/StudentsView.vue') },
  { path: '/professores', name: 'teachers', component: () => import('@/views/TeachersView.vue') },
  { path: '/comunicacoes', name: 'communications', component: () => import('@/views/CommunicationsView.vue') },
  { path: '/relatorios', name: 'reports', component: () => import('@/views/ReportsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
