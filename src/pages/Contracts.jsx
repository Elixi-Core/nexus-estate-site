import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Contracts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('contracts')
        .select('id, seller_id, buyer_id, deal_id, assignment_fee, close_date, docx_filename, created_at')
        .order('created_at', { ascending: false });
      if (!cancel) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, []);

  const columns = [
    { key: 'docx_filename', label: 'File' },
    { key: 'seller_id', label: 'Seller' },
    { key: 'buyer_id', label: 'Buyer' },
    { key: 'deal_id', label: 'Deal' },
    {
      key: 'assignment_fee', label: 'Fee',
      render: (v) => v == null ? '—' : `$${Number(v).toLocaleString()}`,
    },
    {
      key: 'close_date', label: 'Close',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Generated + uploaded contracts."
        actionLabel="+ Generate contract"
        actionTo="/app/contracts/new"
        secondary={{ label: 'Upload contract', to: '/app/contracts/upload' }}
      />
      {loading ? <div className="text-sm text-muted">Loading…</div> : (
        <DataTable rows={rows} columns={columns} empty="No contracts yet." />
      )}
    </div>
  );
}
