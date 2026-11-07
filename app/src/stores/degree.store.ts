import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Degree {
  id: number;
  name: string;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DegreePayload {
  name: string;
  school_id?: number | null;
}

export const useDegreeStore = defineStore('degree', () => {
  const degrees = ref<Degree[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Degree[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Degree[]>('/degrees');
      degrees.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar grupos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: DegreePayload): Promise<Degree> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Degree>('/degrees', payload);
      degrees.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar graduação.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<DegreePayload>): Promise<Degree> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Degree>(`/degrees/${encryptedId}`, payload);
      const index = degrees.value.findIndex(g => g.id === id);
      if (index !== -1) {
        degrees.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o grupo.');
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
      await api.delete(`/degrees/${encryptedId}`);
      degrees.value = degrees.value.filter(g => g.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o grupo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { degrees, isLoading, error, clearError, list, create, update, remove };
});