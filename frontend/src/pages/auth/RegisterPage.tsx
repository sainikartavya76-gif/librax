import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as 'STUDENT' | 'LIBRARIAN',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const registerMutation = useRegister();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const { confirmPassword, ...payload } = form;
    registerMutation.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">LIBRAX</span>
        </div>

        <h1 className="text-xl font-semibold text-ink mb-1">Create account</h1>
        <p className="text-sm text-ink-2 mb-7">Join your library management system</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="label-base">Full name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              className="input-base h-9"
              placeholder="Jane Smith"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="email" className="label-base">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-base h-9"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="label-base">Account type</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="select-base h-9"
            >
              <option value="STUDENT">Student</option>
              <option value="LIBRARIAN">Librarian</option>
            </select>
            <p className="mt-1 text-2xs text-ink-muted">
              Administrator accounts are provisioned separately.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="label-base">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="input-base h-9 pr-9"
                placeholder="Min. 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label-base">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-base h-9"
              placeholder="Re-enter password"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-crit bg-crit-bg px-3 py-2 rounded-md">{error}</p>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full h-9 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {registerMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
