import apiClient from './client';
import { Fine } from '../types';

export const finesApi = {
  getFines: (params?: Record<string, unknown>) =>
    apiClient.get('/fines', { params }).then(r => r.data),
  payFine: (id: string) =>
    apiClient.patch(`/fines/${id}/pay`).then(r => r.data as Fine),
  getUnpaidFines: () =>
    apiClient.get('/fines/unpaid').then(r => r.data),
};
