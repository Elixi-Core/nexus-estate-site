function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const TYPE_ACCENT = {
  seller_lead_created: 'text-ok',
  buyer_profile_created: 'text-ok',
  deal_analyzed: 'text-accent',
  outreach_drafted: 'text-warn',
  contract_generated: 'text-accent',
};

export default function ActivityFeed({ events }) {
  if (!events?.length) {
    return <div className="text-sm text-muted">No recent activity.</div>;
  }
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="flex items-start gap-3 text-sm">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-current ${TYPE_ACCENT[e.event_type] ?? 'text-muted'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-text truncate">
              <span className="font-medium">{e.event_type?.replace(/_/g, ' ') ?? 'event'}</span>
              {e.entity_id && <span className="text-muted"> · {e.entity_id}</span>}
            </div>
            <div className="text-xs text-muted">{timeAgo(e.created_at)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
