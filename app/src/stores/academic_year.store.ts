import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface AcademicYear {
  id: number;
  name: string;
  isCurrent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearPayload {
  name: string;
  isCurrent?: boolean;
}

export interface UpdateAcademicYearPayload {
  name?: string;
  isCurrent?: boolean;
}

export const useAcademicYearStore = defineStore('academicYear', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const academicYears = ref<AcademicYear[]>([]);
  const currentAcademicYear = ref<AcademicYear | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<AcademicYear[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, AcademicYear[]>('/academic-years');
      academicYears.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar anos lectivos.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<AcademicYear> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, AcademicYear>('/academic-years/' + encryptedId);
      currentAcademicYear.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar ano lectivo.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, AcademicYear>('/academic-years', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar ano lectivo.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateAcademicYearPayload): Promise<AcademicYear> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, AcademicYear>('/academic-years/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar ano lectivo.';
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
      await api.delete('/academic-years/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar ano lectivo.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    academicYears,
    currentAcademicYear,
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