/**
 * Command Palette / Global Search
 * Cmd+K (Mac) or Ctrl+K (Windows) to open
 * Quick navigation and search across the platform
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  Wallet,
  TrendingUp,
  Users,
  Award,
  Settings,
  Home,
  ArrowRight,
  FileText,
  Bell,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: 'navigation' | 'actions' | 'recent';
  keywords?: string[];
}

const defaultCommands: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Go to main dashboard',
    icon: Home,
    href: '/dashboard',
    category: 'navigation',
    keywords: ['home', 'main', 'overview'],
  },
  {
    id: 'wallets',
    label: 'Wallets',
    description: 'View and manage wallets',
    icon: Wallet,
    href: '/dashboard/wallets',
    category: 'navigation',
    keywords: ['wallet', 'balance', 'funds', 'deposit', 'withdraw'],
  },
  {
    id: 'stakes',
    label: 'Stakes',
    description: 'View and create stakes',
    icon: TrendingUp,
    href: '/dashboard/stakes',
    category: 'navigation',
    keywords: ['stake', 'staking', 'earn', 'returns'],
  },
  {
    id: 'team',
    label: 'Team',
    description: 'View referral team',
    icon: Users,
    href: '/dashboard/team',
    category: 'navigation',
    keywords: ['team', 'referral', 'referrals', 'network'],
  },
  {
    id: 'achievements',
    label: 'Achievements',
    description: 'View achievements and badges',
    icon: Award,
    href: '/dashboard/achievements',
    category: 'navigation',
    keywords: ['achievement', 'badge', 'badges', 'rewards'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'View all notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    category: 'navigation',
    keywords: ['notification', 'alerts', 'messages'],
  },
  {
    id: 'create-stake',
    label: 'Create New Stake',
    description: 'Start a new staking goal',
    icon: TrendingUp,
    href: '/dashboard/stakes/new',
    category: 'actions',
    keywords: ['create', 'new', 'start', 'begin'],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  // Filter commands based on search query
  const filteredCommands = defaultCommands.filter((cmd) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.keywords?.some((kw) => kw.toLowerCase().includes(query))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      // Escape to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }

      // Arrow keys navigation
      if (open) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        }
        if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredCommands, selectedIndex]);

  const handleSelect = useCallback(
    (command: CommandItem) => {
      router.push(command.href);
      setOpen(false);
      setSearchQuery('');
      setSelectedIndex(0);
    },
    [router]
  );

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Quick Navigation</DialogTitle>
          <DialogDescription>
            Search and navigate quickly. Press{' '}
            <kbd className="rounded border bg-muted px-2 py-1 text-xs font-mono">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
            </kbd>{' '}
            to open anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, pages, or actions..."
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <div className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                  {category}
                </div>
                <div className="space-y-1">
                  {commands.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const Icon = cmd.icon;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium">{cmd.label}</div>
                          {cmd.description && (
                            <div
                              className={cn(
                                'text-sm',
                                isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              )}
                            >
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        <ArrowRight
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No results found</p>
                <p className="mt-1 text-sm">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-2 py-1 font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-2 py-1 font-mono">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-2 py-1 font-mono">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

