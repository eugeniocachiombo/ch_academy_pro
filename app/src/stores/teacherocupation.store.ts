import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';

export interface Teacherocupation {
  id: number;
  teacher_id: number | string;
  groupconfig_id: number | string;
  subject_id: number | string;
  year_id: number | string;
  school_id?: number | string | null;
}

export interface TeacherocupationPayload {
  teacher_id: number | string;
  groupconfig_id: number | string;
  subject_id: number | string;
  year_id: number | string;
  school_id?: number | string | null;
}

export const useTeacherocupationStore = defineStore('teacherocupation', () => {
  const teacherocupations = ref<Teacherocupation[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Teacherocupation[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Teacherocupation[]>('/teacherocupations');
      teacherocupations.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar as ocupações dos professores.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: TeacherocupationPayload): Promise<Teacherocupation> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<Teacherocupation>('/teacherocupations', payload);
      teacherocupations.value.push(response);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao associar ocupação ao professor.';
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
      await api.delete(`/teacherocupations/${encryptedId}`);
      teacherocupations.value = teacherocupations.value.filter(to => to.id !== Number(id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover ocupação do professor.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    teacherocupations,
    isLoading,
    error,
    clearError,
    list,
    create,
    remove,
  };
});