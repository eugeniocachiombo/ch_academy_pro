import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Province {
  id: number | string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProvincePayload {
  name: string;
}

export interface UpdateProvincePayload {
  name?: string;
}

export const useProvinceStore = defineStore('province', () => {
  const provinces = ref<Province[]>([]);
  const currentProvince = ref<Province | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Province[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, any>('/provinces');
      const data = response.data || response;
      provinces.value = data;
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar províncias.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Province> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, any>('/provinces/' + encryptedId);
      const data = response.data || response;
      currentProvince.value = data;
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar província.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateProvincePayload): Promise<Province> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, any>('/provinces', payload);
      const data = response.data || response;
      await list();
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar província.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateProvincePayload): Promise<Province> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, any>('/provinces/' + encryptedId, payload);
      const data = response.data || response;
      await list();
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar província.';
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
      await api.delete('/provinces/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar província.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    provinces,
    currentProvince,
    isLoading,
    error,
    clearError,
    list,
    find,
    create,
    update,
    remove,
  };
});