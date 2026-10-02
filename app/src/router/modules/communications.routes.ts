import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const communicationsRoutes: RouteRecordRaw[] = [
  { 
    path: '/comunicacoes/mural', 
    name: 'communications-wall', 
    component: UnderConstructionView, 
    meta: { permission: 'wall.manage' } 
  },
  { 
    path: '/comunicacoes/enviar', 
    name: 'communications-send', 
    component: UnderConstructionView, 
    meta: { permission: 'message.send' } 
  },
]