import { useState } from 'react';
import { nexus } from '../lib/nexus.js';
import { PublicField, PublicSelect, PublicTextarea, PublicGrid, num } from '../components/PublicForm.jsx';

const BUYER_TYPES = ['cash', 'hard-money', 'conventional', 'creative'];
const REHAB = ['none', 'light', 'medium', 'heavy'];
const STRATEGY = ['flip', 'rental', 'brrrr', 'wholetail'];

export default function FindDeals() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    buyer_type: 'cash', proof_of_funds: '',
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
    setSubmitting(true); setError(null);
    try {
      const res = await nexus.buyerIntake({
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
        source: 'public_find_deals',
      });
      setResult(res);
    } catch (err) {
      setError('We couldn\'t submit — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="px-4 sm:px-6 py-16">
        <div className="max-w-xl mx-auto rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 border border-accent/40 grid place-items-center">
            <span className="text-accent text-2xl">✓</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold">You're on the buyers list.</h1>
          <p className="mt-2 text-muted">
            Reference: <span className="font-mono text-text">{result.buyer_id}</span>
          </p>
          <p className="mt-4 text-sm text-muted">
            You'll get an email the moment a deal hits your criteria. No login required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="text-xs uppercase tracking-wider text-accent">Find deals</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Tell us your buy box.
          </h1>
          <p className="mt-3 text-muted">
            We'll auto-match you to off-market deals — flips, rentals, BRRRR, wholetails.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <Section title="About you">
            <PublicGrid>
              <PublicField label="Full name" value={form.full_name} onChange={(v) => set('full_name', v)} required autoComplete="name" />
              <PublicField label="Phone" value={form.phone} onChange={(v) => set('phone', v)} type="tel" autoComplete="tel" />
              <PublicField label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" autoComplete="email" required className="sm:col-span-2" />
              <PublicSelect label="Funding" value={form.buyer_type} onChange={(v) => set('buyer_type', v)} options={BUYER_TYPES} />
              <PublicField label="Proof of funds note" value={form.proof_of_funds} onChange={(v) => set('proof_of_funds', v)} />
            </PublicGrid>
          </Section>

          <Section title="Budget">
            <PublicGrid>
              <PublicField label="Min ($)" value={form.budget_min} onChange={(v) => set('budget_min', v)} type="number" />
              <PublicField label="Max ($)" value={form.budget_max} onChange={(v) => set('budget_max', v)} type="number" />
            </PublicGrid>
          </Section>

          <Section title="Markets (comma-separated)">
            <PublicGrid>
              <PublicField label="Cities" value={form.cities} onChange={(v) => set('cities', v)} placeholder="Houston, Dallas" />
              <PublicField label="States" value={form.states} onChange={(v) => set('states', v)} placeholder="TX, OK" />
              <PublicField label="Zip codes" value={form.zip_codes} onChange={(v) => set('zip_codes', v)} placeholder="77004, 77005" className="sm:col-span-2" />
              <PublicField label="Property types" value={form.property_types} onChange={(v) => set('property_types', v)} placeholder="single-family, duplex" className="sm:col-span-2" />
            </PublicGrid>
          </Section>

          <Section title="Strategy">
            <PublicGrid>
              <PublicSelect label="Rehab appetite" value={form.rehab_appetite} onChange={(v) => set('rehab_appetite', v)} options={REHAB} />
              <PublicSelect label="Hold strategy" value={form.hold_strategy} onChange={(v) => set('hold_strategy', v)} options={STRATEGY} />
              <PublicField label="Min beds" value={form.min_beds} onChange={(v) => set('min_beds', v)} type="number" />
              <PublicField label="Min baths" value={form.min_baths} onChange={(v) => set('min_baths', v)} type="number" />
              <PublicField label="Min sqft" value={form.min_sqft} onChange={(v) => set('min_sqft', v)} type="number" />
              <PublicField label="Max year built" value={form.max_year_built} onChange={(v) => set('max_year_built', v)} type="number" />
            </PublicGrid>
            <PublicTextarea label="Anything else (optional)" value={form.notes} onChange={(v) => set('notes', v)} />
          </Section>

          {error && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-bg font-semibold rounded-lg py-3.5 text-base hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Get matched to deals'}
          </button>
          <p className="text-xs text-muted text-center">No account required. Unsubscribe any time.</p>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
