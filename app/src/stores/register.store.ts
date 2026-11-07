import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export enum RegisterStatus {
  ACTIVE = 'ACTIVE',
  TRANSFER = 'TRANSFER',
  GIVEUP = 'GIVEUP',
  CONCLUD = 'CONCLUD',
  CANCELED = 'CANCELED',
}

export interface Register {
  id: number;
  registnum: number;
  student_id: number;
  groupconfig_id: number;
  year_id: number;
  date?: string | null;
  status: RegisterStatus;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
  student?: any;
  groupconfig?: any;
  year?: any;
}

export interface RegisterPayload {
  registnum?: number | null;
  student_id: number | null;
  groupconfig_id: number | null;
  year_id: number | null;
  date?: string | null;
  status?: RegisterStatus | string | null;
  school_id?: number | null;
}

export const useRegisterStore = defineStore('register', () => {
  const registers = ref<Register[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Register[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Register[]>('/registers');
      registers.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar matrículas.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: RegisterPayload): Promise<Register> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Register>('/registers', payload);
      registers.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a matrícula.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<RegisterPayload>): Promise<Register> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Register>(`/registers/${encryptedId}`, payload);
      const index = registers.value.findIndex(r => r.id === Number(id));
      if (index !== -1) {
        registers.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a matrícula.');
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
      await api.delete(`/registers/${encryptedId}`);
      registers.value = registers.value.filter(r => r.id !== Number(id));
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a matrícula.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { registers, isLoading, error, clearError, list, create, update, remove };
});