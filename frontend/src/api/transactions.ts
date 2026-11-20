import apiClient from './client';
import { Transaction, PaginatedResponse } from '../types';

export const transactionsApi = {
  getTransactions: (params?: any) =>
    apiClient.get('/transactions', { params }).then(r => r.data as PaginatedResponse<Transaction>),
  getTransaction: (id: string | number) =>
    apiClient.get(`/transactions/${id}`).then(r => r.data as Transaction),
  issueBook: (data: { book_id: string | number; user_id: string | number; due_date?: string; notes?: string }) =>
    apiClient.post('/transactions/issue', data).then(r => r.data as Transaction),
  returnBook: (id: string | number) =>
    apiClient.post(`/transactions/return/${id}`).then(r => r.data as Transaction),
  getOverdueTransactions: () =>
    apiClient.get('/transactions', { params: { status: 'OVERDUE' } }).then(r => r.data as PaginatedResponse<Transaction>),
};
