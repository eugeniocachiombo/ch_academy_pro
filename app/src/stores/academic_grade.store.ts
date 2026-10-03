import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface AcademicGrade {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicGradePayload {
  name: string;
}

export interface UpdateAcademicGradePayload {
  name?: string;
}

export const useAcademicGradeStore = defineStore('academicGrade', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const academicGrades = ref<AcademicGrade[]>([]);
  const currentAcademicGrade = ref<AcademicGrade | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<AcademicGrade[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, AcademicGrade[]>('/academic-grades');
      academicGrades.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar classes.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<AcademicGrade> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, AcademicGrade>('/academic-grades/' + encryptedId);
      currentAcademicGrade.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar classe.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateAcademicGradePayload): Promise<AcademicGrade> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, AcademicGrade>('/academic-grades', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar classe.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateAcademicGradePayload): Promise<AcademicGrade> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, AcademicGrade>('/academic-grades/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar classe.';
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
      await api.delete('/academic-grades/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar classe.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    academicGrades,
    currentAcademicGrade,
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