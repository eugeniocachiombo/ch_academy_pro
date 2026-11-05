import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';

export interface Classcourse {
  id: number;
  course_id: number | string;
  class_id: number | string;
  school_id?: number | string | null;
}

export interface ClasscoursePayload {
  course_id: number | string;
  class_id: number | string;
  school_id?: number | string | null;
}

export const useClasscourseStore = defineStore('classcourse', () => {
  const classcourses = ref<Classcourse[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Classcourse[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Classcourse[]>('/classcourses');
      classcourses.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar os cursos das turmas.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ClasscoursePayload): Promise<Classcourse> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<Classcourse>('/classcourses', payload);
      classcourses.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao associar curso à turma.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete(`/classcourses/${encryptedId}`);
      classcourses.value = classcourses.value.filter(cc => cc.id !== Number(id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover associação do curso com a turma.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    classcourses,
    isLoading,
    error,
    clearError,
    list,
    create,
    remove,
  };
});