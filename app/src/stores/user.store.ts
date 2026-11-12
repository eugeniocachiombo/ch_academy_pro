import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { Person } from './person.store';

export interface Role {
  id: number | string;
  name: string;
}

export interface User {
  id: number;
  name?: string | null;
  username: string;
  email?: string;
  status?: string;
  school_id?: number | string | null;
  photo?: string | null;
  role?: Role;
  person?: Person;
}

export interface RegisterPayload {
  name?: string;
  username: string;
  email?: string;
  password?: string;
  status?: string;
  school_id?: number | string;
}

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  function getUserRole(): Role | null {
    return currentUser.value?.role ?? null;
  }

  async function list(): Promise<User[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<User[]>('/users');
      users.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar utilizadores.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(payload: RegisterPayload): Promise<User> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<User>('/users', payload);
      users.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao realizar o cadastro.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<RegisterPayload>): Promise<User> {
    isLoading.value = true;
    error.value = null;

    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<User>(`/users/${encryptedId}`, payload);
      
      const numericId = Number(id);
      const index = users.value.findIndex(u => Number(u.id) === numericId);
      if (index !== -1) {
        users.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar o utilizador.';
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
      await api.delete(`/users/${encryptedId}`);
      
      const numericId = Number(id);
      users.value = users.value.filter(u => Number(u.id) !== numericId);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover o utilizador.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    users,
    currentUser,
    isLoading,
    error,
    clearError,
    getUserRole,
    list,
    register,
    update,
    remove,
  };
});