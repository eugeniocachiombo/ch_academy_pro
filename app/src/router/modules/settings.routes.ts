import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'
import UsersView from '@/views/settings/UsersView.vue' // Importa o componente real de utilizadores

export const settingsRoutes: RouteRecordRaw[] = [
  { 
    path: '/configuracoes/ano-letivo', 
    name: 'settings-academic-year', 
    component: UnderConstructionView, 
    meta: { permission: 'academic_year.manage' } 
  },
  { 
    path: '/configuracoes/utilizadores', 
    name: 'settings-users', 
    component: UsersView, // Componente real do CRUD de utilizadores
    meta: { permission: 'user.manage' } 
  },
  { 
    path: '/configuracoes/funcoes', 
    name: 'settings-roles', 
    component: UnderConstructionView, 
    meta: { permission: 'role.manage' } 
  },
  { 
    path: '/configuracoes/permissoes', 
    name: 'settings-permissions', 
    component: UnderConstructionView, 
    meta: { permission: 'permission.manage' } 
  },
  { 
    path: '/configuracoes/permissoes-funcoes', 
    name: 'settings-role-permissions', 
    component: UnderConstructionView, 
    meta: { permission: 'role_permission.manage' } 
  },
  { 
    path: '/configuracoes/vinculos-funcoes', 
    name: 'settings-user-roles', 
    component: UnderConstructionView, 
    meta: { permission: 'user_role.manage' } 
  },
]