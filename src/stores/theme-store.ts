'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorSchemeId } from '@/lib/theme-config';

type ThemeState = {
  colorScheme: ColorSchemeId;
};

type ThemeActions = {
  setColorScheme: (scheme: ColorSchemeId) => void;
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      colorScheme: 'faith-horizon',

      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    {
      name: 'fh-theme-preferences',
      partialize: (state) => ({ colorScheme: state.colorScheme }),
    },
  ),
);
