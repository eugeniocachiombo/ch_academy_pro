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
    path: '/academico/cursos', 
    name: 'academic-courses', 
    component: () => import('@/views/academic/CoursesView.vue'), 
    meta: { permission: 'courses.manage' } 
  },
  { 
    path: '/academico/disciplinas', 
    name: 'academic-subjects', 
    component: () => import('@/views/academic/SubjectsView.vue'), 
    meta: { permission: 'subjects.manage' } 
  },
  { 
    path: '/academico/curso-classes', 
    name: 'academic-course-grades', 
    component: () => import('@/views/academic/CourseGradesView.vue'), 
    meta: { permission: 'course-grades.manage' } 
  },
  { 
    path: '/academico/classes-disciplinas', 
    name: 'academic-grade-subjects', 
    component: () => import('@/views/academic/GradeSubjectsView.vue'), 
    meta: { permission: 'grade_subjects.manage' } 
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