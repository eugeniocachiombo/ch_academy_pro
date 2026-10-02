import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const studentsRoutes: RouteRecordRaw[] = [
  { 
    path: '/alunos/diretorio', 
    name: 'students-directory', 
    component: UnderConstructionView, 
    meta: { permission: 'student.manage' } 
  },
  { 
    path: '/alunos/matricula', 
    name: 'students-enrollment', 
    component: UnderConstructionView, 
    meta: { permission: 'enrollment.manage' } 
  },
]