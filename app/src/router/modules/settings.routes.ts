import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const settingsRoutes: RouteRecordRaw[] = [
  { 
    path: '/configuracoes/ano-letivo', 
    name: 'settings-academic-year', 
    component: UnderConstructionView, 
    meta: { permition: 'academic_year.manage' } 
  },
  { 
    path: '/configuracoes/utilizadores', 
    name: 'settings-users', 
    component: () => import('@/views/settings/UsersView.vue'), 
    meta: { permition: 'user.manage' } 
  },
  { 
    path: '/configuracoes/funcoes', 
    name: 'settings-roles', 
    component: () => import('@/views/settings/RolesView.vue'), 
    meta: { permition: 'role.manage' } 
  },
  { 
    path: '/configuracoes/permissoes', 
    name: 'settings-permitions', 
    component: () => import('@/views/settings/PermitionsView.vue'), 
    meta: { permition: 'permition.manage' } 
  },
  { 
    path: '/configuracoes/permissoes-funcoes', 
    name: 'settings-role-permitions', 
    component: () => import('@/views/settings/RolePermitionsView.vue'), 
    meta: { permition: 'role_permition.manage' } 
  },
  {
    path: '/configuracoes/vinculos-funcoes',
    name: 'settings-user-roles',
    component: () => import('@/views/settings/UserRolesView.vue'),
    meta: { permition: 'user_role.manage' }
  },
]