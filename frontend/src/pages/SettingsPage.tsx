import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { User, ShieldCheck, Sliders, Moon, Sun } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword) return;
    toast.success('Security credentials updated successfully.');
    setCurrPassword('');
    setNewPassword('');
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('librax-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('librax-theme', 'light');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="heading-page">Profile & Preferences</h1>
        <p className="text-xs text-ink-muted mt-0.5">Account configuration, appearance themes, and security settings.</p>
      </div>
      
      {/* Profile Card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Account Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Full Name</span>
            <span className="font-semibold text-ink text-sm mt-0.5 block">{user?.full_name || 'Member'}</span>
          </div>
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Primary Email</span>
            <span className="font-semibold text-ink text-sm mt-0.5 block truncate">{user?.email}</span>
          </div>
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Assigned Role</span>
            <span className="font-semibold text-accent text-sm mt-0.5 block">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4 text-info" /> : <Sun className="w-4 h-4 text-warn" />}
            <h2 className="text-sm font-semibold text-ink">Display Theme</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="btn-md btn-secondary rounded-md px-3 h-8 text-xs font-medium inline-flex items-center gap-1.5"
          >
            {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          </button>
        </div>
        <p className="text-xs text-ink-2">
          Currently viewing LibraX in <span className="font-semibold text-ink">{isDark ? 'Dark Mode (default charcoal palette)' : 'Light Mode (warm ivory aesthetic)'}</span>.
        </p>
      </div>

      {/* Security Form */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Security & Credentials</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="label-base">Current Password</label>
            <input
              type="password"
              value={currPassword}
              onChange={e => setCurrPassword(e.target.value)}
              placeholder="••••••••"
              className="input-base text-xs h-8"
              required
            />
          </div>
          <div>
            <label className="label-base">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="input-base text-xs h-8"
              required
            />
          </div>
          <Button size="sm" type="submit">Update Password</Button>
        </form>
      </div>

      {/* System Policy Parameters */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sliders className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-ink">Circulation Policy Rules</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Overdue Fee Rate</span>
            <span className="font-semibold text-crit text-base mt-0.5 block font-mono">$2.00 / day</span>
            <span className="text-3xs text-ink-muted">Assessed post due date</span>
          </div>
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Loan Period</span>
            <span className="font-semibold text-ink text-base mt-0.5 block font-mono">14 Days</span>
            <span className="text-3xs text-ink-muted">Standard borrower duration</span>
          </div>
          <div className="card-2 p-3">
            <span className="text-ink-muted block text-2xs uppercase">Borrowing Quota</span>
            <span className="font-semibold text-accent text-base mt-0.5 block font-mono">3 Books</span>
            <span className="text-3xs text-ink-muted">Concurrent active loan limit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
