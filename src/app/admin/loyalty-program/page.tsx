'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/tiwa/supabase';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { upsertSiteSetting } from '@/lib/cms/admin-settings';
import {
  SETTING_KEYS,
  defaultLoyaltySettings,
  type LoyaltySettings,
} from '@/lib/cms/settings';

function LoyaltyAdmin() {
  const [form, setForm] = useState<LoyaltySettings>(defaultLoyaltySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTING_KEYS.loyalty)
        .maybeSingle();
      if (data?.value) {
        setForm({ ...defaultLoyaltySettings(), ...(data.value as Partial<LoyaltySettings>) });
      }
      setLoading(false);
    }
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await upsertSiteSetting(SETTING_KEYS.loyalty, form, 'marketing');
      alert('Loyalty settings saved. Customers see rewards on their account when active.');
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
        <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
        <p className="text-gray-600 mt-1">
          Show a rewards card on customer accounts. Points accrual from orders can be expanded later.
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
          <span className="font-semibold text-gray-900">Program visible to customers</span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Program name</span>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.programName}
            onChange={(e) => setForm({ ...form, programName: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Description</span>
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Points per GHS spent</span>
            <input
              type="number"
              min={0}
              step={0.5}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.pointsPerCedi}
              onChange={(e) =>
                setForm({ ...form, pointsPerCedi: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Welcome bonus points</span>
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.welcomeBonus}
              onChange={(e) =>
                setForm({ ...form, welcomeBonus: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save loyalty program'}
      </button>
    </div>
  );
}

export default function AdminLoyaltyPage() {
  return (
    <ModuleGate moduleId="loyalty-program">
      <LoyaltyAdmin />
    </ModuleGate>
  );
}
