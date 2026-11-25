import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export type PresenceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFICATED';

export interface StudentPresenceList {
  id: number;
  student_presence_id: number;
  student_id: number;
  status: PresenceStatus;
  school_id?: number | null;
  student?: {
    id: number;
    codenumber?: string;
    name?: string;
    user?: { name: string };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPresenceListPayload {
  student_presence_id: number;
  student_id: number;
  status: PresenceStatus;
  school_id?: number | null;
}

export const useStudentPresenceListStore = defineStore('studentPresenceList', () => {
  const items = ref<StudentPresenceList[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<StudentPresenceList[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<StudentPresenceList[]>('/student-presence-lists');
      items.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar lista de presenças.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: StudentPresenceListPayload): Promise<StudentPresenceList> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<StudentPresenceList>('/student-presence-lists', payload);
      items.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao registar presença do aluno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    id: number | string,
    payload: Partial<StudentPresenceListPayload>
  ): Promise<StudentPresenceList> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<StudentPresenceList>(
        `/student-presence-lists/${encryptedId}`,
        payload
      );
      const index = items.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        items.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao actualizar presença do aluno.');
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
      await api.delete(`/student-presence-lists/${encryptedId}`);
      items.value = items.value.filter((i) => i.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover presença do aluno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { items, isLoading, error, clearError, list, create, update, remove };
});