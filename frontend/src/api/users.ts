import apiClient from './client';
import { User, PaginatedResponse } from '../types';

export const usersApi = {
  getUsers: (params: any) =>
    apiClient.get('/users', { params }).then(r => r.data as PaginatedResponse<User>),
  getUser: (id: string) =>
    apiClient.get(`/users/${id}`).then(r => r.data as User),
  updateUser: (id: string, data: any) =>
    apiClient.put(`/users/${id}`, data).then(r => r.data as User),
  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`).then(r => r.data),
  activateUser: (id: string) =>
    apiClient.post(`/users/${id}/activate`).then(r => r.data),
  deactivateUser: (id: string) =>
    apiClient.post(`/users/${id}/deactivate`).then(r => r.data),
};
