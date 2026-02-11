'use client';

import { Bell, LogOut, User } from 'lucide-react';
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

type TopNavProps = {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  sidebarCollapsed: boolean;
  onSignOut: () => void;
};

export function TopNav({ user, sidebarCollapsed, onSignOut }: TopNavProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 flex h-16 items-center justify-between border-b bg-card px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64',
      )}
    >
      {/* Left: Page context (filled by portals or children if needed) */}
      <div />

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            0
          </span>
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
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
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
