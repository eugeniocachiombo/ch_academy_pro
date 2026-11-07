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
]