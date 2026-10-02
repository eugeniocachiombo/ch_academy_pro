import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const financialRoutes: RouteRecordRaw[] = [
  { 
    path: '/financeiro/mensalidades', 
    name: 'financial-fees', 
    component: UnderConstructionView, 
    meta: { permission: 'fee.manage' } 
  },
  { 
    path: '/financeiro/boletos', 
    name: 'financial-bills', 
    component: UnderConstructionView, 
    meta: { permission: 'bill.manage' } 
  },
  { 
    path: '/financeiro/caixa', 
    name: 'financial-cashflow', 
    component: UnderConstructionView, 
    meta: { permission: 'cashflow.manage' } 
  },
]