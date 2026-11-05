import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';

export interface ClassSubject {
  id: number;
  subject_id: number | string;
  class_id: number | string;
  school_id?: number | string | null;
}

export interface ClassSubjectPayload {
  subject_id: number | string;
  class_id: number | string;
  school_id?: number | string | null;
}

export const useClassSubjectStore = defineStore('classSubject', () => {
  const classSubjects = ref<ClassSubject[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<ClassSubject[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<ClassSubject[]>('/class-subjects');
      classSubjects.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar as disciplinas das turmas.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ClassSubjectPayload): Promise<ClassSubject> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<ClassSubject>('/class-subjects', payload);
      classSubjects.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao associar disciplina à turma.';
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
      await api.delete(`/class-subjects/${encryptedId}`);
      classSubjects.value = classSubjects.value.filter(cs => cs.id !== Number(id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover associação da disciplina com a turma.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    classSubjects,
    isLoading,
    error,
    clearError,
    list,
    create,
    remove,
  };
});