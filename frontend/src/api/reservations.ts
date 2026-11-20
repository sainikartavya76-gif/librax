import apiClient from './client';
import { Reservation } from '../types';

export const reservationsApi = {
  getReservations: (params?: Record<string, unknown>) =>
    apiClient.get('/reservations', { params }).then(r => r.data),
  createReservation: (book_id: string) =>
    apiClient.post('/reservations', { book_id }).then(r => r.data as Reservation),
  cancelReservation: (id: string) =>
    apiClient.delete(`/reservations/${id}`).then(r => r.data),
  getBookQueue: (bookId: string) =>
    apiClient.get(`/reservations/book/${bookId}`).then(r => r.data),
};
