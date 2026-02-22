'use client';

import { create } from 'zustand';

/**
 * UI state store — filter persistence, sidebar state.
 * Persists filters so users don't lose them when navigating between tabs.
 */

type PageFilters = Record<string, string>;

type UIState = {
  sidebarCollapsed: boolean;
  filters: Record<string, PageFilters>;
};

type UIActions = {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  getFilters: (path: string) => PageFilters;
  setFilter: (path: string, key: string, value: string) => void;
  clearFilters: (path: string) => void;
};

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  sidebarCollapsed: false,
  filters: {},

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  getFilters: (path) => get().filters[path] ?? {},

  setFilter: (path, key, value) =>
    set((s) => ({
      filters: {
        ...s.filters,
        [path]: {
          ...s.filters[path],
          [key]: value,
        },
      },
    })),

  clearFilters: (path) =>
    set((s) => {
      const next = { ...s.filters };
      delete next[path];
      return { filters: next };
    }),
}));
