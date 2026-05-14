import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

const GRADE_COLOR = {
  A: 'text-ok', B: 'text-accent', C: 'text-warn', D: 'text-warn', F: 'text-danger',
};

export default function DealDetail() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('deal_analyses').select('*').eq('id', id).maybeSingle();
      if (!cancel) { setRow(data); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (!row) return <div className="text-sm text-muted">Deal not found. <Link to="/app/deals" className="text-accent hover:underline">Back to deals</Link></div>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={row.address || row.id}
        subtitle={`${row.city ?? ''}${row.state ? `, ${row.state}` : ''}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Grade" value={row.grade ?? '—'} className={GRADE_COLOR[row.grade] ?? 'text-text'} />
        <Stat label="Score" value={row.deal_score ?? '—'} />
        <Stat label="Confidence" value={row.confidence ?? '—'} />
        <Stat label="Comps" value={row.comps_count ?? '—'} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Numbers">
          <Kv label="Asking" value={fmt(row.asking_price)} />
          <Kv label="ARV" value={fmt(row.arv)} />
          <Kv label="Repair cost" value={fmt(row.repair_cost)} />
          <Kv label="MAO" value={fmt(row.mao)} />
        </Card>
        <Card title="Property">
          <Kv label="Sqft" value={row.sqft} />
          <Kv label="Year built" value={row.year_built} />
          <Kv label="Seller" value={row.seller_id ? <Link to={`/app/sellers/${row.seller_id}`} className="text-accent hover:underline">{row.seller_id}</Link> : '—'} />
        </Card>
      </div>
    </div>
  );
}

function fmt(n) { return n == null ? '—' : `$${Number(n).toLocaleString()}`; }
function Stat({ label, value, className = '' }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${className}`}>{value}</div>
    </div>
  );
}
function Kv({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <span className="text-sm text-text text-right truncate">{value ?? '—'}</span>
    </div>
  );
}
