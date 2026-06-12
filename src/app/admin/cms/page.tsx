'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/tiwa/supabase';
import { ModuleGate } from '@/components/admin/ModuleGate';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

const STATIC_PAGES = [
  { title: 'About', href: '/about', note: 'Static page — edit in code or create a CMS page with slug "about"' },
  { title: 'Privacy Policy', href: '/policies/privacy' },
  { title: 'Shipping Policy', href: '/policies/shipping' },
  { title: 'Returns Policy', href: '/policies/returns' },
  { title: 'Terms', href: '/policies/terms' },
];

function CmsAdmin() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<CmsPage> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setPages(data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const savePage = async () => {
    if (!editing?.title?.trim() || !editing.slug?.trim()) {
      alert('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title.trim(),
        slug: editing.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        content: editing.content ?? '',
        status: editing.status ?? 'draft',
        seo_title: editing.seo_title ?? null,
        seo_description: editing.seo_description ?? null,
        updated_at: new Date().toISOString(),
      };

      if (editing.id) {
        const { error } = await supabase.from('pages').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pages').insert(payload);
        if (error) throw error;
      }
      setEditing(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) alert(error.message);
    else await load();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CMS / Pages</h1>
          <p className="text-gray-600 mt-1">
            Draft and publish CMS pages here. Storefront display is not wired yet — admin only.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({ title: '', slug: '', content: '', status: 'draft' })
          }
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold"
        >
          <i className="ri-add-line mr-1" />
          New page
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-3">Built-in site pages</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {STATIC_PAGES.map((p) => (
            <li key={p.href}>
              <Link href={p.href} target="_blank" className="text-blue-700 hover:underline">
                {p.title}
              </Link>
              <span className="text-gray-400 ml-2">{p.href}</span>
              {p.note ? <p className="text-xs text-gray-500 mt-0.5">{p.note}</p> : null}
            </li>
          ))}
        </ul>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl border-2 border-blue-200 p-6 space-y-4">
          <h2 className="font-bold text-lg">{editing.id ? 'Edit page' : 'New page'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={editing.title ?? ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Slug</span>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={editing.slug ?? ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="e.g. bridal-packages"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select
              className="mt-1 border rounded-lg px-3 py-2"
              value={editing.status ?? 'draft'}
              onChange={(e) => setEditing({ ...editing, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Content (HTML or plain text)</span>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[200px] font-mono text-sm"
              value={editing.content ?? ''}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={savePage}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save page'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-5 py-2 rounded-lg border font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading pages…</p>
        ) : pages.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No CMS pages yet. Create one to publish custom content.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-gray-600">/p/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        p.status === 'published'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {p.status === 'published' ? (
                      <Link
                        href={`/p/${p.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setEditing(p)}
                      className="text-gray-700 hover:text-blue-700 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePage(p.id)}
                      className="text-red-600 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function AdminCmsPage() {
  return (
    <ModuleGate moduleId="cms">
      <CmsAdmin />
    </ModuleGate>
  );
}
