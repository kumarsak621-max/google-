"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function HBar({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  const rows = data.slice(0, 10).map((d) => ({
    ...d,
    name: d.name.length > 42 ? d.name.slice(0, 40) + "…" : d.name,
  }));
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No episodes in this dataset.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke="#dadce0" strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a73e8" name="Episodes (count, not prevalence)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">
        Among analyzed conversations in the current dataset. Not a user census.
      </p>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-medium text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
