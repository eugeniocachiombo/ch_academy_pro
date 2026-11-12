import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Parent {
  id: number;
  fullname: string;
  phone: string;
  phonealt?: string | null;
  ocupation?: string | null;
  user_id: number;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentPayload {
  fullname: string;
  phone: string;
  phonealt?: string | null;
  ocupation?: string | null;
  user_id: number;
  school_id?: number | null;
}

export const useParentStore = defineStore('parent', () => {
  const parents = ref<Parent[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Parent[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Parent[]>('/parents');
      parents.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar os encarregados.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ParentPayload): Promise<Parent> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Parent>('/parents', payload);
      parents.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o encarregado.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<ParentPayload>): Promise<Parent> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Parent>(`/parents/${encryptedId}`, payload);
      const index = parents.value.findIndex(p => p.id === id);
      if (index !== -1) {
        parents.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o encarregado.');
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
      await api.delete(`/parents/${encryptedId}`);
      parents.value = parents.value.filter(p => p.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o encarregado.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { parents, isLoading, error, clearError, list, create, update, remove };
});