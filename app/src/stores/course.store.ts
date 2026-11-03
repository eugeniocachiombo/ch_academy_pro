import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  school_id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoursePayload {
  name: string;
  code: string;
  description?: string;
  school_id: number | null;
}

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Course[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Course[]>('/courses');
      courses.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar cursos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CoursePayload): Promise<Course> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Course>('/courses', payload);
      courses.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o curso.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<CoursePayload>): Promise<Course> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Course>(`/courses/${encryptedId}`, payload);
      const index = courses.value.findIndex(c => c.id === id);
      if (index !== -1) {
        courses.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o curso.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete(`/courses/${encryptedId}`);
      courses.value = courses.value.filter(c => c.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o curso.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { courses, isLoading, error, clearError, list, create, update, remove };
});