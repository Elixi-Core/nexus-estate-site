import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// Renders open reminders (sorted by due_at ASC) and lets you mark them done.
// Rows are written by the chat agent (server-side, service-role) but can be
// completed from the browser via the UPDATE policy in migration 0010.

function formatDue(iso) {
  if (!iso) return 'no due date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'invalid date';
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 0) return `overdue ${d.toLocaleDateString()}`;
  if (diffH < 24) return `today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  if (diffH < 48) return `tomorrow ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleDateString();
}

export default function RemindersCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from('nexus_reminders')
      .select('id, title, due_at, notes, created_by_chat')
      .is('completed_at', null)
      .order('due_at', { ascending: true, nullsFirst: false })
      .limit(10);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function complete(id) {
    // Optimistic remove
    setRows((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase
      .from('nexus_reminders')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      // Reload to restore on failure
      load();
    }
  }

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted py-4">
        No open reminders. Ask the assistant: <em>"remind me to call seller_abc tomorrow at 3pm"</em>.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((r) => {
        const due = formatDue(r.due_at);
        const overdue = r.due_at && new Date(r.due_at) < new Date();
        return (
          <li key={r.id} className="py-2.5 flex items-start gap-3">
            <button
              onClick={() => complete(r.id)}
              className="mt-0.5 w-4 h-4 shrink-0 rounded border border-muted hover:border-accent hover:bg-accent/20 transition-colors"
              aria-label="Mark complete"
              title="Mark complete"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text truncate">{r.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs ${overdue ? 'text-danger' : 'text-muted'}`}>{due}</span>
                {r.created_by_chat && (
                  <span className="text-xs text-accent/70">· via chat</span>
                )}
              </div>
              {r.notes && (
                <div className="text-xs text-muted/80 mt-1 line-clamp-2">{r.notes}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
