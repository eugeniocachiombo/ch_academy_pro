import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';


export interface School {
  id: number;
  name: string;
  registed_by:      number | null;
  nif:               String | null;
  alternative_phone: String | null;
  email:            String | null;
  province_id:       Number | null;
  municipality_id:   Number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolPayload {
  name: string;
  registed_by:      number | null;
  nif:               String | null;
  alternative_phone: String | null;
  email:            String | null;
  province_id:       Number | null;
  municipality_id:   Number | null;
}

export const useSchoolStore = defineStore('school', () => {
  const schools = ref<School[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<School[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<School[]>('/schools');
      schools.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar escolas.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: SchoolPayload): Promise<School> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<School>('/schools', payload);
      schools.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a escola.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<SchoolPayload>): Promise<School> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<School>(`/schools/${encryptedId}`, payload);
      const index = schools.value.findIndex(y => y.id === id);
      if (index !== -1) {
        schools.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao actualizar a escola.');
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
      await api.delete(`/schools/${encryptedId}`);
      schools.value = schools.value.filter(y => y.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a escola.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { schools, isLoading, error, clearError, list, create, update, remove };
});