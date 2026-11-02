import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';

export interface Permition {
  id: number;
  name: string;
  description?: string | null;
  school_id?: number | string;
}

export interface PermitionPayload {
  name: string;
  description?: string;
  school_id?: number | string;
}

export const usePermitionStore = defineStore('permition', () => {
  const permitions = ref<Permition[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Permition[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Permition[]>('/permitions');
      permitions.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar permissões.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: PermitionPayload): Promise<Permition> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<Permition>('/permitions', payload);
      permitions.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar a permissão.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<PermitionPayload>): Promise<Permition> {
    isLoading.value = true;
    error.value = null;

    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Permition>(`/permitions/${encryptedId}`, payload);
      const index = permitions.value.findIndex(p => p.id === id);
      if (index !== -1) {
        permitions.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar a permissão.';
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
      await api.delete(`/permitions/${encryptedId}`);
      permitions.value = permitions.value.filter(p => p.id !== id);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover a permissão.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    permitions,
    isLoading,
    error,
    clearError,
    list,
    create,
    update,
    remove,
  };
});