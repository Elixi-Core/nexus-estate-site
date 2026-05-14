// Shared form primitives for public intake. Mobile-first sizing.

export function PublicField({ label, value, onChange, type = 'text', className = '', required, ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-base text-text focus:outline-none focus:border-accent/60"
        {...rest}
      />
    </label>
  );
}

export function PublicSelect({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-base text-text focus:outline-none focus:border-accent/60"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function PublicTextarea({ label, value, onChange, className = '', ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-base text-text focus:outline-none focus:border-accent/60 resize-y"
        {...rest}
      />
    </label>
  );
}

export function PublicGrid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

export function num(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
