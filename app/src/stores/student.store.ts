import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';
import { type User } from './user.store';
import { type PersonPayload } from './person.store';

export interface Student {
  id: number;
  processnum: string;
  user_id: number;
  province_id?: string | null;
  municipality_id?: string | null;
  address?: string | null;
  fathername?: string | null;
  mothername?: string | null;
  phone?: string | null;
  origin_school?: string | null;
  municipalityId?: number | null;
  provinceId?: number | null;
  school_id?: number | null;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPayload {
  processnum?: string;
  user_id?: number | null;
  province_id?: string | null;
  municipality_id?: string | null;
  address?: string | null;
  fathername?: string | null;
  mothername?: string | null;
  phone?: string | null;
  origin_school?: string | null;
  municipalityId?: number | null;
  provinceId?: number | null;
  school_id?: number | null;
  person?: PersonPayload;
}

function buildError(err: any, fallback: string): ParsedError {
  const parsed = handleError(err, fallback) as any;
  const errors =
    parsed?.errors ??
    err?.response?.data?.errors ??
    err?.data?.errors ??
    err?.errors ??
    undefined;
  return Object.assign(parsed, { errors });
}

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Student[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Student[]>('/students');
      students.value = response;
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao carregar os alunos.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function checkBi(bi: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(`/students/check-bi/${encodeURIComponent(bi.trim())}`);
    return !!response.exists;
  }

  async function create(payload: StudentPayload): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Student>('/students', payload);
      students.value.push(response);
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao registar o aluno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<StudentPayload>): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Student>(`/students/${encryptedId}`, payload);
      const index = students.value.findIndex(s => s.id === Number(id));
      if (index !== -1) {
        students.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao actualizar o aluno.');
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
      await api.delete(`/students/${encryptedId}`);
      students.value = students.value.filter(s => s.id !== Number(id));
    } catch (err: any) {
      const parsed = buildError(err, 'Erro ao eliminar o aluno.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { students, isLoading, error, clearError, list, create, update, remove, checkBi };
});