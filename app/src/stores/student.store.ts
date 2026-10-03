// student.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface Person {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  birthday: string;
  gender: string;
  bi_number: string;
  nif?: string;
  phone: string;
  alternative_phone?: string;
  email?: string;
  province: string;
  municipality: string;
  neighborhood: string;
  street?: string;
  house_number?: string;
}

export interface Student {
  id: number;
  student_number: number;
  person_id: number;
  person: Person;
  guardian_name: string;
  guardian_phone: string;
  guardian_bi?: string;
  origin_school?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentPayload {
  firstname: string;
  middlename?: string;
  lastname: string;
  birthday: string | Date;
  gender: string;
  bi_number: string;
  nif?: string;
  phone: string;
  alternative_phone?: string;
  email?: string;
  province: string;
  municipality: string;
  neighborhood: string;
  street?: string;
  house_number?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_bi?: string;
  origin_school?: string;
}

export interface UpdateStudentPayload {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  birthday?: string | Date;
  gender?: string;
  bi_number?: string;
  nif?: string;
  phone?: string;
  alternative_phone?: string;
  email?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
  street?: string;
  house_number?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_bi?: string;
  origin_school?: string;
}

export const useStudentStore = defineStore('student', () => {
  const students = ref<Student[]>([]);
  const currentStudent = ref<Student | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Student[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, Student[]>('/students');
      students.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar estudantes.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, Student>('/students/' + encryptedId);
      currentStudent.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar estudante.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateStudentPayload): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, Student>('/students', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar estudante.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateStudentPayload): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, Student>('/students/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao atualizar estudante.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(id: number | string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      await api.delete('/students/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar estudante.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    students,
    currentStudent,
    isLoading,
    error,
    clearError,
    list,
    find,
    create,
    update,
    remove
  };
});