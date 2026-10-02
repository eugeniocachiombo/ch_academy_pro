import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Role {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  name: string;
}

export interface UpdateRolePayload {
  name?: string;
}

export const useRoleStore = defineStore('role', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const roles = ref<Role[]>([]);
  const currentRole = ref<Role | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Role[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, Role[]>('/roles');
      roles.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar {{pluralLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Role> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, Role>('/roles/' + encryptedId);
      currentRole.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateRolePayload): Promise<Role> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, Role>('/roles', payload);
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

  async function update(id: number | string, payload: UpdateRolePayload): Promise<Role> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, Role>('/roles/' + encryptedId, payload);
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
      await api.delete('/roles/' + encryptedId);
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
    roles,
    currentRole,
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