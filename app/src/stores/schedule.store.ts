import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Schedule {
  id: number;
  groupconfig_id: number;
  subject_id: number;
  teacher_id: number;
  year_id: number;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  start_time: string;
  end_time: string;
  school_id: number | null;
  groupconfig?: any;
  subject?: any;
  teacher?: any;
  year?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchedulePayload {
  groupconfig_id: number | null;
  subject_id: number | null;
  teacher_id: number | null;
  year_id: number | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  school_id: number | null;
}

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref<Schedule[]>([]);
  const groupConfigs = ref<any[]>([]);
  const teacherOccupations = ref<any[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Schedule[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Schedule[]>('/schedules');
      schedules.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar horários.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchGroupConfigs(): Promise<any[]> {
    try {
      const response = await api.get<any[]>('/groupconfigs');
      groupConfigs.value = response;
      return response;
    } catch (err: any) {
      return [];
    }
  }

  async function fetchTeacherOccupations(): Promise<any[]> {
    try {
      const response = await api.get<any[]>('/teacherocupations');
      teacherOccupations.value = response;
      return response;
    } catch (err: any) {
      return [];
    }
  }

  async function create(payload: SchedulePayload): Promise<Schedule> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Schedule>('/schedules', payload);
      schedules.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar o horário.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<SchedulePayload>): Promise<Schedule> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Schedule>(`/schedules/${encryptedId}`, payload);
      const index = schedules.value.findIndex(s => s.id === id);
      if (index !== -1) {
        schedules.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar o horário.');
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
      await api.delete(`/schedules/${encryptedId}`);
      schedules.value = schedules.value.filter(s => s.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover o horário.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    schedules,
    groupConfigs,
    teacherOccupations,
    isLoading,
    error,
    clearError,
    list,
    fetchGroupConfigs,
    fetchTeacherOccupations,
    create,
    update,
    remove
  };
});