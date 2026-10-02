import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Injeta o token JWT se existir no localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Interceptor de Resposta: Desempacota response.data e trata status 204
api.interceptors.response.use(
  (response: AxiosResponse) => (response.status === 204 ? null : response.data),
  (error: unknown) => Promise.reject(error)
);