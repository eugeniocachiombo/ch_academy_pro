import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';
import type { Course } from './course.store';

export interface AcademicGrade {
  id: number;
  name: string;
  code?: string;
}

export interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  course?: Course;
  grade?: AcademicGrade;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseGradePayload {
  courseId: number;
  gradeId: number;
}

export interface UpdateCourseGradePayload {
  courseId?: number;
  gradeId?: number;
}

export const useCourseGradeStore = defineStore('courseGrade', () => {
  const courseGrades = ref<CourseGrade[]>([]);
  const currentCourseGrade = ref<CourseGrade | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<CourseGrade[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, CourseGrade[]>('/course-grades');
      courseGrades.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar configurações de cursos e classes.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateCourseGradePayload): Promise<CourseGrade> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, CourseGrade>('/course-grades', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao associar classe ao curso.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateCourseGradePayload): Promise<CourseGrade> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, CourseGrade>('/course-grades/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar associação.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete('/course-grades/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover associação.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    courseGrades,
    currentCourseGrade,
    isLoading,
    error,
    clearError,
    list,
    create,
    update,
    remove
  };
});