'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';
import { cn } from '@/utils/cn';
import type { NavGroup } from './nav-config';

type DashboardShellProps = {
  navigation: NavGroup[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  notificationCount?: number;
  onSignOut: () => void;
  children: React.ReactNode;
};

export function DashboardShell({
  navigation,
  user,
  notificationCount,
  onSignOut,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        navigation={navigation}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <TopNav
        user={user}
        sidebarCollapsed={collapsed}
        notificationCount={notificationCount}
        onSignOut={onSignOut}
        onMobileMenuToggle={() => setMobileOpen(true)}
      />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          // No left padding on mobile; sidebar is a drawer
          collapsed ? 'md:pl-16' : 'md:pl-64',
        )}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
