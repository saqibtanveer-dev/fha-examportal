import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentType } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];

type HeaderActionItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ComponentType<{ className?: string }>;
  variant?: ButtonVariant;
};

type HeaderActionBarProps = {
  primary: HeaderActionItem;
  secondary?: HeaderActionItem;
  overflow?: HeaderActionItem[];
};

function ActionButton({ item }: { item: HeaderActionItem }) {
  const variant = item.variant ?? 'outline';
  const Icon = item.icon;

  if (item.href) {
    return (
      <Button variant={variant} asChild>
        <Link href={item.href}>
          {Icon && <Icon className="h-4 w-4" />}
          {item.label}
        </Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} type="button" onClick={item.onClick}>
      {Icon && <Icon className="h-4 w-4" />}
      {item.label}
    </Button>
  );
}

export function HeaderActionBar({ primary, secondary, overflow = [] }: HeaderActionBarProps) {
  const desktopItems = [primary, ...(secondary ? [secondary] : []), ...overflow];

  return (
    <>
      <div className="flex w-full items-center gap-2 sm:hidden">
        <ActionButton item={primary} />
        {secondary ? <ActionButton item={secondary} /> : null}
        {overflow.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" type="button" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {overflow.map((item) => {
                const Icon = item.icon;
                if (item.href) {
                  return (
                    <DropdownMenuItem key={item.label} asChild>
                      <Link href={item.href}>
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                }

                return (
                  <DropdownMenuItem
                    key={item.label}
                    onSelect={(event) => {
                      event.preventDefault();
                      item.onClick?.();
                    }}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="hidden w-auto shrink-0 flex-wrap items-center gap-2 sm:flex">
        {desktopItems.map((item) => (
          <ActionButton key={item.label} item={item} />
        ))}
      </div>
    </>
  );
}
