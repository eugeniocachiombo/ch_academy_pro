import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const academicRoutes: RouteRecordRaw[] = [
  { 
    path: '/academico/classes', 
    name: 'academic-grades', 
    component: () => import('@/views/academic/AcademicGradesView.vue'), 
    meta: { permission: 'grades.manage' } 
  },
  { 
    path: '/academico/turmas', 
    name: 'academic-classes', 
    component: () => import('@/views/academic/AcademicClassesView.vue'), 
    meta: { permission: 'classes.manage' } 
  },
  { 
    path: '/academico/salas', 
    name: 'academic-rooms', 
    component: () => import('@/views/academic/AcademicRoomsView.vue'), 
    meta: { permission: 'rooms.manage' } 
  },
  { 
    path: '/academico/notas', 
    name: 'academic-marks',
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