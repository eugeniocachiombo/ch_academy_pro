import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

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
  
  // Módulo Acadêmico
  { 
    path: '/academico/turmas', 
    name: 'academic-classes', 
    component: UnderConstructionView 
  },
  { 
    path: '/academico/notas', 
    name: 'academic-grades', 
    component: UnderConstructionView 
  },
  { 
    path: '/academico/frequencia', 
    name: 'academic-attendance', 
    component: UnderConstructionView 
  },

  // Módulo Financeiro
  { 
    path: '/financeiro/mensalidades', 
    name: 'financial-fees', 
    component: UnderConstructionView 
  },
  { 
    path: '/financeiro/boletos', 
    name: 'financial-bills', 
    component: UnderConstructionView 
  },
  { 
    path: '/financeiro/caixa', 
    name: 'financial-cashflow', 
    component: UnderConstructionView 
  },

  // Módulo Alunos
  { 
    path: '/alunos/diretorio', 
    name: 'students-directory', 
    component: UnderConstructionView 
  },
  { 
    path: '/alunos/matricula', 
    name: 'students-enrollment', 
    component: UnderConstructionView 
  },

  // Módulo Professores
  { 
    path: '/professores/corpo-docente', 
    name: 'teachers-directory', 
    component: UnderConstructionView 
  },
  { 
    path: '/professores/horarios', 
    name: 'teachers-schedule', 
    component: UnderConstructionView 
  },

  // Módulo Comunicações
  { 
    path: '/comunicacoes/mural', 
    name: 'communications-wall', 
    component: UnderConstructionView 
  },
  { 
    path: '/comunicacoes/enviar', 
    name: 'communications-send', 
    component: UnderConstructionView 
  },

  // Módulo Relatórios
  { 
    path: '/relatorios/academicos', 
    name: 'reports-academic', 
    component: UnderConstructionView 
  },
  { 
    path: '/relatorios/financeiros', 
    name: 'reports-financial', 
    component: UnderConstructionView 
  },
  { 
    path: '/relatorios/frequencia', 
    name: 'reports-attendance', 
    component: UnderConstructionView 
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