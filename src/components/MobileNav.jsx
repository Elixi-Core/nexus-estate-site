import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/app', label: 'Home', icon: IconHome, end: true },
  { to: '/app/sellers', label: 'Sellers', icon: IconTag },
  { to: '/app/deals', label: 'Deals', icon: IconChart },
  { to: '/app/contracts', label: 'Docs', icon: IconDoc },
  { to: '/app/settings', label: 'More', icon: IconDots },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-border bg-bg/95 backdrop-blur pb-safe">
      <div className="grid grid-cols-5">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 text-[10px] ${isActive ? 'text-accent' : 'text-muted active:text-text'}`
            }
          >
            <t.icon />
            <span className="mt-0.5">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function IconHome() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>; }
function IconTag()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12 12 20 4 12V4h8z"/><circle cx="9" cy="9" r="1.5"/></svg>; }
function IconChart(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20V8m6 12V4m6 16v-8m6 8v-4"/></svg>; }
function IconDoc()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/></svg>; }
function IconDots() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>; }
