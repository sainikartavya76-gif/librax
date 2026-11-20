import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import BooksPage from '../pages/books/BooksPage';
import BookDetailPage from '../pages/books/BookDetailPage';
import AddBookPage from '../pages/books/AddBookPage';
import EditBookPage from '../pages/books/EditBookPage';
import MembersPage from '../pages/MembersPage';
import TransactionsPage from '../pages/TransactionsPage';
import ReservationsPage from '../pages/ReservationsPage';
import FinesPage from '../pages/FinesPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import DSALabPage from '../pages/DSALabPage';
import NotificationsPage from '../pages/NotificationsPage';
import ActivityPage from '../pages/ActivityPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Protected application shell
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'books', element: <BooksPage /> },
      { path: 'books/add', element: <AddBookPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'books/:id/edit', element: <EditBookPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'fines', element: <FinesPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'dsa-lab', element: <DSALabPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },

  // Legacy redirects
  { path: '/dashboard', element: <Navigate to="/app/dashboard" replace /> },
  { path: '/books', element: <Navigate to="/app/books" replace /> },
  { path: '/members', element: <Navigate to="/app/members" replace /> },
  { path: '/transactions', element: <Navigate to="/app/transactions" replace /> },
  { path: '/reservations', element: <Navigate to="/app/reservations" replace /> },
  { path: '/fines', element: <Navigate to="/app/fines" replace /> },
  { path: '/analytics', element: <Navigate to="/app/analytics" replace /> },
  { path: '/dsa-lab', element: <Navigate to="/app/dsa-lab" replace /> },
  { path: '/notifications', element: <Navigate to="/app/notifications" replace /> },
  { path: '/activity', element: <Navigate to="/app/activity" replace /> },
  { path: '/settings', element: <Navigate to="/app/settings" replace /> },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
