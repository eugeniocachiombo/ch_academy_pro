import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const academicRoutes: RouteRecordRaw[] = [
  { 
    path: '/academico/turmas', 
    name: 'academic-classes', 
    component: UnderConstructionView, 
    meta: { permission: 'classes.manage' } 
  },
  { 
    path: '/academico/notas', 
    name: 'academic-grades', 
    component: UnderConstructionView, 
    meta: { permission: 'grades.manage' } 
  },
  { 
    path: '/academico/frequencia', 
    name: 'academic-attendance', 
    component: UnderConstructionView, 
    meta: { permission: 'attendance.manage' } 
  },
]