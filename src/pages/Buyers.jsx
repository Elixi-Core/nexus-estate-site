import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Buyers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('buyer_profiles')
        .select('id, full_name, email, buyer_type, budget_min, budget_max, preferred_cities, created_at')
        .order('created_at', { ascending: false });
      if (!cancel) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const columns = [
    { key: 'full_name', label: 'Buyer' },
    { key: 'buyer_type', label: 'Type' },
    {
      key: 'budget_max', label: 'Budget',
      render: (_, r) => {
        const min = r.budget_min ? `$${Number(r.budget_min).toLocaleString()}` : '—';
        const max = r.budget_max ? `$${Number(r.budget_max).toLocaleString()}` : '—';
        return `${min} – ${max}`;
      },
    },
    {
      key: 'preferred_cities', label: 'Markets',
      sortable: false,
      render: (v) => {
        if (!v) return '—';
        const arr = Array.isArray(v) ? v : [];
        return arr.length ? arr.slice(0, 3).join(', ') + (arr.length > 3 ? ` +${arr.length - 3}` : '') : '—';
      },
    },
    { key: 'email', label: 'Email' },
  ];

  return (
    <div>
      <PageHeader title="Buyers" subtitle="Cash + rehab buyer profiles." actionLabel="+ Add buyer" actionTo="/app/buyers/new" />
      {loading ? <div className="text-sm text-muted">Loading…</div> : (
        <DataTable rows={rows} columns={columns} empty="No buyers yet." />
      )}
    </div>
  );
}
