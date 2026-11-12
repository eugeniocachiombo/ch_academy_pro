import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Studentparent {
  id: number;
  student_id: number;
  parent_id: number;
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentparentPayload {
  student_id: number;
  parent_id: number;
  school_id?: number | null;
}

export const useStudentparentStore = defineStore('studentparent', () => {
  const studentparents = ref<Studentparent[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Studentparent[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Studentparent[]>('/studentparents');
      studentparents.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar as relações de estudantes e encarregados.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: StudentparentPayload): Promise<Studentparent> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Studentparent>('/studentparents', payload);
      studentparents.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a relação entre estudante e encarregado.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<StudentparentPayload>): Promise<Studentparent> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Studentparent>(`/studentparents/${encryptedId}`, payload);
      const index = studentparents.value.findIndex(sp => sp.id === id);
      if (index !== -1) {
        studentparents.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a relação entre estudante e encarregado.');
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
      await api.delete(`/studentparents/${encryptedId}`);
      studentparents.value = studentparents.value.filter(sp => sp.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a relação entre estudante e encarregado.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { studentparents, isLoading, error, clearError, list, create, update, remove };
});