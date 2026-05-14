import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

const CLASS_BADGE = {
  hot: 'bg-danger/15 text-danger border-danger/40',
  warm: 'bg-warn/15 text-warn border-warn/40',
  cold: 'bg-muted/15 text-muted border-muted/40',
};

export default function Sellers() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      let q = supabase.from('seller_leads')
        .select('id, full_name, property_city, property_state, motivation_score, classification, asking_price, created_at')
        .order('created_at', { ascending: false });
      if (filter !== 'all') q = q.eq('classification', filter);
      const { data } = await q;
      if (!cancel) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [filter]);

  const columns = [
    { key: 'full_name', label: 'Seller' },
    {
      key: 'property_city', label: 'Location',
      render: (_, r) => `${r.property_city ?? '—'}${r.property_state ? `, ${r.property_state}` : ''}`,
    },
    {
      key: 'asking_price', label: 'Asking',
      render: (v) => v == null ? '—' : `$${Number(v).toLocaleString()}`,
    },
    {
      key: 'motivation_score', label: 'Motivation',
      render: (v) => v ?? '—',
    },
    {
      key: 'classification', label: 'Class',
      render: (v) => (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${CLASS_BADGE[v] ?? 'text-muted border-border'}`}>
          {v ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sellers"
        subtitle="Seller leads from the intake webhook."
        actionLabel="+ Add seller"
        actionTo="/app/sellers/new"
      />
      <div className="mb-4 flex gap-2 text-sm">
        {['all', 'hot', 'warm', 'cold'].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1 rounded-lg border ${filter === k ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:text-text'}`}
          >
            {k}
          </button>
        ))}
      </div>
      {loading ? <div className="text-sm text-muted">Loading…</div> : (
        <DataTable
          rows={rows}
          columns={columns}
          onRowClick={(r) => nav(`/app/sellers/${r.id}`)}
          empty="No sellers yet. Submit your first lead from /app/sellers/new."
        />
      )}
    </div>
  );
}
