'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import type { ReferralTreeEntry } from '@/types/referral';
import { REFERRAL_COMMISSION_RATES } from '@/types/referral';

interface ReferralTreeNodeProps {
  node: TreeNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}

export interface TreeNode {
  entry: ReferralTreeEntry;
  children: TreeNode[];
}

const getLevelTheme = (
  level: number
): 'orange' | 'blue' | 'emerald' | 'purple' => {
  if (level <= 1) return 'purple';
  if (level === 2) return 'blue';
  if (level === 3) return 'emerald';
  return 'orange';
};

const getInitials = (username: string): string => {
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ReferralTreeNode({
  node,
  level,
  isExpanded,
  onToggle,
  hasChildren,
}: ReferralTreeNodeProps) {
  const { entry } = node;
  const theme = getLevelTheme(level);
  const commissionRate =
    REFERRAL_COMMISSION_RATES[
      `level${Math.min(level, 5)}` as keyof typeof REFERRAL_COMMISSION_RATES
    ] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: level * 0.1 }}
      className="relative"
    >
      <NovuntPremiumCard
        title={entry.username}
        subtitle={`Level ${level} • ${commissionRate}% commission`}
        icon={Users}
        colorTheme={theme}
        tooltip={`Referral at level ${level}. Earns ${commissionRate}% commission from this user's activities.`}
        className="relative z-10"
      >
        <div className="space-y-4">
          {/* User Info Section */}
          <div className="flex items-start gap-4">
            <Avatar className="border-border h-12 w-12 border-2">
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br font-semibold">
                {getInitials(entry.username)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h4 className="text-foreground truncate font-semibold">
                  {entry.username}
                </h4>
                {entry.hasQualifyingStake ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-muted text-muted-foreground"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground mb-2 truncate text-sm">
                {entry.email}
              </p>

              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.joinedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Level {level}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-border/50 grid grid-cols-2 gap-3 border-t pt-3">
            <div>
              <p className="text-muted-foreground mb-1 text-xs">
                Commission Rate
              </p>
              <p className="text-foreground text-lg font-bold">
                {commissionRate}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs">Status</p>
              <p
                className={`text-sm font-medium ${entry.hasQualifyingStake ? 'text-emerald-400' : 'text-muted-foreground'}`}
              >
                {entry.hasQualifyingStake ? 'Qualified' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren && (
            <motion.button
              onClick={onToggle}
              className="bg-muted/50 hover:bg-muted text-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{isExpanded ? 'Collapse' : 'Expand'} Children</span>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ↓
              </motion.span>
            </motion.button>
          )}
        </div>
      </NovuntPremiumCard>
    </motion.div>
  );
}
