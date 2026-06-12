'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/tiwa/supabase';
import { STORE_MODULES_CHANGED } from '@/lib/store-modules';

export function ModuleGate({
  moduleId,
  children,
}: {
  moduleId: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<'loading' | 'enabled' | 'disabled'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const { data, error } = await supabase
          .from('store_modules')
          .select('enabled')
          .eq('id', moduleId)
          .maybeSingle();

        if (cancelled) return;
        if (error || !data?.enabled) {
          setState('disabled');
        } else {
          setState('enabled');
        }
      } catch {
        if (!cancelled) setState('disabled');
      }
    }

    void check();
    const onChange = () => void check();
    window.addEventListener(STORE_MODULES_CHANGED, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(STORE_MODULES_CHANGED, onChange);
    };
  }, [moduleId]);

  if (state === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (state === 'disabled') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-lock-line text-2xl text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Module not enabled</h2>
        <p className="text-gray-600 mb-6">
          Turn on this feature in <strong>Modules</strong> (Restricted Access) to use this page.
        </p>
        <Link
          href="/admin/modules"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700"
        >
          <i className="ri-puzzle-line" />
          Open Modules
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
