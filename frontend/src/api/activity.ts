import apiClient from './client';
export const activityApi = {
  getActivity: (params?: Record<string, unknown>) =>
    apiClient.get('/activity', { params }).then(r => r.data),
};
