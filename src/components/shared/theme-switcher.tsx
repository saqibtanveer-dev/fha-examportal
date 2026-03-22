'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/stores/theme-store';
import { COLOR_SCHEMES, THEME_MODES } from '@/lib/theme-config';
import type { ColorSchemeId, ThemeMode } from '@/lib/theme-config';
import { cn } from '@/utils/cn';

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { colorScheme, setColorScheme } = useThemeStore();

  const currentMode = (theme ?? 'system') as ThemeMode;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Theme settings">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* Mode Selector */}
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-2">
          {THEME_MODES.map((mode) => {
            const Icon = MODE_ICONS[mode.id];
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setTheme(mode.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Color Scheme Selector */}
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Color Scheme
          </div>
        </DropdownMenuLabel>
        <div className="grid gap-1 px-2 pb-2">
          {COLOR_SCHEMES.map((scheme) => {
            const isActive = colorScheme === scheme.id;
            return (
              <button
                key={scheme.id}
                onClick={() => setColorScheme(scheme.id as ColorSchemeId)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {/* Color Preview Dots */}
                <div className="flex shrink-0 gap-0.5">
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: scheme.preview.primary }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: scheme.preview.accent }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{scheme.label}</p>
                  <p className="truncate text-[11px] leading-tight text-muted-foreground">
                    {scheme.description}
                  </p>
                </div>
                {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
