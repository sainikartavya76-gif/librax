import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/auth.store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

export function useLogin() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (data) => {
      useAuthStore.getState().login(data.access_token, {} as any);
      const user = await authApi.me();
      login(data.access_token, user);
      const from = (location.state as any)?.from || '/app/dashboard';
      navigate(from, { replace: true });
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || e.message || 'Login failed'),
  });
}

export function useRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: any) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration successful. Please login.');
      navigate('/login');
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Registration failed'),
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate('/login');
  };
}
