import type { RouteRecordRaw } from 'vue-router'
import UnderConstructionView from '@/views/UnderConstructionView.vue'

export const academicRoutes: RouteRecordRaw[] = [
  { 
    path: '/configuracoes/anos-lectivos', 
    name: 'years', 
    component: () => import('@/views/academic/YearsView.vue'), 
    meta: { permission: 'years.manage' } 
  },
  { 
    path: '/academico/turnos', 
    name: 'periods', 
    component: () => import('@/views/academic/PeriodsView.vue'), 
    meta: { permission: 'periods.manage' } 
  },
  { 
    path: '/academico/classes', 
    name: 'classes', 
    component: () => import('@/views/academic/ClassesView.vue'), 
    meta: { permission: 'classes.manage' } 
  },
  { 
    path: '/academico/turmas', 
    name: 'groups', 
    component: () => import('@/views/academic/GroupsView.vue'),
    meta: { permission: 'groups.manage' } 
  },
  { 
    path: '/academico/turmas/configuracao', 
    name: 'groupconfigs', 
    component: () => import('@/views/academic/GroupconfigsView.vue'),
    meta: { permission: 'groupconfigs.manage' } 
  },
  { 
    path: '/academico/salas', 
    name: 'rooms', 
    component: () => import('@/views/academic/RoomsView.vue'), 
    meta: { permission: 'rooms.manage' } 
  },
  { 
    path: '/academico/cursos', 
    name: 'courses', 
    component: () => import('@/views/academic/CoursesView.vue'), 
    meta: { permission: 'courses.manage' } 
  },
  { 
    path: '/academico/disciplinas', 
    name: 'subjects', 
    component: () => import('@/views/academic/SubjectsView.vue'), 
    meta: { permission: 'subjects.manage' } 
  },
  { 
    path: '/academico/curso-classes', 
    name: 'classcourses', 
    component: () => import('@/views/academic/ClasscoursesView.vue'), 
    meta: { permission: 'classcourses.manage' } 
  },
  { 
    path: '/academico/classes-disciplinas', 
    name: 'class-subjects', 
    component: () => import('@/views/academic/ClassSubjectsView.vue'), 
    meta: { permission: 'class-subjects.manage' } 
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
  // Novas rotas adicionadas
  { 
    path: '/academico/horarios', 
    name: 'academic-schedules', 
    component: UnderConstructionView, 
    meta: { permission: 'schedules.manage' } 
  },
  { 
    path: '/academico/avaliacoes', 
    name: 'academic-evaluations', 
    component: UnderConstructionView, 
    meta: { permission: 'evaluations.manage' } 
  },
  { 
    path: '/academico/historicos', 
    name: 'academic-transcripts', 
    component: UnderConstructionView, 
    meta: { permission: 'transcripts.manage' } 
  },
]