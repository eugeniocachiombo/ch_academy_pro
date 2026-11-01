import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export interface RolePermition {
  id: number;
  role_id: number | string;
  permition_id: number | string;
}

export interface RolePermitionPayload {
  role_id: number | string;
  permition_id: number | string;
}

export const useRolePermitionStore = defineStore('rolePermition', () => {
  const rolePermitions = ref<RolePermition[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<RolePermition[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<RolePermition[]>('/role-permitions');
      rolePermitions.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar permissões das funções.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: RolePermitionPayload): Promise<RolePermition> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<RolePermition>('/role-permitions', payload);
      rolePermitions.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao associar permissão.';
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
      await api.delete(`/role-permitions/${id}`);
      rolePermitions.value = rolePermitions.value.filter(rp => rp.id !== Number(id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover permissão da função.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    rolePermitions,
    isLoading,
    error,
    clearError,
    list,
    create,
    remove,
  };
});