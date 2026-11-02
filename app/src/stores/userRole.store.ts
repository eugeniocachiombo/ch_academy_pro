import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';

export interface UserRole {
  id: number;
  user_id: number | string;
  role_id: number | string;
  school_id?: number | string;
}

export interface UserRolePayload {
  user_id: number | string;
  role_id: number | string;
  school_id?: number | string;
}

export const useUserRoleStore = defineStore('userRole', () => {
  const userRoles = ref<UserRole[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<UserRole[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<UserRole[]>('/user-roles');
      userRoles.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar vínculos de utilizadores.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: UserRolePayload): Promise<UserRole> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<UserRole>('/user-roles', payload);
      userRoles.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar vínculo.';
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
      await api.delete(`/user-roles/${encryptedId}`);
      userRoles.value = userRoles.value.filter(ur => ur.id !== Number(id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover vínculo.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    userRoles,
    isLoading,
    error,
    clearError,
    list,
    create,
    remove,
  };
});