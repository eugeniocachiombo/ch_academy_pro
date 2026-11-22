import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Municipality {
  id: number | string;
  name: string;
  province_id: number | string;
  province?: { id: number; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMunicipalityPayload {
  name: string;
  province_id: number | string;
}

export interface UpdateMunicipalityPayload {
  name?: string;
  province_id?: number | string;
}

export const useMunicipalityStore = defineStore('municipality', () => {
  const municipalities = ref<Municipality[]>([]);
  const currentMunicipality = ref<Municipality | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Municipality[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, any>('/municipalities');
      const data = response.data || response;
      municipalities.value = data;
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar municípios.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Municipality> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, any>('/municipalities/' + encryptedId);
      const data = response.data || response;
      currentMunicipality.value = data;
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar município.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateMunicipalityPayload): Promise<Municipality> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, any>('/municipalities', payload);
      const data = response.data || response;
      await list();
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar município.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateMunicipalityPayload): Promise<Municipality> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, any>('/municipalities/' + encryptedId, payload);
      const data = response.data || response;
      await list();
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar município.';
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
      await api.delete('/municipalities/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar município.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    municipalities,
    currentMunicipality,
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