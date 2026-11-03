import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Class {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassPayload {
  name: string;
}

export const useClassStore = defineStore('class', () => {
  const classes = ref<Class[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Class[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Class[]>('/classes');
      classes.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar classes.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: ClassPayload): Promise<Class> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Class>('/classes', payload);
      classes.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a classe.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<ClassPayload>): Promise<Class> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Class>(`/classes/${encryptedId}`, payload);
      const index = classes.value.findIndex(c => c.id === id);
      if (index !== -1) {
        classes.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a classe.');
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
      await api.delete(`/classes/${encryptedId}`);
      classes.value = classes.value.filter(c => c.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a classe.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { classes, isLoading, error, clearError, list, create, update, remove };
});