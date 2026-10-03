import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface AcademicClass {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicClassPayload {
  name: string;
}

export interface UpdateAcademicClassPayload {
  name?: string;
}

export const useAcademicClassStore = defineStore('academicClass', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const academicClasses = ref<AcademicClass[]>([]);
  const currentAcademicClass = ref<AcademicClass | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<AcademicClass[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, AcademicClass[]>('/academic-classes');
      academicClasses.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar turmas.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<AcademicClass> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, AcademicClass>('/academic-classes/' + encryptedId);
      currentAcademicClass.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar turma.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateAcademicClassPayload): Promise<AcademicClass> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, AcademicClass>('/academic-classes', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar turma.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateAcademicClassPayload): Promise<AcademicClass> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, AcademicClass>('/academic-classes/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar turma.';
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
      await api.delete('/academic-classes/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar turma.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    academicClasses,
    currentAcademicClass,
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