import apiClient from './client';
import { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, email_or_username: email, password }).then(r => r.data),
  register: (data: any) =>
    apiClient.post('/auth/register', data).then(r => r.data),
  me: () => apiClient.get('/auth/me').then(r => r.data as User),
};
