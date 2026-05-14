import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { nexus } from '../lib/nexus.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function SellerDetail() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outreach, setOutreach] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('seller_leads').select('*').eq('id', id).maybeSingle();
      if (!cancel) { setRow(data); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [id]);

  async function draftOutreach() {
    setDrafting(true); setError(null);
    try {
      const res = await nexus.outreach(id);
      setOutreach(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setDrafting(false);
    }
  }

  if (loading) return <div className="text-sm text-muted">Loading…</div>;
  if (!row) return <div className="text-sm text-muted">Seller not found. <Link to="/app/sellers" className="text-accent hover:underline">Back to list</Link></div>;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={row.full_name || row.id}
        subtitle={`${row.property_address ?? ''}${row.property_city ? `, ${row.property_city}` : ''} · ${row.classification ?? 'unclassified'}`}
        actionLabel={drafting ? 'Drafting…' : 'Draft outreach'}
        actionOnClick={draftOutreach}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Lead">
          <Kv label="ID" value={row.id} />
          <Kv label="Email" value={row.email} />
          <Kv label="Phone" value={row.phone} />
          <Kv label="Motivation score" value={row.motivation_score} />
          <Kv label="Condition grade" value={row.condition_grade} />
          <Kv label="Classification" value={row.classification} />
        </Card>
        <Card title="Property">
          <Kv label="Address" value={row.property_address} />
          <Kv label="City / State" value={`${row.property_city ?? ''} ${row.property_state ?? ''}`} />
          <Kv label="Zip" value={row.property_zip} />
          <Kv label="Beds / Baths" value={`${row.beds ?? '—'} / ${row.baths ?? '—'}`} />
          <Kv label="Sqft" value={row.sqft} />
          <Kv label="Year built" value={row.year_built} />
          <Kv label="Asking price" value={row.asking_price ? `$${Number(row.asking_price).toLocaleString()}` : null} />
        </Card>
      </div>

      {error && <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}

      {outreach && (
        <div className="mt-4">
          <Card title="Drafted outreach">
            <div className="text-xs text-muted mb-1">To: {outreach.recipient}</div>
            <div className="font-semibold text-text">{outreach.subject}</div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-text bg-surface-2 border border-border rounded-lg p-3">{outreach.body_text}</pre>
            {outreach.note && <div className="mt-2 text-xs text-muted">{outreach.note}</div>}
          </Card>
        </div>
      )}
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
