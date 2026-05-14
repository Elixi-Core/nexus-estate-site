import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nexus } from '../lib/nexus.js';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function DealNew() {
  const nav = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState({
    seller_id: '',
    address: '', city: '', state: '', zip: '',
    beds: '', baths: '', sqft: '', year_built: '',
    asking_price: '', repair_budget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase.from('seller_leads')
        .select('id, full_name, property_address, property_city, property_state, property_zip, beds, baths, sqft, year_built, asking_price')
        .order('created_at', { ascending: false }).limit(50);
      if (!cancel) setSellers(data ?? []);
    })();
    return () => { cancel = true; };
  }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function pickSeller(id) {
    set('seller_id', id);
    const s = sellers.find((x) => x.id === id);
    if (!s) return;
    setForm((f) => ({
      ...f, seller_id: id,
      address: s.property_address ?? '', city: s.property_city ?? '',
      state: s.property_state ?? '', zip: s.property_zip ?? '',
      beds: s.beds ?? '', baths: s.baths ?? '', sqft: s.sqft ?? '',
      year_built: s.year_built ?? '', asking_price: s.asking_price ?? '',
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null); setResult(null);
    try {
      const payload = {
        property: {
          address: form.address, city: form.city, state: form.state, zip: form.zip,
          beds: num(form.beds), baths: num(form.baths), sqft: num(form.sqft), year_built: num(form.year_built),
        },
        asking_price: num(form.asking_price),
        repair_budget: num(form.repair_budget),
        seller_id: form.seller_id || null,
      };
      const res = await nexus.analyzeDeal(payload);
      setResult(res);
    } catch (err) {
      setError(err.payload ? JSON.stringify(err.payload) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Analyze deal" subtitle="Submits to /webhook/nexus/analyze-deal." />
      <form onSubmit={submit}>
        <Card title="Seller (optional)">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted">Pick a seller to autofill</span>
            <select value={form.seller_id} onChange={(e) => pickSeller(e.target.value)}
              className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60">
              <option value="">— Manual entry —</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.id} · {s.property_address ?? ''} {s.property_city ?? ''}
                </option>
              ))}
            </select>
          </label>
        </Card>
        <div className="h-4" />
        <Card title="Property">
          <Grid>
            <Field label="Address" value={form.address} onChange={(v) => set('address', v)} className="md:col-span-2" required />
            <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
            <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
            <Field label="Zip" value={form.zip} onChange={(v) => set('zip', v)} />
            <Field label="Beds" value={form.beds} onChange={(v) => set('beds', v)} />
            <Field label="Baths" value={form.baths} onChange={(v) => set('baths', v)} />
            <Field label="Sqft" value={form.sqft} onChange={(v) => set('sqft', v)} />
            <Field label="Year built" value={form.year_built} onChange={(v) => set('year_built', v)} />
          </Grid>
        </Card>
        <div className="h-4" />
        <Card title="Numbers">
          <Grid>
            <Field label="Asking price" value={form.asking_price} onChange={(v) => set('asking_price', v)} />
            <Field label="Repair budget" value={form.repair_budget} onChange={(v) => set('repair_budget', v)} />
          </Grid>
        </Card>

        {error && <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}
        {result && (
          <div className="mt-4 text-sm bg-accent/10 border border-accent/40 rounded-lg p-3 space-y-1">
            <div className="text-accent font-semibold">Deal analyzed: {result.deal_id} (Grade {result.grade}, score {result.deal_score})</div>
            <div className="text-muted">ARV ${Number(result.arv).toLocaleString()} · Repair ${Number(result.repair_cost).toLocaleString()} · MAO ${Number(result.mao).toLocaleString()} · confidence {result.confidence}</div>
            <button type="button" onClick={() => nav(`/app/deals/${result.deal_id}`)} className="mt-1 text-accent hover:underline">View deal →</button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={submitting} className="bg-accent text-bg font-semibold rounded-lg px-5 py-2 text-sm hover:bg-accent/90 disabled:opacity-50">
            {submitting ? 'Analyzing…' : 'Analyze'}
          </button>
          <button type="button" onClick={() => nav(-1)} className="text-muted hover:text-text text-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function num(v) { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, value, onChange, type = 'text', className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
        {...rest} />
    </label>
  );
}
