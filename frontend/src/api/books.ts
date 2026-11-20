import apiClient from './client';
import { Book, PaginatedResponse } from '../types';

export const booksApi = {
  getBooks: (params: any) =>
    apiClient.get('/books', { params }).then(r => r.data as PaginatedResponse<Book>),
  getBook: (id: string) =>
    apiClient.get(`/books/${id}`).then(r => r.data as Book),
  createBook: (data: any) =>
    apiClient.post('/books', data).then(r => r.data as Book),
  updateBook: (id: string, data: any) =>
    apiClient.put(`/books/${id}`, data).then(r => r.data as Book),
  deleteBook: (id: string) =>
    apiClient.delete(`/books/${id}`).then(r => r.data),
  getBookHistory: (id: string) =>
    apiClient.get(`/books/${id}/history`).then(r => r.data),
  searchBooks: (params: any) =>
    apiClient.get('/books/search', { params }).then(r => r.data),
};
