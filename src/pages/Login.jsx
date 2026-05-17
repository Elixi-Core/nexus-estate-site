import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

// Single-user passcode login. The owner email is hardcoded; the 6 digits the
// user types ARE the Supabase password. To change the passcode, update the
// password on the elixira86@gmail.com user in Supabase Auth — no code change
// required. (Supabase requires a 6-char minimum password by default.)
const OWNER_EMAIL = 'elixira86@gmail.com';
const CODE_LENGTH = 6;

export default function Login() {
  const { session, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Auto-submit the moment all 6 digits are present.
  useEffect(() => {
    if (submitting) return;
    if (digits.every((d) => d !== '')) {
      attemptSignIn(digits.join(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  if (!loading && session) return <Navigate to="/app" replace />;

  async function attemptSignIn(code) {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(OWNER_EMAIL, code);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message || 'Wrong passcode.');
      setDigits(Array(CODE_LENGTH).fill(''));
      // Defer focus to after the re-render
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  }

  function setDigit(i, raw) {
    const ch = raw.replace(/\D/g, '').slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = ch;
      return next;
    });
    if (ch && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        // clear current
        setDigit(i, '');
      } else if (i > 0) {
        // jump back and clear previous
        inputsRef.current[i - 1]?.focus();
        setDigit(i - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputsRef.current[i - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
      e.preventDefault();
    }
  }

  function onPaste(e) {
    const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill('');
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    const focusIdx = Math.min(text.length, CODE_LENGTH - 1);
    setTimeout(() => inputsRef.current[focusIdx]?.focus(), 0);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 grid place-items-center">
            <span className="text-accent font-bold text-lg">N</span>
          </div>
          <div>
            <div className="font-semibold text-text text-lg">Nexus Estate</div>
            <div className="text-xs text-muted">Enter passcode</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="one-time-code"
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                disabled={submitting}
                aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-semibold bg-surface-2 border border-border rounded-xl text-text caret-accent focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
              />
            ))}
          </div>

          {submitting && (
            <div className="mt-5 text-center text-sm text-muted">Signing in…</div>
          )}
          {error && !submitting && (
            <div className="mt-5 text-center text-sm text-danger">{error}</div>
          )}
        </div>

        <p className="mt-6 text-xs text-muted text-center">
          Private dashboard. Lost access?{' '}
          <a href="mailto:elixira86@gmail.com" className="text-accent hover:underline">Reset</a>
        </p>
      </div>
    </div>
  );
}
