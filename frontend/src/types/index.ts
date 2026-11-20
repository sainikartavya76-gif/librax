// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'LIBRARIAN' | 'STUDENT';

export type TransactionStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE';

export type ReservationStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export type NotificationType = 'INFO' | 'WARNING' | 'OVERDUE' | 'FINE' | 'RESERVATION' | 'DUE_REMINDER' | 'AVAILABLE' | 'SYSTEM';

export type FineStatus = 'PAID' | 'UNPAID';

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface User {
  id: number | string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  phone?: string;
  student_id?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy compat
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
}

export interface Book {
  id: number | string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  cover_url?: string;
  cover_image_url?: string;
  total_copies: number;
  available_copies: number;
  shelf_location?: string;
  language?: string;
  pages?: number;
  reserved_count?: number;
  created_at?: string;
  // Legacy compat
  subtitle?: string;
  authors?: { id: string; name: string }[];
}

export interface Transaction {
  id: number | string;
  book_id: number | string;
  user_id: number | string;
  issued_by?: number | string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: TransactionStatus;
  notes?: string;
  created_at?: string;
  // Relations
  book?: Book;
  user?: User;
  fine?: Fine;
}

export interface Reservation {
  id: number | string;
  book_id: number | string;
  user_id: number | string;
  status: ReservationStatus;
  queue_position?: number;
  reserved_at?: string;
  expires_at?: string;
  fulfilled_at?: string;
  created_at?: string;
  // Relations
  book?: Book;
  user?: User;
}

export interface Fine {
  id: number | string;
  transaction_id: number | string;
  user_id: number | string;
  amount: number;
  overdue_days?: number;
  paid: boolean;
  paid_at?: string | null;
  created_at?: string;
  // Relations
  transaction?: Transaction;
  user?: User;
  // Legacy compat
  status?: FineStatus;
}

export interface Notification {
  id: number | string;
  user_id: number | string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  read?: boolean;
  created_at?: string;
}

export interface ActivityLog {
  id: number | string;
  user_id?: number | string;
  action: string;
  description?: string;
  entity_type?: string;
  entity_id?: number | string;
  created_at?: string;
  user?: User;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface DashboardStats {
  total_books: number;
  available_books: number;
  active_issues: number;
  overdue_count: number;
  total_members: number;
  books_issued_today: number;
  recent_activity: ActivityLog[];
  overdue_books: Transaction[];
  popular_books?: Book[];
}

export interface IssuanceDataPoint {
  date: string;
  issued: number;
  returned: number;
}

export interface CategoryDataPoint {
  category: string;
  count: number;
}

export interface OverdueRateStats {
  overdue_rate: number;
  avg_duration_days: number;
  total_fines_amount: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role?: Role;
  phone?: string;
  student_id?: string;
}

// ─── DSA Lab ─────────────────────────────────────────────────────────────────

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';
export type SearchAlgorithm = 'linear' | 'binary';

export interface SortStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
}

export interface SortResult {
  algorithm: SortAlgorithm;
  steps: SortStep[];
  comparisons: number;
  swaps: number;
  time_ms: number;
}

export interface SearchStep {
  array: number[];
  current?: number;
  left?: number;
  right?: number;
  mid?: number;
  found?: number;
}

export interface SearchResult {
  algorithm: SearchAlgorithm;
  steps: SearchStep[];
  found: boolean;
  index: number;
  comparisons: number;
}

export interface DSAQueueState {
  items: (string | number)[];
  maxSize: number;
}

export interface DSAStackState {
  items: (string | number)[];
  maxSize: number;
}

export interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface DSABSTState {
  root: BSTNode | null;
  size: number;
}

export interface LinkedListNode {
  value: string | number;
  next?: string | number | null;
}

export interface DSALinkedListState {
  nodes: LinkedListNode[];
  size: number;
}
