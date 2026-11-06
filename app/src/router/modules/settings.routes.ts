import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  { 
    path: '/configuracoes/utilizadores', 
    name: 'settings-users', 
    component: () => import('@/views/settings/UsersView.vue'), 
    meta: { permition: 'users.manage' } 
  },
  { 
    path: '/configuracoes/funcoes', 
    name: 'settings-roles', 
    component: () => import('@/views/settings/RolesView.vue'), 
    meta: { permition: 'roles.manage' } 
  },
  { 
    path: '/configuracoes/permissoes', 
    name: 'settings-permitions', 
    component: () => import('@/views/settings/PermitionsView.vue'), 
    meta: { permition: 'permitions.manage' } 
  },
  { 
    path: '/configuracoes/permissoes-funcoes', 
    name: 'settings-role-permitions', 
    component: () => import('@/views/settings/RolePermitionsView.vue'), 
    meta: { permition: 'role-permitions.manage' } 
  },
  {
    path: '/configuracoes/vinculos-funcoes',
    name: 'settings-user-roles',
    component: () => import('@/views/settings/UserRolesView.vue'),
    meta: { permition: 'user-roles.manage' }
  },
]