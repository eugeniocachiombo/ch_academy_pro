import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const teachersRoutes: RouteRecordRaw[] = [
  { 
    path: '/professores/corpo-docente', 
    name: 'teachers', 
    component: () => import('@/views/teacher/TeachersView.vue'), 
    meta: { permission: 'teachers.manage' } 
  },
  { 
    path: '/professores/alocacao', 
    name: 'teacherpositions', 
    component: () => import('@/views/teacher/TeacherocupationsView.vue'), 
    meta: { permission: 'teacherpositions.manage' } 
  },
  { 
    path: '/professores/horarios', 
    name: 'teachers-schedule', 
    component: UnderConstructionView, 
    meta: { permission: 'schedule.manage' } 
  },
]