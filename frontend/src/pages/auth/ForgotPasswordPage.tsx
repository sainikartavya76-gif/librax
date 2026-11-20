import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real system, this would trigger a password reset email.
    // For this demo, we simply show a confirmation.
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-ink">LIBRAX</span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-xl font-semibold text-ink mb-1">Reset password</h1>
            <p className="text-sm text-ink-2 mb-7">
              Enter your email and we'll send instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label-base">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-base h-9"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!email}
                className="w-full h-9 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send reset link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-accent-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-lg font-semibold text-ink mb-2">Check your email</h2>
            <p className="text-sm text-ink-2 mb-6">
              If <span className="text-ink font-medium">{email}</span> exists in our system,
              you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-ink-muted">
              Note: This is a demo. No email was actually sent.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
