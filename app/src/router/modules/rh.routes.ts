import type { RouteRecordRaw } from 'vue-router'

export const rhRoutes: RouteRecordRaw[] = [
  {
    path: '/rh/departamentos',
    name: 'departments',
    component: () => import('@/views/rh/DepartmentsView.vue'),
    meta: { permission: 'departments.manage' },
  },
  {
    path: '/rh/cargos',
    name: 'positions',
    component: () => import('@/views/rh/PositionsView.vue'),
    meta: { permission: 'positions.manage' },
  },
  {
    path: '/rh/funcionarios',
    name: 'employees',
    component: () => import('@/views/rh/EmployeesView.vue'),
    meta: { permission: 'employees.manage' },
  },
]