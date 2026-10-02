import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const teachersRoutes: RouteRecordRaw[] = [
  { 
    path: '/professores/corpo-docente', 
    name: 'teachers-directory', 
    component: UnderConstructionView, 
    meta: { permission: 'teacher.manage' } 
  },
  { 
    path: '/professores/horarios', 
    name: 'teachers-schedule', 
    component: UnderConstructionView, 
    meta: { permission: 'schedule.manage' } 
  },
]