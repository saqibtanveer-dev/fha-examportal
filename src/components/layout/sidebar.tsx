'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { APP_NAME } from '@/lib/constants';
import type { NavGroup } from './nav-config';

type SidebarProps = {
  navigation: NavGroup[];
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggle: () => void;
};

function SidebarNav({
  navigation,
  collapsed,
  pathname,
  onLinkClick,
}: {
  navigation: NavGroup[];
  collapsed: boolean;
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
      {navigation.map((group, i) => (
        <div key={group.title} className={cn(i > 0 && 'mt-4')}>
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {group.title}
            </p>
          )}
          {collapsed && i > 0 && <Separator className="mb-2" />}
          <nav className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href + '/'));

              const linkContent = (
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>
        </div>
      ))}
    </>
  );
}

export function Sidebar({ navigation, collapsed, mobileOpen, onMobileClose, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-card transition-all duration-300 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <SidebarNav navigation={navigation} collapsed={collapsed} pathname={pathname} />
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* ── Mobile Sidebar (Sheet Drawer) ───────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose()}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">{APP_NAME}</span>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 px-2 py-4">
            <SidebarNav
              navigation={navigation}
              collapsed={false}
              pathname={pathname}
              onLinkClick={onMobileClose}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
