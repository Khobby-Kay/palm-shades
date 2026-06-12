'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/tiwa/supabase';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { upsertSiteSetting } from '@/lib/cms/admin-settings';
import {
  SETTING_KEYS,
  defaultHomepageSettings,
  type HomepageSettings,
} from '@/lib/cms/settings';

function HomepageAdmin() {
  const [form, setForm] = useState<HomepageSettings>(defaultHomepageSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', SETTING_KEYS.homepage)
        .maybeSingle();
      if (data?.value) {
        setForm({ ...defaultHomepageSettings(), ...(data.value as Partial<HomepageSettings>) });
      }
      setLoading(false);
    }
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await upsertSiteSetting(SETTING_KEYS.homepage, form, 'homepage');
      setSaved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof HomepageSettings,
    label: string,
    multiline = false
  ) => (
    <label key={key} className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {multiline ? (
        <textarea
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          rows={3}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      ) : (
        <input
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      )}
    </label>
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading homepage settings…</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Homepage Config</h1>
        <p className="text-gray-600 mt-1">
          Save homepage copy here for when you choose to connect it to the live site. Storefront is unchanged.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 border-b pb-2">Hero — slide 1</h2>
        {field('heroEyebrow', 'Eyebrow')}
        <div className="grid md:grid-cols-2 gap-4">
          {field('heroHeading', 'Heading')}
          {field('heroHighlight', 'Highlight (italic)')}
        </div>
        {field('heroSubhead', 'Subheading', true)}
        <div className="grid md:grid-cols-2 gap-4">
          {field('primaryCtaLabel', 'Primary button label')}
          {field('primaryCtaHref', 'Primary button link')}
          {field('secondaryCtaLabel', 'Secondary button label')}
          {field('secondaryCtaHref', 'Secondary button link')}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 border-b pb-2">Trust section</h2>
        {field('trustTitle', 'Section title')}
        {field('trustIntro', 'Intro paragraph', true)}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 border-b pb-2">Shop CTA section</h2>
        {field('shopCtaTitle', 'Title')}
        {field('shopCtaDescription', 'Description', true)}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
        {saved ? (
          <span className="text-sm text-emerald-600 font-medium">Saved — refresh the home page to preview.</span>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminHomepagePage() {
  return (
    <ModuleGate moduleId="homepage">
      <HomepageAdmin />
    </ModuleGate>
  );
}
