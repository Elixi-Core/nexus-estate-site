import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function RequireAuth({ children }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        <div className="animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile?.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold text-text">Account pending approval</h1>
          <p className="text-muted text-sm">
            Your account ({session.user.email}) isn't approved yet. Once an admin flips
            <code className="mx-1 px-1 rounded bg-surface text-accent">is_approved=true</code>
            in the <code className="px-1 rounded bg-surface">profiles</code> table you'll get access.
          </p>
          <SignOutLink />
        </div>
      </div>
    );
  }

  return children;
}

function SignOutLink() {
  const { signOut } = useAuth();
  return (
    <button
      onClick={signOut}
      className="text-sm text-muted hover:text-accent underline underline-offset-4"
    >
      Sign out
    </button>
  );
}
