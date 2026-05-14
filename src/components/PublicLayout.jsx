import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

const NAV = [
  { to: '/get-listed', label: "I'm selling" },
  { to: '/find-deals', label: "I'm buying" },
];

export default function PublicLayout() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 grid place-items-center">
              <span className="text-accent font-bold text-sm">N</span>
            </div>
            <span className="font-semibold tracking-tight">Nexus Estate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm ${isActive ? 'text-accent' : 'text-muted hover:text-text'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1" />
          {session ? (
            <Link to="/app" className="bg-accent text-bg font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-accent/90">
              Open app →
            </Link>
          ) : (
            <Link to="/login" className="bg-accent text-bg font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-accent/90">
              Sign in
            </Link>
          )}
        </div>
        {/* Mobile sub-nav */}
        <nav className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-4 py-2 text-xs">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg whitespace-nowrap ${isActive ? 'bg-accent/10 text-accent' : 'text-muted'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted">
          <div>© {new Date().getFullYear()} Nexus Estate · All rights reserved.</div>
          <nav className="flex gap-4">
            <Link to="/get-listed" className="hover:text-text">Sell</Link>
            <Link to="/find-deals" className="hover:text-text">Buy</Link>
            <Link to="/login" className="hover:text-text">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
