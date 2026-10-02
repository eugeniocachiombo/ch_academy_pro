import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import UnderConstructionView from '@/views/UnderConstructionView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Rotas públicas não exigem sessão e não mostram sidebar/cabeçalho. */
    public?: boolean
    /** Permissão necessária para acessar a rota (ex: 'academic_year.manage') */
    permission?: string
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/acesso-negado', name: 'unauthorized', component: UnauthorizedView, meta: { public: true } },

  // Módulo Acadêmico
  { path: '/academico/turmas', name: 'academic-classes', component: UnderConstructionView, meta: { permission: 'classes.manage' } },
  { path: '/academico/notas', name: 'academic-grades', component: UnderConstructionView, meta: { permission: 'grades.manage' } },
  { path: '/academico/frequencia', name: 'academic-attendance', component: UnderConstructionView, meta: { permission: 'attendance.manage' } },

  // Módulo Financeiro
  { path: '/financeiro/mensalidades', name: 'financial-fees', component: UnderConstructionView, meta: { permission: 'fee.manage' } },
  { path: '/financeiro/boletos', name: 'financial-bills', component: UnderConstructionView, meta: { permission: 'bill.manage' } },
  { path: '/financeiro/caixa', name: 'financial-cashflow', component: UnderConstructionView, meta: { permission: 'cashflow.manage' } },

  // Módulo Alunos
  { path: '/alunos/diretorio', name: 'students-directory', component: UnderConstructionView, meta: { permission: 'student.manage' } },
  { path: '/alunos/matricula', name: 'students-enrollment', component: UnderConstructionView, meta: { permission: 'enrollment.manage' } },

  // Módulo Professores
  { path: '/professores/corpo-docente', name: 'teachers-directory', component: UnderConstructionView, meta: { permission: 'teacher.manage' } },
  { path: '/professores/horarios', name: 'teachers-schedule', component: UnderConstructionView, meta: { permission: 'schedule.manage' } },

  // Módulo Comunicações
  { path: '/comunicacoes/mural', name: 'communications-wall', component: UnderConstructionView, meta: { permission: 'wall.manage' } },
  { path: '/comunicacoes/enviar', name: 'communications-send', component: UnderConstructionView, meta: { permission: 'message.send' } },

  // Módulo Relatórios
  { path: '/relatorios/academicos', name: 'reports-academic', component: UnderConstructionView, meta: { permission: 'report_academic.manage' } },
  { path: '/relatorios/financeiros', name: 'reports-financial', component: UnderConstructionView, meta: { permission: 'report_financial.manage' } },
  { path: '/relatorios/frequencia', name: 'reports-attendance', component: UnderConstructionView, meta: { permission: 'report_attendance.manage' } },

  // Módulo Configurações
  { path: '/configuracoes/ano-letivo', name: 'settings-academic-year', component: UnderConstructionView, meta: { permission: 'academic_year.manage' } },

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

    if (to.meta.permission && !userStore.getPermition(to.meta.permission)) {
      return { name: 'unauthorized' }
    }
  }
})

export default router