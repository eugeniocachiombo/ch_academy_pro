import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import cryptoService from '@/services/crypto.service';
import {can} from '@/services/permition.service'

export interface Category {
  id: number;
  name: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name?: string | null;
  username: string;
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

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const users = ref<User[]>([]);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed<boolean>(() => !!token.value);
  const userName = computed<string>(
    () => currentUser.value?.name || currentUser.value?.username || 'Utilizador'
  );

  /**
   * Atualiza a sessão na memória, LocalStorage e nos cabeçalhos HTTP do Axios
   */
  function setSession(newToken: string | null, user: User | null): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userID');

    token.value = newToken;
    currentUser.value = user;

    if (newToken) {
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userID', String(user.id));
    }
  }

  function clearError(): void {
    error.value = null;
  }

  async function login(username: string, password: string): Promise<boolean | string> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<unknown, AuthResponse>('/users/login', { username, password });

      if (response && response.token) {
        setSession(response.token, response.user);
        
        // Recarrega a página para aplicar o estado limpo
        window.location.reload();
        return true;
      }

      return 'Resposta inválida do servidor.';
    } catch (err: any) {
      const message = 'Nome de utilizador ou palavra-passe incorretos.';
      error.value = message;
      return message;
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
    setSession(null, null);
    error.value = null;
    
    // Recarrega a página e redireciona para a raiz ou login
    window.location.href = '/';
  }

  /**
   * Inicializa o estado do utilizador e configura o Token no arranque da aplicação
   */
  function initUser(): void {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        currentUser.value = JSON.parse(savedUser) as User;
        token.value = savedToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch {
        setSession(null, null);
      }
    } else {
      setSession(null, null);
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
      const message = err.response?.data?.message || 'Erro ao carregar {{pluralLabel.toLowerCase()}}.';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  let userRole: Array<any> = [];
  async function init() {
      userRole = await api.get<unknown, any[]>('/user-roles');; 
  }
  init();

  function getPermition(permiName: string): boolean {

    // verificação admin
    const admin = userRole.find((e) => e.user_id == currentUser?.value?.id && e.role_id == 1);
    if(admin) return true;

    const permitions = can(currentUser?.value?.id || '')
    // Saida em arrays
    const list: string[] = [];
    permitions.forEach((e) => {
      list.push(e.join(', '))
    });
  
    // saida em textos
    let result = false;
    list.forEach((e) => {
      if(e.includes(permiName)) {
        result = true;
        return
      };
    });
   
    return result;
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
    list,
    login,
    register,
    logout,
    initUser
  };
});