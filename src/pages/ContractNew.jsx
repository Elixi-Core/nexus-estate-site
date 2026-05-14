import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nexus } from '../lib/nexus.js';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function ContractNew() {
  const nav = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [form, setForm] = useState({
    seller_id: '', buyer_id: '', deal_id: '',
    assignment_fee: '5000',
    close_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10),
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const [s, b, d] = await Promise.all([
        supabase.from('seller_leads').select('id, full_name, property_address').order('created_at', { ascending: false }).limit(50),
        supabase.from('buyer_profiles').select('id, full_name').order('created_at', { ascending: false }).limit(50),
        supabase.from('deal_analyses').select('id, address, deal_score, grade').order('created_at', { ascending: false }).limit(50),
      ]);
      if (!cancel) {
        setSellers(s.data ?? []);
        setBuyers(b.data ?? []);
        setDeals(d.data ?? []);
      }
    })();
    return () => { cancel = true; };
  }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null); setResult(null);
    try {
      const res = await nexus.contract({
        seller_id: form.seller_id,
        buyer_id: form.buyer_id,
        deal_id: form.deal_id,
        assignment_fee: Number(form.assignment_fee) || 0,
        close_date: form.close_date,
      });
      setResult(res);
    } catch (err) {
      setError(err.payload ? JSON.stringify(err.payload) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function downloadDocx() {
    if (!result?.docx_base64) return;
    const bytes = Uint8Array.from(atob(result.docx_base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.docx_filename || `nexus-contract-${result.contract_id}.docx`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Generate contract" subtitle="Submits to /webhook/nexus/contract. Returns a docx." />
      <form onSubmit={submit}>
        <Card title="Match">
          <div className="space-y-3">
            <Select label="Seller" value={form.seller_id} onChange={(v) => set('seller_id', v)} required
              options={sellers.map((s) => ({ value: s.id, label: `${s.full_name || s.id} · ${s.property_address ?? ''}` }))} />
            <Select label="Buyer" value={form.buyer_id} onChange={(v) => set('buyer_id', v)} required
              options={buyers.map((b) => ({ value: b.id, label: b.full_name || b.id }))} />
            <Select label="Deal" value={form.deal_id} onChange={(v) => set('deal_id', v)} required
              options={deals.map((d) => ({ value: d.id, label: `${d.address ?? d.id} · ${d.grade ?? '?'} ${d.deal_score ?? ''}` }))} />
          </div>
        </Card>
        <div className="h-4" />
        <Card title="Terms">
          <Grid>
            <Field label="Assignment fee ($)" value={form.assignment_fee} onChange={(v) => set('assignment_fee', v)} />
            <Field label="Close date" type="date" value={form.close_date} onChange={(v) => set('close_date', v)} />
          </Grid>
        </Card>

        {error && <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}
        {result && (
          <div className="mt-4 text-sm bg-accent/10 border border-accent/40 rounded-lg p-3 space-y-2">
            <div className="text-accent font-semibold">Contract generated: {result.contract_id}</div>
            <div className="text-muted">{result.docx_filename} · {Math.round((result.docx_size_bytes ?? 0) / 1024)} KB</div>
            <button type="button" onClick={downloadDocx} className="bg-accent text-bg font-semibold rounded-lg px-3 py-1.5 text-xs hover:bg-accent/90">
              Download docx
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={submitting} className="bg-accent text-bg font-semibold rounded-lg px-5 py-2 text-sm hover:bg-accent/90 disabled:opacity-50">
            {submitting ? 'Generating…' : 'Generate'}
          </button>
          <button type="button" onClick={() => nav(-1)} className="text-muted hover:text-text text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
        {...rest} />
    </label>
  );
}
function Select({ label, value, onChange, options, required }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60">
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
