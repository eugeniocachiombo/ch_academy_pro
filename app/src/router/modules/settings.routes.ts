import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const settingsRoutes: RouteRecordRaw[] = [
  { 
    path: '/configuracoes/ano-letivo', 
    name: 'settings-academic-year', 
    component: UnderConstructionView, 
    meta: { permission: 'academic_year.manage' } 
  },
]