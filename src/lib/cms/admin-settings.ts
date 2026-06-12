import { supabase } from '@/lib/tiwa/supabase';

/** Upsert a JSON document into Supabase `site_settings` from the admin UI. */
export async function upsertSiteSetting(key: string, value: object, category: string) {
  const { error } = await supabase.from('site_settings').upsert(
    {
      key,
      value,
      category,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
  if (error) throw error;
}
