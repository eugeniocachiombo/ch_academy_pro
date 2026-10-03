import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoursePayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCoursePayload {
  name?: string;
  code?: string;
  description?: string;
}

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([]);
  const currentCourse = ref<Course | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Course[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, Course[]>('/courses');
      courses.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar cursos.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Course> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, Course>('/courses/' + encryptedId);
      currentCourse.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar curso.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateCoursePayload): Promise<Course> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, Course>('/courses', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar curso.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateCoursePayload): Promise<Course> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, Course>('/courses/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar curso.';
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
      await api.delete('/courses/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar curso.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    courses,
    currentCourse,
    isLoading,
    error,
    clearError,
    list,
    find,
    create,
    update,
    remove
  };
});