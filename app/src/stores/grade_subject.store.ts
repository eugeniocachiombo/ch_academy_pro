import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface GradeSubjectGroup {
  id: number;
  name: string;
  level: number;
  description?: string;
  subjects: Array<{
    id: number;
    subjectId: number;
    subject: {
      id: number;
      name: string;
      code: string;
    }
  }>;
}

export const useGradeSubjectStore = defineStore('gradeSubject', () => {
  const gradeSubjects = ref<GradeSubjectGroup[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError() {
    error.value = null;
  }

  async function list(): Promise<GradeSubjectGroup[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, GradeSubjectGroup[]>('/grade-subjects');
      gradeSubjects.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar matriz curricular.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function save(gradeId: number, subjectIds: number[]): Promise<any> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedGradeId = cryptoService.encryptId(String(gradeId));
      const response = await api.post('/grade-subjects', {
        encryptedGradeId,
        subjectIds
      });
      await list();
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao salvar disciplinas da classe.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function remove(gradeId: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(gradeId));
      await api.delete(`/grade-subjects/${encryptedId}`);
      await list();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao remover disciplinas da classe.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    gradeSubjects,
    isLoading,
    error,
    clearError,
    list,
    save,
    remove
  };
});