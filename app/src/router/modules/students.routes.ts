import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const studentsRoutes: RouteRecordRaw[] = [
  {
    path: '/alunos',
    name: 'students',
    component: () => import('@/views/student/StudentsView.vue'),
    meta: { permission: 'students.manage' }
  },
  {
    path: '/alunos/matriculas',
    name: 'registers',
    component: () => import('@/views/student/RegistersView.vue'),
    meta: { permission: 'registers.manage' }
  },
  {
    path: '/alunos/transferencias',
    name: 'students-transfers',
    component: UnderConstructionView,
    meta: { permission: 'transfer.manage' }
  },
  {
    path: '/pais',
    name: 'parents',
    component: () => import('@/views/student/ParentsView.vue'),
    meta: { permission: 'parents.manage' }
  },
  {
    path: '/pais/atribuicoes',
    name: 'student-parents-assignment',
    component: () => import('@/views/student/StudentParentAssignmentView.vue'),
    meta: { permission: 'studentparents.manage' }
  },
]