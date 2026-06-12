'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/tiwa/supabase';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { upsertSiteSetting } from '@/lib/cms/admin-settings';
import {
  SETTING_KEYS,
  defaultFlashSaleSettings,
  type FlashSaleSettings,
} from '@/lib/cms/settings';

function FlashSalesAdmin() {
  const [form, setForm] = useState<FlashSaleSettings>(defaultFlashSaleSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTING_KEYS.flashSale)
        .maybeSingle();
      if (data?.value) {
        setForm({ ...defaultFlashSaleSettings(), ...(data.value as Partial<FlashSaleSettings>) });
      }
      setLoading(false);
    }
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await upsertSiteSetting(SETTING_KEYS.flashSale, form, 'marketing');
      alert('Flash sale saved. It appears on the shop when active and not expired.');
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
        <h1 className="text-3xl font-bold text-gray-900">Flash Sales</h1>
        <p className="text-gray-600 mt-1">
          Runs a countdown banner on the shop page while the sale is active.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-5 w-5 rounded"
          />
          <span className="font-semibold text-gray-900">Sale is live</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Title</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Subtitle</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Discount label</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.discountLabel}
            onChange={(e) => setForm({ ...form, discountLabel: e.target.value })}
            placeholder="e.g. Up to 20% off"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Ends at (local time)</span>
          <input
            type="datetime-local"
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.endsAt ? form.endsAt.slice(0, 16) : ''}
            onChange={(e) =>
              setForm({
                ...form,
                endsAt: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Button label</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Button link</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.ctaHref}
              onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save flash sale'}
      </button>
    </div>
  );
}

export default function AdminFlashSalesPage() {
  return (
    <ModuleGate moduleId="flash-sales">
      <FlashSalesAdmin />
    </ModuleGate>
  );
}
