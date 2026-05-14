import { useState } from 'react';
import { nexus } from '../lib/nexus.js';
import { PublicField, PublicSelect, PublicTextarea, PublicGrid, num } from '../components/PublicForm.jsx';

const TIMELINES = ['ASAP', '1–3 months', '3–6 months', '6+ months', 'Just exploring'];
const CONDITIONS = ['Move-in ready', 'Light cosmetic', 'Needs work', 'Heavy rehab', 'Tear-down'];

export default function GetListed() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    beds: '', baths: '', sqft: '', year_built: '', asking_price: '',
    reason_for_selling: '', timeline: 'ASAP', condition: 'Move-in ready',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    try {
      const res = await nexus.sellerIntake({
        seller: { full_name: form.full_name, email: form.email, phone: form.phone },
        property: {
          address: form.address, city: form.city, state: form.state, zip: form.zip,
          beds: num(form.beds), baths: num(form.baths), sqft: num(form.sqft),
          year_built: num(form.year_built), asking_price: num(form.asking_price),
        },
        reason_for_selling: form.reason_for_selling,
        timeline: form.timeline,
        condition: form.condition,
        source: 'public_get_listed',
      });
      setResult(res);
    } catch (err) {
      setError('We couldn\'t submit your info — please try again or call us directly.');
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
          <h1 className="mt-4 text-2xl font-semibold">We got your property.</h1>
          <p className="mt-2 text-muted">
            Reference: <span className="font-mono text-text">{result.lead_id}</span>
          </p>
          <p className="mt-4 text-sm text-muted">
            A buyer-side specialist will reach out within 24 hours
            {result.classification === 'hot' ? ' — this property scored as a high-priority lead.' : '.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="text-xs uppercase tracking-wider text-accent">Sell your house</div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Tell us about your property.
          </h1>
          <p className="mt-3 text-muted">
            No fees. No commissions. We score every property within minutes and reach out if it fits.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <Section title="About you">
            <PublicGrid>
              <PublicField label="Full name" value={form.full_name} onChange={(v) => set('full_name', v)} required autoComplete="name" />
              <PublicField label="Phone" value={form.phone} onChange={(v) => set('phone', v)} type="tel" autoComplete="tel" required />
              <PublicField label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" autoComplete="email" required className="sm:col-span-2" />
            </PublicGrid>
          </Section>

          <Section title="The property">
            <PublicGrid>
              <PublicField label="Address" value={form.address} onChange={(v) => set('address', v)} required className="sm:col-span-2" autoComplete="street-address" />
              <PublicField label="City" value={form.city} onChange={(v) => set('city', v)} required />
              <PublicField label="State" value={form.state} onChange={(v) => set('state', v)} required />
              <PublicField label="Zip" value={form.zip} onChange={(v) => set('zip', v)} required />
              <PublicField label="Beds" value={form.beds} onChange={(v) => set('beds', v)} type="number" />
              <PublicField label="Baths" value={form.baths} onChange={(v) => set('baths', v)} type="number" />
              <PublicField label="Sqft" value={form.sqft} onChange={(v) => set('sqft', v)} type="number" />
              <PublicField label="Year built" value={form.year_built} onChange={(v) => set('year_built', v)} type="number" />
              <PublicField label="Asking price (optional)" value={form.asking_price} onChange={(v) => set('asking_price', v)} type="number" className="sm:col-span-2" />
            </PublicGrid>
          </Section>

          <Section title="Your situation">
            <PublicGrid>
              <PublicSelect label="Timeline" value={form.timeline} onChange={(v) => set('timeline', v)} options={TIMELINES} />
              <PublicSelect label="Condition" value={form.condition} onChange={(v) => set('condition', v)} options={CONDITIONS} />
            </PublicGrid>
            <PublicTextarea
              label="Why are you selling? (helps us tailor an offer)"
              value={form.reason_for_selling}
              onChange={(v) => set('reason_for_selling', v)}
            />
          </Section>

          {error && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent text-bg font-semibold rounded-lg py-3.5 text-base hover:bg-accent/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Get my offer'}
          </button>
          <p className="text-xs text-muted text-center">
            By submitting you agree to be contacted about your property. No account required.
          </p>
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
