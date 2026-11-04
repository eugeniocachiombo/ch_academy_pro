import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Period {
  id: number;
  name: string;
  description?: string | null;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodPayload {
  name: string;
  description?: string | null;
  school_id?: number | null;
}

export const usePeriodStore = defineStore('period', () => {
  const periods = ref<Period[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  
  const items = computed(() => periods.value);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Period[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Period[]>('/periods'); 
      periods.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar os turnos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  
  async function fetch(): Promise<Period[]> {
    return await list();
  }

  async function create(payload: PeriodPayload): Promise<Period> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Period>('/periods', payload);
      periods.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o turno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<PeriodPayload>): Promise<Period> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Period>(`/periods/${encryptedId}`, payload);
      const index = periods.value.findIndex(p => p.id === id);
      if (index !== -1) {
        periods.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao actualizar o turno.');
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
      await api.delete(`/periods/${encryptedId}`);
      periods.value = periods.value.filter(p => p.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o turno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { 
    periods, 
    items, 
    isLoading, 
    error, 
    clearError, 
    list, 
    fetch, 
    create, 
    update, 
    remove 
  };
});