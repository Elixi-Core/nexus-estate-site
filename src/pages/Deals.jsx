import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

const GRADE_COLOR = {
  A: 'bg-ok/15 text-ok border-ok/40',
  B: 'bg-accent/15 text-accent border-accent/40',
  C: 'bg-warn/15 text-warn border-warn/40',
  D: 'bg-warn/15 text-warn border-warn/40',
  F: 'bg-danger/15 text-danger border-danger/40',
};

export default function Deals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('deal_analyses')
        .select('id, address, city, state, asking_price, arv, repair_cost, mao, deal_score, grade, created_at')
        .order('deal_score', { ascending: false });
      if (!cancel) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const columns = [
    { key: 'address', label: 'Address' },
    {
      key: 'city', label: 'Location',
      render: (_, r) => `${r.city ?? '—'}${r.state ? `, ${r.state}` : ''}`,
    },
    { key: 'asking_price', label: 'Asking', render: (v) => v == null ? '—' : `$${Number(v).toLocaleString()}` },
    { key: 'arv', label: 'ARV', render: (v) => v == null ? '—' : `$${Number(v).toLocaleString()}` },
    { key: 'mao', label: 'MAO', render: (v) => v == null ? '—' : `$${Number(v).toLocaleString()}` },
    { key: 'deal_score', label: 'Score' },
    {
      key: 'grade', label: 'Grade',
      render: (v) => (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border font-semibold ${GRADE_COLOR[v] ?? 'text-muted border-border'}`}>
          {v ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Deals" subtitle="Analyzed deals sorted by score." actionLabel="+ Analyze deal" actionTo="/app/deals/new" />
      {loading ? <div className="text-sm text-muted">Loading…</div> : (
        <DataTable rows={rows} columns={columns} onRowClick={(r) => nav(`/app/deals/${r.id}`)} empty="No deals analyzed yet." />
      )}
    </div>
  );
}
