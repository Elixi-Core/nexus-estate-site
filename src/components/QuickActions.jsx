import { Link } from 'react-router-dom';

const ACTIONS = [
  { to: '/app/sellers/new', label: 'Add Seller', icon: '🏷️' },
  { to: '/app/buyers/new', label: 'Add Buyer', icon: '👥' },
  { to: '/app/deals/new', label: 'Analyze Deal', icon: '📊' },
  { to: '/app/contracts/new', label: 'Generate Contract', icon: '📄' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="rounded-lg border border-border bg-surface-2 p-4 hover:border-accent/50 hover:bg-surface transition-colors group"
        >
          <div className="text-xl">{a.icon}</div>
          <div className="mt-2 text-sm font-medium text-text group-hover:text-accent">{a.label}</div>
        </Link>
      ))}
    </div>
  );
}
