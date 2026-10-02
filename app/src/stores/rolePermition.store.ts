import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface RolePermition {
  id: number;
  permition_id: string;
  role_id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePermitionPayload {
  permition_id: string;
  role_id: string;
}

export interface UpdateRolePermitionPayload {
  permition_id?: string;
  role_id?: string;
}

export const useRolePermitionStore = defineStore('rolePermition', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const rolePermitions = ref<RolePermition[]>([]);
  const currentRolePermition = ref<RolePermition | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<RolePermition[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, RolePermition[]>('/role-permitions');
      rolePermitions.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar {{pluralLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<RolePermition> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, RolePermition>('/role-permitions/' + encryptedId);
      currentRolePermition.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar {{singularLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateRolePermitionPayload): Promise<RolePermition> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, RolePermition>('/role-permitions', payload);
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

  async function update(id: number | string, payload: UpdateRolePermitionPayload): Promise<RolePermition> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, RolePermition>('/role-permitions/' + encryptedId, payload);
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
      await api.delete('/role-permitions/' + encryptedId);
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
    rolePermitions,
    currentRolePermition,
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