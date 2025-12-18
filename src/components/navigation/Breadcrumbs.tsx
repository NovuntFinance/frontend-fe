/**
 * Breadcrumb Navigation Component
 * Provides hierarchical navigation context
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Build breadcrumbs from segments
  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    items.push({ label, href });
  });

  return items;
}

/**
 * Get friendly label for common routes
 */
function getFriendlyLabel(segment: string, href: string): string {
  const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    wallets: 'Wallets',
    stakes: 'Stakes',
    team: 'Team',
    pools: 'Pools',
    achievements: 'Achievements',
    notifications: 'Notifications',
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    'trading-signals': 'Trading Signals',
    admin: 'Admin',
    users: 'Users',
    transactions: 'Transactions',
    settings: 'Settings',
    analytics: 'Analytics',
    'daily-profit': 'Daily Profit',
    ros: 'ROS Management',
    kyc: 'KYC',
    overview: 'Overview',
  };

  // Check if it's a dynamic route (e.g., [id])
  if (segment.match(/^\[.*\]$/)) {
    // Try to extract ID from pathname
    const idMatch = href.match(/\/([^/]+)$/);
    return idMatch ? `#${idMatch[1].substring(0, 8)}` : segment;
  }

  return labelMap[segment] || segment;
}

export function Breadcrumbs({ 
  items, 
  className,
  showHome = true 
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumbs if not provided
  const breadcrumbs = items || (() => {
    const generated = generateBreadcrumbs(pathname);
    return generated.map((item) => ({
      ...item,
      label: getFriendlyLabel(item.label.toLowerCase(), item.href),
    }));
  })();

  // Don't show breadcrumbs on root pages
  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {showHome && (
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              itemProp="item"
              aria-label="Home"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
            <meta itemProp="name" content="Home" />
            <meta itemProp="position" content="1" />
          </li>
        )}

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const position = showHome ? index + 2 : index + 1;

          return (
            <li
              key={item.href}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center gap-2"
            >
              <ChevronRight 
                className="h-4 w-4 text-muted-foreground" 
                aria-hidden="true"
              />
              {isLast ? (
                <span
                  className="font-medium text-foreground"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(position)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

