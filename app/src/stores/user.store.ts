import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import { can } from '@/services/permition.service';

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

const STORAGE_KEY = 'edusmart-auth-token';

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

  /**
   * Lê o token guardado (verificando tanto localStorage quanto sessionStorage baseando-se no "remember")
   */
  function readSession(): { token: string; user: User } | null {
    for (const storage of [localStorage, sessionStorage]) {
      try {
        const savedToken = storage.getItem(STORAGE_KEY);
        const savedUser = storage.getItem('user');
        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser) as User;
          return { token: savedToken, user: parsedUser };
        }
      } catch {
        /* ignora falhas de parsing ou storage indisponível */
      }
    }
    return null;
  }

  /**
   * Limpa completamente a sessão da memória e dos storages (localStorage e sessionStorage)
   */
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

  /**
   * Atualiza a sessão na memória, Storages corretos e nos cabeçalhos HTTP do Axios
   */
  function setSession(newToken: string | null, user: User | null, remember: boolean = true): void {
    // Limpa qualquer sessão anterior de ambos os storages antes de definir a nova
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

  async function login(username: string, password: string, remember: boolean = true): Promise<User | string> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<unknown, AuthResponse>('/users/login', { username, password });

      if (response && response.token && response.user) {
        setSession(response.token, response.user, remember);
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
      const response = await api.post<unknown, User>('/users', payload);
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao realizar o cadastro.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    clearSession();
    error.value = null;
    window.location.href = '/';
  }

  /**
   * Inicializa o estado do utilizador e configura o Token no arranque da aplicação
   */
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
      const message = err.response?.data?.message || 'Erro ao carregar utilizadores.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // 1. Transforme em um ref para manter a reatividade
  const userRole = ref<any[]>([]);

  async function initRoles() {
    try {
      // 2. Aguarde a resposta da API
      const response = await api.get<unknown, any[]>('/user-roles');
      userRole.value = response;
    } catch {
      userRole.value = [];
    }
  }
  initRoles();

  function getPermition(permiName: string): boolean {
    const admin = userRole.value.find((e) => e.user_id == currentUser?.value?.id && e.role_id == 1);
    if (admin) return true;

    if (!currentUser?.value?.id) return false;

    const permitions = can(currentUser.value.id);
    const list: string[] = [];
    permitions.forEach((e) => {
      list.push(e.join(', '));
    });

    let result = false;
    list.forEach((e) => {
      if (e.includes(permiName)) {
        result = true;
      }
    });

    return result;
  }

  function getUserRole(): any {
    return userRole.value.find((e) => e.user_id == currentUser?.value?.id);
  }

  // Executa a verificação ao instanciar a store
  initUser();

  return {
    currentUser,
    users,
    token,
    isLoading,
    error,
    isAuthenticated,
    userName,
    getPermition,
    clearError,
    clearSession,
    getUserRole,
    list,
    login,
    register,
    logout,
    initUser,
  };
});