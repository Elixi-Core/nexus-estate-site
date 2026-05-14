export default function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-border bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold tracking-tight text-text">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
