import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface UserRole {
  id: number;
  user_id: string;
  role_id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRolePayload {
  user_id: string;
  role_id: string;
}

export interface UpdateUserRolePayload {
  user_id?: string;
  role_id?: string;
}

export const useUserRoleStore = defineStore('userRole', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const userRoles = ref<UserRole[]>([]);
  const currentUserRole = ref<UserRole | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<UserRole[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, UserRole[]>('/user-roles');
      userRoles.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar {{pluralLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<UserRole> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, UserRole>('/user-roles/' + encryptedId);
      currentUserRole.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateUserRolePayload): Promise<UserRole> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, UserRole>('/user-roles', payload);
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

  async function update(id: number | string, payload: UpdateUserRolePayload): Promise<UserRole> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, UserRole>('/user-roles/' + encryptedId, payload);
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
      await api.delete('/user-roles/' + encryptedId);
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
    userRoles,
    currentUserRole,
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