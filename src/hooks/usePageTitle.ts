'use client';

import { useEffect } from 'react';

import { siteConfig } from "@/lib/site";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
      ? `${title} · ${siteConfig.name}`
      : `${siteConfig.name} · ${siteConfig.shortName}`;
  }, [title]);
}
