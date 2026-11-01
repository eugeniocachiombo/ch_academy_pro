import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import {
  can,
  isAdmin,
  getUserRoles,
  loadPermitions,
  resetPermitions,
} from '@/services/permition.service';

export interface UserRole {
  id: number;
  user_id?: number | string;
  role_id: number;
  role?: { id?: number; name?: string };
}

export interface User {
  id: number;
  name?: string | null;
  username: string;
  email?: string;
  status?: string;
  school_id?: number | string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const STORAGE_KEY = 'ch-academic-auth-token';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed<boolean>(() => !!token.value && !!currentUser.value);
  const userName = computed<string>(
    () => currentUser.value?.name || currentUser.value?.username || 'Utilizador'
  );

  function readSession(): { token: string; user: User } | null {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const savedToken = storage.getItem(STORAGE_KEY);
        const savedUser = storage.getItem('user');
        if (savedToken && savedUser) {
          return { token: savedToken, user: JSON.parse(savedUser) as User };
        }
      } catch {
        // Ignora falhas de storage
      }
    }
    return null;
  }

  function clearSession(): void {
    currentUser.value = null;
    token.value = null;
    delete api.defaults.headers.common['Authorization'];

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('user');
      localStorage.removeItem('userID');

      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userID');
    } catch {
      // Ignora falhas de storage
    }
  }

  function setSession(newToken: string, user: User, remember: boolean = true): void {
    clearSession();
    token.value = newToken;
    currentUser.value = user;

    const targetStorage = remember ? localStorage : sessionStorage;
    targetStorage.setItem(STORAGE_KEY, newToken);
    targetStorage.setItem('user', JSON.stringify(user));
    targetStorage.setItem('userID', String(user.id));

    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearError(): void {
    error.value = null;
  }

  async function loadAccess(): Promise<void> {
    if (!token.value) return;
    try {
      await loadPermitions();
    } catch {
      // Falha ao carregar permissões
    }
  }

  async function login(username: string, password: string, remember: boolean = true): Promise<User> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<AuthResponse>('/auth/login', { username, password });

      if (response && response.token && response.user) {
        setSession(response.token, response.user, remember);
        await loadAccess();
        return response.user;
      }

      throw new Error('Resposta inválida do servidor.');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Nome de utilizador ou palavra-passe incorretos.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    clearSession();
    resetPermitions();
    error.value = null;
    window.location.href = '/';
  }

  function initAuth(): void {
    const session = readSession();
    if (session) {
      currentUser.value = session.user;
      token.value = session.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
      loadAccess();
    } else {
      clearSession();
    }
  }

  function getPermition(permiName: string): boolean {
    const id = currentUser.value?.id;
    if (!id) return false;
    if (isAdmin(id)) return true;
    return can(id).includes(permiName);
  }

  function getUserRole(): UserRole | undefined {
    const id = currentUser.value?.id;
    return id ? getUserRoles(id)[0] : undefined;
  }

  initAuth();

  return {
    currentUser,
    token,
    isLoading,
    error,
    isAuthenticated,
    userName,
    loadAccess,
    getPermition,
    getUserRole,
    clearError,
    clearSession,
    login,
    logout,
    initAuth,
  };
});