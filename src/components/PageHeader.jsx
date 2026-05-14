import { Link } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actionLabel, actionTo, actionOnClick }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
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
  );
}
