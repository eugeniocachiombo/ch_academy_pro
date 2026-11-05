import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const institutionsRoutes: RouteRecordRaw[] = [
  { 
    path: '/escolas/dados', 
    name: 'schools', 
    component: UnderConstructionView, 
    meta: { permission: 'schools.manage' } 
  },
]