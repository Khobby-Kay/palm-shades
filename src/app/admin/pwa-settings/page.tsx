'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/tiwa/supabase';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { upsertSiteSetting } from '@/lib/cms/admin-settings';
import {
  SETTING_KEYS,
  defaultPwaSettings,
  type PwaSettings,
} from '@/lib/cms/settings';

function PwaAdmin() {
  const [form, setForm] = useState<PwaSettings>(defaultPwaSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTING_KEYS.pwa)
        .maybeSingle();
      if (data?.value) {
        setForm({ ...defaultPwaSettings(), ...(data.value as Partial<PwaSettings>) });
      }
      setLoading(false);
    }
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await upsertSiteSetting(SETTING_KEYS.pwa, form, 'mobile');
      alert('PWA settings saved. Install prompt updates on the next page load.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PWA / Mobile App</h1>
        <p className="text-gray-600 mt-1">
          Control the “Add to home screen” prompt and theme colour for installed app chrome.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.showInstallPrompt}
            onChange={(e) => setForm({ ...form, showInstallPrompt: e.target.checked })}
            className="h-5 w-5 rounded"
          />
          <span className="font-semibold text-gray-900">Show install prompt on storefront</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Prompt title</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.promptTitle}
            onChange={(e) => setForm({ ...form, promptTitle: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Prompt message</span>
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2"
            rows={3}
            value={form.promptBody}
            onChange={(e) => setForm({ ...form, promptBody: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Theme colour (hex)</span>
          <div className="mt-1 flex gap-3 items-center">
            <input
              type="color"
              value={form.themeColor}
              onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
              className="h-10 w-14 rounded border cursor-pointer"
            />
            <input
              className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm"
              value={form.themeColor}
              onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
            />
          </div>
        </label>
      </div>

      <p className="text-sm text-gray-500">
        Service worker and offline caching are managed in <code>public/sw.js</code>. This panel controls customer-facing install UX only.
      </p>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save PWA settings'}
      </button>
    </div>
  );
}

export default function AdminPwaPage() {
  return (
    <ModuleGate moduleId="pwa-settings">
      <PwaAdmin />
    </ModuleGate>
  );
}
