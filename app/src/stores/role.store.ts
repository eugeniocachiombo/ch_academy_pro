import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  school_id?: number | string | null;
}

export interface RolePayload {
  name: string;
  description?: string;
  school_id?: number | string;
}

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Role[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Role[]>('/roles');
      roles.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar papéis.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: RolePayload): Promise<Role> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<Role>('/roles', payload);
      roles.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar o papel.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<RolePayload>): Promise<Role> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.put<Role>(`/roles/${id}`, payload);
      const index = roles.value.findIndex(r => r.id === id);
      if (index !== -1) {
        roles.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar o papel.';
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
      await api.delete(`/roles/${id}`);
      roles.value = roles.value.filter(r => r.id !== id);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover o papel.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    roles,
    isLoading,
    error,
    clearError,
    list,
    create,
    update,
    remove,
  };
});