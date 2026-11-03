import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import { handleError, type ParsedError } from '@/helpers/handle-error';

export interface Room {
  id: number;
  name: string;
  school_id: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomPayload {
  name: string;
  school_id: number | null;
}

export const useRoomStore = defineStore('room', () => {
  const rooms = ref<Room[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  function clearError(): void {
    error.value = null;
  }

  async function list(): Promise<Room[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<Room[]>('/rooms');
      rooms.value = response;
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao carregar salas.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: RoomPayload): Promise<Room> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.post<Room>('/rooms', payload);
      rooms.value.push(response);
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao criar a sala.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  async function update(id: number | string, payload: Partial<RoomPayload>): Promise<Room> {
    isLoading.value = true;
    error.value = null;
    try {
      const encryptedId = cryptoService.encryptId(String(id));
      const response = await api.put<Room>(`/rooms/${encryptedId}`, payload);
      const index = rooms.value.findIndex(r => r.id === id);
      if (index !== -1) {
        rooms.value[index] = response;
      }
      return response;
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao atualizar a sala.');
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
      await api.delete(`/rooms/${encryptedId}`);
      rooms.value = rooms.value.filter(r => r.id !== id);
    } catch (err: any) {
      const parsed: ParsedError = handleError(err, 'Erro ao remover a sala.');
      error.value = parsed.message;
      throw parsed;
    } finally {
      isLoading.value = false;
    }
  }

  return { rooms, isLoading, error, clearError, list, create, update, remove };
});