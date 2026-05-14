export default function KPICard({ label, value, hint, accent = false }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="text-xs uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
        {value ?? '—'}
      </div>
      {hint && <div className="mt-1 text-xs text-muted/80">{hint}</div>}
    </div>
  );
}
