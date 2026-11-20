import apiClient from './client';

export const dsaApi = {
  search: (q: string, field: string, algorithm: string) =>
    apiClient.get('/dsa/search', { params: { q, field, algorithm } }).then(r => r.data),
  sort: (field: string, algorithm: string) =>
    apiClient.get('/dsa/sort', { params: { field, algorithm } }).then(r => r.data),
  visualizeQueue: () =>
    apiClient.get('/dsa/visualize/queue').then(r => r.data),
  visualizeStack: () =>
    apiClient.get('/dsa/visualize/stack').then(r => r.data),
};
