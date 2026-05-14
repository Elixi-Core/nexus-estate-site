import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!loading && session) return <Navigate to="/app" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/40 grid place-items-center">
            <span className="text-accent font-bold">N</span>
          </div>
          <div>
            <div className="font-semibold text-text">Nexus Estate</div>
            <div className="text-xs text-muted">Sign in to your dashboard</div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-border bg-surface p-6 space-y-4"
        >
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-bg font-semibold rounded-lg py-2 hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-muted/70 text-center mt-4">
          Customer signup is coming soon. For now, access is invite-only.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
        {...rest}
      />
    </label>
  );
}
