import { Link } from 'react-router-dom';

// Optional `secondary` prop renders an outlined button to the left of the
// primary action. Use it for less-prominent siblings (e.g. "Upload" next to
// the primary "Generate"). Each secondary is { label, to } or { label, onClick }.
export default function PageHeader({ title, subtitle, actionLabel, actionTo, actionOnClick, secondary }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {secondary && (
          secondary.to ? (
            <Link to={secondary.to} className="border border-border text-text rounded-lg px-3 py-2 text-sm hover:border-accent/60">
              {secondary.label}
            </Link>
          ) : (
            <button onClick={secondary.onClick} className="border border-border text-text rounded-lg px-3 py-2 text-sm hover:border-accent/60">
              {secondary.label}
            </button>
          )
        )}
        {actionLabel && (actionTo ? (
          <Link to={actionTo} className="bg-accent text-bg font-semibold rounded-lg px-4 py-2 text-sm hover:bg-accent/90">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={actionOnClick} className="bg-accent text-bg font-semibold rounded-lg px-4 py-2 text-sm hover:bg-accent/90">
            {actionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
