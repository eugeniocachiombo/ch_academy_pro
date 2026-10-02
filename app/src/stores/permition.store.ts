import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Permition {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermitionPayload {
  name: string;
}

export interface UpdatePermitionPayload {
  name?: string;
}

export const usePermitionStore = defineStore('permition', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const permitions = ref<Permition[]>([]);
  const currentPermition = ref<Permition | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Permition[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, Permition[]>('/permitions');
      permitions.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar {{pluralLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Permition> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, Permition>('/permitions/' + encryptedId);
      currentPermition.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreatePermitionPayload): Promise<Permition> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, Permition>('/permitions', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdatePermitionPayload): Promise<Permition> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, Permition>('/permitions/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete('/permitions/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    permitions,
    currentPermition,
    isLoading,
    error,
    clearError,
    list,
    find,
    create,
    update,
    remove
  };
});