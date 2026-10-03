import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '../services/crypto.service';

export interface AcademicRoom {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicRoomPayload {
  name: string;
}

export interface UpdateAcademicRoomPayload {
  name?: string;
}

export const useAcademicRoomStore = defineStore('academicRoom', () => {
  const loggedId = String(localStorage.getItem('userID'));
  const userId = cryptoService.encryptId(loggedId); 
  const academicRooms = ref<AcademicRoom[]>([]);
  const currentAcademicRoom = ref<AcademicRoom | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<AcademicRoom[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, AcademicRoom[]>('/academic-rooms');
      academicRooms.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao carregar salas.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function find(id: number | string): Promise<AcademicRoom> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.get<unknown, AcademicRoom>('/academic-rooms/' + encryptedId);
      currentAcademicRoom.value = response;
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao procurar sala.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: CreateAcademicRoomPayload): Promise<AcademicRoom> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<unknown, AcademicRoom>('/academic-rooms', payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar sala.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: UpdateAcademicRoomPayload): Promise<AcademicRoom> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<unknown, AcademicRoom>('/academic-rooms/' + encryptedId, payload);
      await list();
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao actualizar sala.';
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
      await api.delete('/academic-rooms/' + encryptedId);
      await list();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao eliminar sala.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    academicRooms,
    currentAcademicRoom,
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