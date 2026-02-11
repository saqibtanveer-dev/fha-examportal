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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        navigation={navigation}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <TopNav
        user={user}
        sidebarCollapsed={collapsed}
        notificationCount={notificationCount}
        onSignOut={onSignOut}
      />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          collapsed ? 'pl-16' : 'pl-64',
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
