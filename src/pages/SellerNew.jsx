import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nexus } from '../lib/nexus.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function SellerNew() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    beds: '', baths: '', sqft: '', year_built: '', asking_price: '',
    reason_for_selling: '', timeline: '', condition: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null); setResult(null);
    try {
      const payload = {
        seller: { full_name: form.full_name, email: form.email, phone: form.phone },
        property: {
          address: form.address, city: form.city, state: form.state, zip: form.zip,
          beds: num(form.beds), baths: num(form.baths), sqft: num(form.sqft),
          year_built: num(form.year_built), asking_price: num(form.asking_price),
        },
        reason_for_selling: form.reason_for_selling,
        timeline: form.timeline,
        condition: form.condition,
        source: 'dashboard',
      };
      const res = await nexus.sellerIntake(payload);
      setResult(res);
    } catch (err) {
      setError(err.payload ? JSON.stringify(err.payload) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Add seller" subtitle="Submits to /webhook/nexus/seller-intake." />
      <form onSubmit={submit}>
        <Card title="Contact">
          <Grid>
            <Field label="Full name" value={form.full_name} onChange={(v) => set('full_name', v)} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
          </Grid>
        </Card>
        <div className="h-4" />
        <Card title="Property">
          <Grid>
            <Field label="Address" value={form.address} onChange={(v) => set('address', v)} className="md:col-span-2" />
            <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
            <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
            <Field label="Zip" value={form.zip} onChange={(v) => set('zip', v)} />
            <Field label="Beds" value={form.beds} onChange={(v) => set('beds', v)} />
            <Field label="Baths" value={form.baths} onChange={(v) => set('baths', v)} />
            <Field label="Sqft" value={form.sqft} onChange={(v) => set('sqft', v)} />
            <Field label="Year built" value={form.year_built} onChange={(v) => set('year_built', v)} />
            <Field label="Asking price" value={form.asking_price} onChange={(v) => set('asking_price', v)} />
          </Grid>
        </Card>
        <div className="h-4" />
        <Card title="Context">
          <Grid>
            <Field label="Reason for selling" value={form.reason_for_selling} onChange={(v) => set('reason_for_selling', v)} className="md:col-span-2" />
            <Field label="Timeline" value={form.timeline} onChange={(v) => set('timeline', v)} />
            <Field label="Condition" value={form.condition} onChange={(v) => set('condition', v)} />
          </Grid>
        </Card>

        {error && <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}
        {result && (
          <div className="mt-4 text-sm bg-accent/10 border border-accent/40 rounded-lg p-3 space-y-1">
            <div className="text-accent font-semibold">Lead created: {result.lead_id}</div>
            <div className="text-muted">classification: {result.classification} · motivation: {result.motivation_score}</div>
            <div className="pt-2">
              <button type="button" onClick={() => nav(`/app/sellers/${result.lead_id}`)} className="text-accent hover:underline">View lead →</button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-bg font-semibold rounded-lg px-5 py-2 text-sm hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
        {...rest}
      />
    </label>
  );
}
