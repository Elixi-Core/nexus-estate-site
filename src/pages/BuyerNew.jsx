import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nexus } from '../lib/nexus.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

export default function BuyerNew() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', buyer_type: 'cash', proof_of_funds: '',
    budget_min: '', budget_max: '',
    zip_codes: '', cities: '', states: '',
    property_types: 'single-family',
    min_beds: '', min_baths: '', min_sqft: '', max_year_built: '',
    rehab_appetite: 'light', hold_strategy: 'flip',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toList(v) { return v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []; }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null); setResult(null);
    try {
      const payload = {
        buyer: { full_name: form.full_name, email: form.email, phone: form.phone, buyer_type: form.buyer_type, proof_of_funds: form.proof_of_funds },
        criteria: {
          budget_min: num(form.budget_min), budget_max: num(form.budget_max),
          zip_codes: toList(form.zip_codes), cities: toList(form.cities), states: toList(form.states),
          property_types: toList(form.property_types),
          min_beds: num(form.min_beds), min_baths: num(form.min_baths),
          min_sqft: num(form.min_sqft), max_year_built: num(form.max_year_built),
          rehab_appetite: form.rehab_appetite, hold_strategy: form.hold_strategy,
        },
        notes: form.notes,
        source: 'dashboard',
      };
      const res = await nexus.buyerIntake(payload);
      setResult(res);
    } catch (err) {
      setError(err.payload ? JSON.stringify(err.payload) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Add buyer" subtitle="Submits to /webhook/nexus/buyer-intake." />
      <form onSubmit={submit}>
        <Card title="Contact">
          <Grid>
            <Field label="Full name" value={form.full_name} onChange={(v) => set('full_name', v)} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
            <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
            <SelectField label="Buyer type" value={form.buyer_type} onChange={(v) => set('buyer_type', v)} options={['cash', 'hard-money', 'conventional', 'creative']} />
            <Field label="Proof of funds" value={form.proof_of_funds} onChange={(v) => set('proof_of_funds', v)} className="md:col-span-2" />
          </Grid>
        </Card>
        <div className="h-4" />
        <Card title="Criteria">
          <Grid>
            <Field label="Budget min" value={form.budget_min} onChange={(v) => set('budget_min', v)} />
            <Field label="Budget max" value={form.budget_max} onChange={(v) => set('budget_max', v)} />
            <Field label="Zip codes (comma-sep)" value={form.zip_codes} onChange={(v) => set('zip_codes', v)} />
            <Field label="Cities (comma-sep)" value={form.cities} onChange={(v) => set('cities', v)} />
            <Field label="States (comma-sep)" value={form.states} onChange={(v) => set('states', v)} />
            <Field label="Property types (comma-sep)" value={form.property_types} onChange={(v) => set('property_types', v)} />
            <Field label="Min beds" value={form.min_beds} onChange={(v) => set('min_beds', v)} />
            <Field label="Min baths" value={form.min_baths} onChange={(v) => set('min_baths', v)} />
            <Field label="Min sqft" value={form.min_sqft} onChange={(v) => set('min_sqft', v)} />
            <Field label="Max year built" value={form.max_year_built} onChange={(v) => set('max_year_built', v)} />
            <SelectField label="Rehab appetite" value={form.rehab_appetite} onChange={(v) => set('rehab_appetite', v)} options={['none', 'light', 'medium', 'heavy']} />
            <SelectField label="Hold strategy" value={form.hold_strategy} onChange={(v) => set('hold_strategy', v)} options={['flip', 'rental', 'brrrr', 'wholetail']} />
          </Grid>
        </Card>

        {error && <div className="mt-4 text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}
        {result && (
          <div className="mt-4 text-sm bg-accent/10 border border-accent/40 rounded-lg p-3">
            <div className="text-accent font-semibold">Buyer created: {result.buyer_id}</div>
            <button type="button" onClick={() => nav('/app/buyers')} className="mt-2 text-accent hover:underline">View buyers →</button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={submitting} className="bg-accent text-bg font-semibold rounded-lg px-5 py-2 text-sm hover:bg-accent/90 disabled:opacity-50">
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
        {...rest} />
    </label>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
