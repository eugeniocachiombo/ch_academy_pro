import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Department {
  id: number;
  name: string;
  editable?: boolean;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentPayload {
  name: string;
  editable?: boolean;
}

export const useDepartmentStore = defineStore('department', () => {
  const departments = ref<Department[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Department[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Department[]>('/departments');
      departments.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar departamentos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: DepartmentPayload): Promise<Department> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Department>('/departments', payload);
      departments.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o departamento.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    id: number | string,
    payload: Partial<DepartmentPayload>
  ): Promise<Department> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Department>(`/departments/${encryptedId}`, payload);
      const index = departments.value.findIndex((d) => d.id === id);
      if (index !== -1) {
        departments.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o departamento.');
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
      await api.delete(`/departments/${encryptedId}`);
      departments.value = departments.value.filter((d) => d.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o departamento.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { departments, isLoading, error, clearError, list, create, update, remove };
});