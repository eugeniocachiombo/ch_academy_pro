import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Groupconfig {
  id: number;
  name: string;
  year_id: number;
  course_id: number;
  class_id: number;
  period_id: number;
  room_id: number;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupconfigPayload {
  name: string;
  year_id: number | null;
  course_id: number | null;
  class_id: number | null;
  period_id: number | null;
  room_id: number | null;
  school_id?: number | null;
}

export const useGroupconfigStore = defineStore('groupconfig', () => {
  const groupconfigs = ref<Groupconfig[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Groupconfig[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Groupconfig[]>('/groupconfigs');
      groupconfigs.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar configurações de grupos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: GroupconfigPayload): Promise<Groupconfig> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Groupconfig>('/groupconfigs', payload);
      groupconfigs.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a configuração de grupo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<GroupconfigPayload>): Promise<Groupconfig> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Groupconfig>(`/groupconfigs/${encryptedId}`, payload);
      const index = groupconfigs.value.findIndex(g => g.id === id);
      if (index !== -1) {
        groupconfigs.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a configuração de grupo.');
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
      await api.delete(`/groupconfigs/${encryptedId}`);
      groupconfigs.value = groupconfigs.value.filter(g => g.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a configuração de grupo.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { groupconfigs, isLoading, error, clearError, list, create, update, remove };
});