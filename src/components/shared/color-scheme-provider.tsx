'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

/**
 * Syncs the Zustand color scheme store → `data-theme` attribute on <html>.
 * Must be rendered inside the component tree (e.g. Providers).
 */
export function ColorSchemeProvider() {
  const colorScheme = useThemeStore((s) => s.colorScheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  return null;
}
