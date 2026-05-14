import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Topbar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initial = (user?.email || '?').slice(0, 1).toUpperCase();

  return (
    <header className="h-14 border-b border-border bg-bg/80 backdrop-blur flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20 pt-safe">
      {/* Mobile-only logo (sidebar hidden) */}
      <Link to="/app" className="md:hidden flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 grid place-items-center">
          <span className="text-accent font-bold text-sm">N</span>
        </div>
      </Link>

      <div className="flex-1 max-w-md relative">
        <input
          type="search"
          placeholder="Search…"
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60"
        />
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <button
        className="hidden sm:inline-flex relative p-2 rounded-lg text-muted hover:text-text hover:bg-surface"
        title="Notifications (v2)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16z" /><path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      </button>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-full bg-surface border border-border grid place-items-center text-sm font-semibold text-accent hover:border-accent/40"
        >
          {initial}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface shadow-xl py-1 text-sm">
            <div className="px-3 py-2 text-muted truncate">{user?.email}</div>
            <div className="border-t border-border my-1" />
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2 text-text hover:bg-surface-2"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
