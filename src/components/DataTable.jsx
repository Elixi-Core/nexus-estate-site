import { useMemo, useState } from 'react';

export default function DataTable({ rows, columns, onRowClick, empty = 'No rows yet.' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  if (!rows?.length) {
    return <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted text-sm">{empty}</div>;
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => c.sortable !== false && toggleSort(c.key)}
                  className={`px-4 py-3 font-medium ${c.sortable !== false ? 'cursor-pointer hover:text-text' : ''}`}
                >
                  {c.label}
                  {sortKey === c.key && (
                    <span className="ml-1 text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border/50 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-2' : ''}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-text">
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
