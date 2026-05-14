import { NavLink } from 'react-router-dom';

export const NAV = [
  { to: '/app', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/app/sellers', label: 'Sellers', icon: IconHome },
  { to: '/app/buyers', label: 'Buyers', icon: IconUsers },
  { to: '/app/deals', label: 'Deals', icon: IconChart },
  { to: '/app/contracts', label: 'Contracts', icon: IconDoc },
  { to: '/app/settings', label: 'Settings', icon: IconCog },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-surface/40 flex-col">
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 grid place-items-center">
          <span className="text-accent font-bold text-sm">N</span>
        </div>
        <span className="font-semibold text-text tracking-tight">Nexus Estate</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                'border-l-2 -ml-px',
                isActive
                  ? 'bg-accent/10 border-accent text-text'
                  : 'border-transparent text-muted hover:text-text hover:bg-surface',
              ].join(' ')
            }
          >
            <n.icon />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-muted/70 border-t border-border">
        v0.1 · {new Date().getFullYear()}
      </div>
    </aside>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" /><path d="M15 20c0-2 2-4 4-4s2 2 2 4" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V8m6 12V4m6 16v-8m6 8v-4" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" />
    </svg>
  );
}
function IconCog() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
