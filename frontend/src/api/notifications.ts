import apiClient from './client';
import { Notification } from '../types';

export const notificationsApi = {
  getNotifications: () =>
    apiClient.get('/notifications').then(r => r.data as Notification[]),
  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then(r => r.data),
  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`).then(r => r.data),
};
