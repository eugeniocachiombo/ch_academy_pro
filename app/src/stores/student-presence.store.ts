import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';
import type { StudentPresenceList } from './student-presence-list.store';

export interface StudentPresence {
  id: number;
  date?: string | null;
  groupconfig_id: number;
  teacher_id: number;
  subject_id: number;
  school_id?: number | null;
  groupconfig?: {
    id: number;
    name: string;
    registers?: Array<{
      id: number;
      student_id: number;
      student?: {
        id: number;
        name?: string;
        codenumber?: string;
        user?: { name: string };
      };
    }>;
  };
  teacher?: {
    id: number;
    codenumber?: string;
    user?: { name: string };
  };
  subject?: {
    id: number;
    name: string;
    code?: string;
  };
  student_presence_lists?: StudentPresenceList[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPresencePayload {
  date?: string | null;
  groupconfig_id: number | null;
  teacher_id: number | null;
  subject_id: number | null;
  school_id?: number | null;
}

export const useStudentPresenceStore = defineStore('studentPresence', () => {
  const presences = ref<StudentPresence[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<StudentPresence[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<StudentPresence[]>('/student-presences');
      presences.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar presenças.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: StudentPresencePayload): Promise<StudentPresence> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<StudentPresence>('/student-presences', payload);
      presences.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao registar presença.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    id: number | string,
    payload: Partial<StudentPresencePayload>
  ): Promise<StudentPresence> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<StudentPresence>(`/student-presences/${encryptedId}`, payload);
      const index = presences.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        presences.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao actualizar presença.');
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
      await api.delete(`/student-presences/${encryptedId}`);
      presences.value = presences.value.filter((p) => p.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover presença.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { presences, isLoading, error, clearError, list, create, update, remove };
});