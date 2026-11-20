import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, Zap, Shield, BookMarked, GraduationCap } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@librax.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    loginMutation.mutate({ email: userEmail, password: userPass });
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Header */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink">LIBRAX</span>
          </Link>

          <h1 className="text-2xl font-semibold text-ink mb-1">Sign in to workspace</h1>
          <p className="text-xs text-ink-2">Enter credentials or choose one-click instant demo access below.</p>
        </div>

        {/* ⚡ 1-Click Instant Demo Cards */}
        <div className="card p-3.5 bg-surface-2 border-accent/30 space-y-2">
          <div className="flex items-center justify-between text-2xs font-bold font-mono uppercase text-accent">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> 1-Click Instant Demo Login
            </span>
            <span className="text-3xs text-ink-muted">Ready to launch</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@librax.com', 'Admin@123')}
              disabled={loginMutation.isPending}
              className="p-2 rounded-md bg-surface border border-border hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-18"
            >
              <div className="flex items-center justify-between w-full">
                <Shield className="w-3.5 h-3.5 text-warn" />
                <span className="text-3xs font-mono text-ink-muted">ADMIN</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-ink block leading-tight group-hover:text-accent">Admin</span>
                <span className="text-3xs text-ink-muted block mt-0.5">All Controls</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('librarian@librax.com', 'Lib@123')}
              disabled={loginMutation.isPending}
              className="p-2 rounded-md bg-surface border border-border hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-18"
            >
              <div className="flex items-center justify-between w-full">
                <BookMarked className="w-3.5 h-3.5 text-accent" />
                <span className="text-3xs font-mono text-ink-muted">STAFF</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-ink block leading-tight group-hover:text-accent">Librarian</span>
                <span className="text-3xs text-ink-muted block mt-0.5">Circulation</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student@librax.com', 'Student@123')}
              disabled={loginMutation.isPending}
              className="p-2 rounded-md bg-surface border border-border hover:border-accent hover:bg-accent-bg text-left transition-all group flex flex-col justify-between h-18"
            >
              <div className="flex items-center justify-between w-full">
                <GraduationCap className="w-3.5 h-3.5 text-info" />
                <span className="text-3xs font-mono text-ink-muted">MEMBER</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-ink block leading-tight group-hover:text-accent">Student</span>
                <span className="text-3xs text-ink-muted block mt-0.5">Loans/Holds</span>
              </div>
            </button>
          </div>
        </div>

        {/* Traditional Form */}
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 bg-surface">
          <div>
            <label htmlFor="email" className="label-base">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-base h-9 text-xs"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label-base mb-0">Password</label>
              <Link
                to="/forgot-password"
                className="text-2xs text-accent hover:text-accent-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-base h-9 pr-9 text-xs"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || !email || !password}
            className="w-full h-9 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign In with Password'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted">
          New to the library?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
            Register new member account
          </Link>
        </p>
      </div>
    </div>
  );
}
