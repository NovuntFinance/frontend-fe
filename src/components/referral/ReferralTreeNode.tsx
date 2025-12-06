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
        title=""
        subtitle=""
        icon={Users}
        colorTheme={theme}
        tooltip={`${entry.username} - Level ${level} referral. Earns ${commissionRate}% commission. ${hasChildren ? 'Click to ' + (isExpanded ? 'collapse' : 'expand') + ' their referrals.' : 'This user has no referrals yet.'}`}
        className={`relative z-10 ${hasChildren ? 'cursor-pointer hover:border-opacity-70' : ''}`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="space-y-3">
          {/* Compact User Info - Single Line */}
          <div className="flex items-center gap-3">
            <Avatar className="border-border h-10 w-10 border-2 flex-shrink-0">
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br font-semibold text-sm">
                {getInitials(entry.username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
              <h4 className="text-foreground font-semibold truncate">
                {entry.username}
              </h4>
              
              {entry.hasQualifyingStake ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-muted text-muted-foreground text-xs"
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Inactive
                </Badge>
              )}

              <div className="text-muted-foreground flex items-center gap-3 text-xs flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(entry.joinedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  L{level} • {commissionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Collapse Indicator or No Referrals Message */}
          {hasChildren ? (
            <div className="bg-muted/50 border-border/50 mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium">
              <span className="text-muted-foreground">
                {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'}{' '}
                {node.children.length} referral
                {node.children.length !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="bg-muted/30 border-border/30 mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm">
              <span className="text-muted-foreground italic">
                No referrals yet
              </span>
            </div>
          )}
        </div>
      </NovuntPremiumCard>
    </motion.div>
  );
}
