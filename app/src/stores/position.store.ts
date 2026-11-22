import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Position {
  id: number;
  name: string;
  editable?: boolean;
  department_id?: number | null;
  department?: { id: number; name: string } | null;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PositionPayload {
  name: string;
  department_id?: number | null;
  editable?: boolean;
}

export const usePositionStore = defineStore('position', () => {
  const positions = ref<Position[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Position[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Position[]>('/positions');
      positions.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar cargos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: PositionPayload): Promise<Position> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Position>('/positions', payload);
      positions.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o cargo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    id: number | string,
    payload: Partial<PositionPayload>
  ): Promise<Position> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Position>(`/positions/${encryptedId}`, payload);
      const index = positions.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        positions.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o cargo.');
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
      await api.delete(`/positions/${encryptedId}`);
      positions.value = positions.value.filter((p) => p.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o cargo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { positions, isLoading, error, clearError, list, create, update, remove };
});