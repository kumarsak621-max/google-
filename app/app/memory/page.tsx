"use client";

import Link from "next/link";
import { HBar } from "@/components/Charts";
import { useStore } from "@/components/Providers";
import { memoryMap } from "@/lib/analytics";

export default function MemoryPage() {
  const { episodes } = useStore();
  const rows = memoryMap(episodes);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Memory map</h1>
      <p className="text-sm text-muted">
        Identify signals humans remember that may not translate into current
        retrieval. Counts are episode co-occurrence, not how often Google Photos
        users remember these things in the wild.
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        <HBar title="Remembered frequently (episode counts)" data={rows.map((r) => ({ name: r.dim, value: r.remembered }))} />
        <HBar title="Forgotten / weakly specified" data={rows.map((r) => ({ name: r.dim, value: r.forgotten }))} />
        <HBar title="Appears currently useful/searchable" data={rows.map((r) => ({ name: r.dim, value: r.searchable }))} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Memory type</th>
              <th className="px-3 py-2">Remembered</th>
              <th className="px-3 py-2">Forgotten / weak</th>
              <th className="px-3 py-2">Searchable-ish</th>
              <th className="px-3 py-2">Gap</th>
              <th className="px-3 py-2">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dim} className="border-t border-line">
                <td className="px-3 py-2 font-medium">{r.dim}</td>
                <td className="px-3 py-2">{r.remembered}</td>
                <td className="px-3 py-2">{r.forgotten}</td>
                <td className="px-3 py-2">{r.searchable}</td>
                <td className="px-3 py-2">{Math.max(0, r.remembered - r.searchable)}</td>
                <td className="px-3 py-2">
                  {r.ids.map((id) => (
                    <Link key={id} href={`/app/evidence/${id}`} className="mr-2">
                      {id}
                    </Link>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">
        Directional evidence suggests visual appearance, episode/context, sequence,
        and social relationships are remembered more often than they are searchable.
        Requires validation through primary research.
      </p>
    </div>
  );
}
