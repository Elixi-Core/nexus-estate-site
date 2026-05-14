import { useAuth } from '../lib/auth.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Account + environment." />
      <Card title="Account">
        <Kv label="Email" value={user?.email} />
        <Kv label="User ID" value={user?.id} />
        <Kv label="Approved" value={profile?.is_approved ? 'yes' : 'no'} />
        <Kv label="Created" value={profile?.created_at ? new Date(profile.created_at).toLocaleString() : '—'} />
        <div className="mt-4">
          <button onClick={signOut} className="text-sm text-danger hover:underline">Sign out</button>
        </div>
      </Card>
      <div className="h-4" />
      <Card title="Environment">
        <Kv label="Supabase URL" value={import.meta.env.VITE_SUPABASE_URL} />
        <Kv label="n8n base" value={import.meta.env.VITE_N8N_BASE} />
        <p className="text-xs text-muted mt-3">
          Edit <code className="px-1 rounded bg-surface-2">.env.local</code> to change these, then restart <code className="px-1 rounded bg-surface-2">npm run dev</code>.
        </p>
      </Card>
    </div>
  );
}

function Kv({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <span className="text-sm text-text text-right truncate font-mono">{value ?? '—'}</span>
    </div>
  );
}
