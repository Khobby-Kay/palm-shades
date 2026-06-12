"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type LogRow = {
  id: string;
  message: string;
  reply: string | null;
  intent: string | null;
  matchedProductSlugs: string | null;
  pagePath: string | null;
  sessionId: string | null;
  addToCartOffered: boolean;
  createdAt: string;
};

type InsightsPayload = {
  logs: LogRow[];
  stats: {
    total: number;
    last7Days: number;
    addToCartOffers: number;
    topIntents: { intent: string; count: number }[];
  };
  topQueries: { message: string; count: number }[];
};

export default function AssistantInsightsPage() {
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/assistant-insights");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load insights");
      }
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Assistant insights</h1>
          <p className="text-sm text-gray-600">
            What customers ask the storefront shopping assistant — logged to your database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : data ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total chats logged" value={String(data.stats.total)} />
            <StatCard label="Last 7 days" value={String(data.stats.last7Days)} />
            <StatCard
              label="Add-to-cart offers"
              value={String(data.stats.addToCartOffers)}
            />
            <StatCard
              label="Top intent"
              value={data.stats.topIntents[0]?.intent ?? "—"}
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Popular questions</h2>
              <ul className="mt-4 space-y-2">
                {data.topQueries.length === 0 ? (
                  <li className="text-sm text-gray-500">No queries yet.</li>
                ) : (
                  data.topQueries.map((q) => (
                    <li
                      key={q.message}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="text-gray-800">{q.message}</span>
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {q.count}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-900">Intents</h2>
              <ul className="mt-4 space-y-2">
                {data.stats.topIntents.map((i) => (
                  <li
                    key={i.intent}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span className="capitalize">{i.intent.replace(/_/g, " ")}</span>
                    <span className="font-semibold">{i.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Recent conversations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Customer asked</th>
                    <th className="px-4 py-3">Intent</th>
                    <th className="px-4 py-3">Page</th>
                    <th className="px-4 py-3">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="align-top hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-gray-900">
                        {log.message}
                        {log.addToCartOffered ? (
                          <span className="ml-2 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                            cart
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {log.intent?.replace(/_/g, " ") ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{log.pagePath ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {log.matchedProductSlugs ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
