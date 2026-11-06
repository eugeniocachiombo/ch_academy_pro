import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Person {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  birthday: string;
  gender: string;
  bi_number: string;
  nif?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  house_number?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonPayload {
  firstname: string;
  middlename?: string | null;
  lastname: string;
  birthday: string;
  gender: string;
  bi_number: string;
  nif?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  province?: string | null;
  municipality?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  house_number?: string | null;
}

export const usePersonStore = defineStore('person', () => {
  const persons = ref<Person[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Person[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Person[]>('/people');
      persons.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar pessoas.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: PersonPayload): Promise<Person> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Person>('/people', payload);
      persons.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a pessoa.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<PersonPayload>): Promise<Person> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Person>(`/people/${encryptedId}`, payload);
      const index = persons.value.findIndex(p => p.id === Number(id));
      if (index !== -1) {
        persons.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a pessoa.');
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
      await api.delete(`/people/${encryptedId}`);
      persons.value = persons.value.filter(p => p.id !== Number(id));
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a pessoa.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { persons, isLoading, error, clearError, list, create, update, remove };
});