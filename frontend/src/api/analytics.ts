import apiClient from './client';
import { DashboardStats } from '../types';

export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard').then(r => r.data as DashboardStats),
  getIssuanceChart: () => apiClient.get('/analytics/charts/issuance').then(r => r.data),
  getCategoriesChart: () => apiClient.get('/analytics/charts/categories').then(r => r.data),
  getFinesChart: () => apiClient.get('/analytics/charts/fines').then(r => r.data),
  getTopBooks: () => apiClient.get('/analytics/top-books').then(r => r.data),
};
