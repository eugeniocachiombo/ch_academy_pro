import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  school_id: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectPayload {
  code: string;
  name: string;
  description?: string;
  school_id: number | null;
}

export const useSubjectStore = defineStore('subject', () => {
  const subjects = ref<Subject[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Subject[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Subject[]>('/subjects');
      subjects.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar disciplinas.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: SubjectPayload): Promise<Subject> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Subject>('/subjects', payload);
      subjects.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a disciplina.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<SubjectPayload>): Promise<Subject> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Subject>(`/subjects/${encryptedId}`, payload);
      const index = subjects.value.findIndex(s => s.id === id);
      if (index !== -1) {
        subjects.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a disciplina.');
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
      await api.delete(`/subjects/${encryptedId}`);
      subjects.value = subjects.value.filter(s => s.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a disciplina.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { subjects, isLoading, error, clearError, list, create, update, remove };
});