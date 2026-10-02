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
  role?: string;
  photo?: string;
}

export interface RegisterPayload {
  name?: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const STORAGE_KEY = 'ch-academic-auth-token';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const users = ref<User[]>([]);
  const token = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed<boolean>(() => !!token.value && !!currentUser.value);
  const userName = computed<string>(
    () => currentUser.value?.name || currentUser.value?.username || 'Utilizador'
  );

  /** Lê o token guardado (localStorage ou sessionStorage, conforme "remember") */
  function readSession(): { token: string; user: User } | null {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const savedToken = storage.getItem(STORAGE_KEY);
        const savedUser = storage.getItem('user');
        if (savedToken && savedUser) {
          return { token: savedToken, user: JSON.parse(savedUser) as User };
        }
      } catch {
        /* ignora falhas de parsing ou storage indisponível */
      }
    }
    return null;
  }

  /** Limpa a sessão da memória e dos storages */
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
      /* ignora se storage estiver indisponível */
    }
  }

  /** Actualiza a sessão na memória, nos storages e nos cabeçalhos do Axios */
  function setSession(newToken: string | null, user: User | null, remember: boolean = true): void {
    clearSession();

    if (newToken && user) {
      token.value = newToken;
      currentUser.value = user;

      const targetStorage = remember ? localStorage : sessionStorage;

      targetStorage.setItem(STORAGE_KEY, newToken);
      targetStorage.setItem('user', JSON.stringify(user));
      targetStorage.setItem('userID', String(user.id));

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  /**
   * Carrega roles e permissões. Só faz sentido com sessão ativa
   * (o token precisa estar no header antes da requisição).
   */
  async function loadAccess(): Promise<void> {
    if (!token.value) return;
    await loadPermitions();
  }

  async function login(username: string, password: string, remember: boolean = true): Promise<User | string> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<unknown, AuthResponse>('/users/login', { username, password });

      if (response && response.token && response.user) {
        setSession(response.token, response.user, remember);
        await loadAccess(); // garante permissões carregadas antes de navegar
        return response.user;
      }

      const msg = 'Resposta inválida do servidor.';
      error.value = msg;
      return msg;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Nome de utilizador ou palavra-passe incorretos.';
      error.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function register(payload: RegisterPayload): Promise<User> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.post<unknown, User>('/users', payload);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao realizar o cadastro.';
      throw err;
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

  /** Inicializa o utilizador e o token no arranque da aplicação */
  function initUser(): void {
    const session = readSession();

    if (session) {
      currentUser.value = session.user;
      token.value = session.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
    } else {
      clearSession();
    }
  }

  async function list(): Promise<User[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.get<unknown, User[]>('/users');
      users.value = response;
      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar utilizadores.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /** Síncrono: depende de loadAccess() já ter sido aguardado (login / router guard) */
  function getPermition(permiName: string): boolean {
    const id = currentUser.value?.id;
    if (!id) return false;
    if (isAdmin(id)) return true;
    return can(id).includes(permiName); // comparação exata
  }

  function getUserRole(): UserRole | undefined {
    const id = currentUser.value?.id;
    return id ? getUserRoles(id)[0] : undefined;
  }

  initUser();

  return {
    currentUser,
    users,
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
    list,
    login,
    register,
    logout,
    initUser,
  };
});