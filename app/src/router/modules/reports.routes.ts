import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const reportsRoutes: RouteRecordRaw[] = [
  { 
    path: '/relatorios/academicos', 
    name: 'reports-academic', 
    component: UnderConstructionView, 
    meta: { permission: 'report_academic.manage' } 
  },
  { 
    path: '/relatorios/financeiros', 
    name: 'reports-financial', 
    component: UnderConstructionView, 
    meta: { permission: 'report_financial.manage' } 
  },
  { 
    path: '/relatorios/frequencia', 
    name: 'reports-attendance', 
    component: UnderConstructionView, 
    meta: { permission: 'report_attendance.manage' } 
  },
]