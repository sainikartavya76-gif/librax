import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const apiOrigin = typeof window !== 'undefined' && (window.location.port === '8000' || !window.location.port)
  ? ''
  : 'http://localhost:8000';

const client = axios.create({
  baseURL: apiOrigin,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
