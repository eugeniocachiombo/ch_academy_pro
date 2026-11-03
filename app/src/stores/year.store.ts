import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Year {
  id: number;
  name: string;
  startdate?: string | null;
  enddate?: string | null;
  isCurrent?: boolean;
  school_id: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface YearPayload {
  name: string;
  startdate?: string | null;
  enddate?: string | null;
  isCurrent?: boolean;
  school_id: number | null;
}

export const useYearStore = defineStore('year', () => {
  const years = ref<Year[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Year[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Year[]>('/years');
      years.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar anos letivos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: YearPayload): Promise<Year> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Year>('/years', payload);
      years.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o ano letivo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<YearPayload>): Promise<Year> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Year>(`/years/${encryptedId}`, payload);
      const index = years.value.findIndex(y => y.id === id);
      if (index !== -1) {
        years.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o ano letivo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete(`/years/${encryptedId}`);
      years.value = years.value.filter(y => y.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o ano letivo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { years, isLoading, error, clearError, list, create, update, remove };
});