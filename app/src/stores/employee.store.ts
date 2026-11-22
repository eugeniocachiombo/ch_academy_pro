import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

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

export interface Person extends PersonPayload {
  id: number;
}

export interface EmployeePositionItem {
  id: number;
  employee_id: number;
  position_id: number;
  is_primary: boolean;
  active: boolean;
  position?: { id: number; name: string } | null;
}

export interface Employee {
  id: number;
  person_id: number;
  person?: Person | null;
  department_id?: number | null;
  department?: { id: number; name: string } | null;
  position_id?: number | null;
  position?: { id: number; name: string } | null;
  employee_positions?: EmployeePositionItem[];
  school_id?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeePayload {
  person: PersonPayload;
  department_id?: number | null;
  position_id?: number | null;
  position_ids?: number[];
  school_id?: number | null;
}

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Employee[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Employee[]>('/employees');
      employees.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar funcionários.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: EmployeePayload): Promise<Employee> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Employee>('/employees', payload);
      employees.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o funcionário.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(
    id: number | string,
    payload: Partial<EmployeePayload>
  ): Promise<Employee> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Employee>(`/employees/${encryptedId}`, payload);
      const index = employees.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        employees.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o funcionário.');
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
      await api.delete(`/employees/${encryptedId}`);
      employees.value = employees.value.filter((e) => e.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o funcionário.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { employees, isLoading, error, clearError, list, create, update, remove };
});