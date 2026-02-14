'use client';

import { Bell, LogOut, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/format';
import { cn } from '@/utils/cn';
import Link from 'next/link';

function getRolePaths(role: string) {
  const base = `/${role.toLowerCase()}`;
  return {
    profile: `${base}/profile`,
    notifications: `${base}/notifications`,
  };
}

function formatRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

type TopNavProps = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  sidebarCollapsed: boolean;
  notificationCount?: number;
  onSignOut: () => void;
  onMobileMenuToggle: () => void;
};

export function TopNav({ user, sidebarCollapsed, notificationCount = 0, onSignOut, onMobileMenuToggle }: TopNavProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 flex h-14 items-center justify-between border-b bg-card px-3 transition-all duration-300 md:h-16 md:px-6',
        // On mobile: full width (left-0). On desktop: offset by sidebar width
        'left-0',
        sidebarCollapsed ? 'md:left-16' : 'md:left-64',
      )}
    >
      {/* Left: Hamburger on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenuToggle}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Desktop spacer */}
      <div className="hidden md:block" />

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications" asChild>
          <Link href={getRolePaths(user.role).notifications}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{formatRoleLabel(user.role)}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={getRolePaths(user.role).profile}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
