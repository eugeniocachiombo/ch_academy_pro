import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';
import { type User } from './user.store';
import { type PersonPayload } from './person.store';

export interface Teacher {
  id: number;
  codenumber: number;
  user_id: number;
  degree_id: number;
  specialty?: string | null;
  school_id?: number | null;
  user?: User;
  degree?: { id: number; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherPayload {
  codenumber?: number;
  user_id?: number | null;
  degree_id?: number | null;
  specialty?: string | null;
  school_id?: number | null;
  person?: PersonPayload;
}

function buildError(err: any, fallback: string): ParsedError {
  const parsed = handleError(err, fallback) as any;
  const errors =
    parsed?.errors ??
    err?.response?.data?.errors ??
    err?.data?.errors ??
    err?.errors ??
    undefined;
  return Object.assign(parsed, { errors });
}

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Teacher[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Teacher[]>('/teachers');
      teachers.value = response;
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao carregar os professores.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function checkBi(bi: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`/teachers/check-bi/${encodeURIComponent(bi.trim())}`);
    return !!response.exists;
  }

  async function create(payload: TeacherPayload): Promise<Teacher> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Teacher>('/teachers', payload);
      teachers.value.push(response);
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao registar o professor.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<TeacherPayload>): Promise<Teacher> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Teacher>(`/teachers/${encryptedId}`, payload);
      const index = teachers.value.findIndex(t => t.id === Number(id));
      if (index !== -1) {
        teachers.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao actualizar o professor.');
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
      await api.delete(`/teachers/${encryptedId}`);
      teachers.value = teachers.value.filter(t => t.id !== Number(id));
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao eliminar o professor.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { teachers, isLoading, error, clearError, list, create, update, remove, checkBi };
});