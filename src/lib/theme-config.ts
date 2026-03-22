// ============================================
// Theme & Color Scheme Configuration
// ============================================

export const COLOR_SCHEMES = [
  {
    id: 'default',
    label: 'Slate',
    description: 'Clean neutral theme',
    preview: { primary: '#171717', accent: '#f5f5f5' },
  },
  {
    id: 'faith-horizon',
    label: 'Faith Horizon',
    description: 'Royal Blue & Gold — inspired by school logo',
    preview: { primary: '#1e3a8a', accent: '#d4a017' },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    description: 'Green — growth & education',
    preview: { primary: '#047857', accent: '#d1fae5' },
  },
  {
    id: 'sapphire',
    label: 'Sapphire',
    description: 'Professional blue — trust & clarity',
    preview: { primary: '#2563eb', accent: '#dbeafe' },
  },
  {
    id: 'amethyst',
    label: 'Amethyst',
    description: 'Purple — wisdom & creativity',
    preview: { primary: '#7c3aed', accent: '#ede9fe' },
  },
  {
    id: 'rose',
    label: 'Rose',
    description: 'Modern pink — friendly & warm',
    preview: { primary: '#e11d48', accent: '#ffe4e6' },
  },
  {
    id: 'amber',
    label: 'Amber',
    description: 'Warm amber — energetic & inviting',
    preview: { primary: '#d97706', accent: '#fef3c7' },
  },
] as const;

export type ColorSchemeId = (typeof COLOR_SCHEMES)[number]['id'];

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_MODES: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];
