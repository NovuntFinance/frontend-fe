'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { IDistributionSlot } from '@/types/dailyDeclarationReturns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  slot: IDistributionSlot & {
    label?: string;
    scheduledTime?: string; // Formatted time like "09:00:00 WAT"
  };
  isExpanded?: boolean;
  onToggle?: () => void;
}

const STATUS_COLORS = {
  PENDING: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FDE68A',
    icon: Clock,
  },
  EXECUTING: {
    bg: '#FEF3C7',
    text: '#92400E',
    border: '#FCD34D',
    icon: Loader2,
  },
  COMPLETED: {
    bg: '#D1FAE5',
    text: '#065F46',
    border: '#A7F3D0',
    icon: CheckCircle2,
  },
  FAILED: {
    bg: '#FEE2E2',
    text: '#991B1B',
    border: '#FECACA',
    icon: XCircle,
  },
};

export function SlotStatusCard({ slot, isExpanded = false, onToggle }: Props) {
  const [expanded, setExpanded] = useState(isExpanded);
  const statusConfig = STATUS_COLORS[slot.status];
  const StatusIcon = statusConfig.icon;

  const toggleExpand = () => {
    if (onToggle) {
      onToggle();
    } else {
      setExpanded(!expanded);
    }
  };

  // Format timestamp
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const hasExecutionDetails =
    slot.executionDetails && Object.keys(slot.executionDetails).length > 0;

  return (
    <Card
      className="border-2 transition-all"
      style={{ borderColor: statusConfig.border }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: statusConfig.bg }}
            >
              <StatusIcon
                className={`h-5 w-5 ${slot.status === 'EXECUTING' ? 'animate-spin' : ''}`}
                style={{ color: statusConfig.text }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">Slot {slot.slotNumber}</h4>
                {slot.label && (
                  <span className="bg-muted rounded px-2 py-0.5 text-xs">
                    {slot.label}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-3 w-3" />
                <span>
                  {slot.scheduledTime || formatTime(slot.scheduledFor)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.text,
                borderColor: statusConfig.border,
              }}
            >
              {slot.status}
            </Badge>
            {hasExecutionDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="h-8 w-8 p-0"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">ROS:</span>{' '}
            <span className="font-medium">{slot.rosPercentage}%</span>
          </div>
          {slot.executionDetails?.rosStats && (
            <div>
              <span className="text-muted-foreground">Distributed:</span>{' '}
              <span className="font-medium">
                {formatCurrency(
                  slot.executionDetails.rosStats.totalDistributed
                )}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && hasExecutionDetails && slot.executionDetails && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {slot.executionDetails.executedAt && (
              <div className="text-sm">
                <span className="text-muted-foreground">Executed At:</span>{' '}
                <span className="font-medium">
                  {formatTime(slot.executionDetails.executedAt)}
                </span>
              </div>
            )}

            {slot.executionDetails.rosStats && (
              <div className="bg-muted/50 space-y-1 rounded p-3">
                <h5 className="text-muted-foreground mb-2 text-xs font-semibold">
                  ROS Distribution
                </h5>
                <div className="flex justify-between text-sm">
                  <span>Stakes Processed:</span>
                  <span className="font-medium">
                    {slot.executionDetails.rosStats.processedStakes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Distributed:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      slot.executionDetails.rosStats.totalDistributed
                    )}
                  </span>
                </div>
              </div>
            )}

            {slot.executionDetails.premiumPoolStats && (
              <div className="bg-muted/50 space-y-1 rounded p-3">
                <h5 className="text-muted-foreground mb-2 text-xs font-semibold">
                  Premium Pool
                </h5>
                <div className="flex justify-between text-sm">
                  <span>Users:</span>
                  <span className="font-medium">
                    {slot.executionDetails.premiumPoolStats.usersReceived}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      slot.executionDetails.premiumPoolStats.totalDistributed
                    )}
                  </span>
                </div>
              </div>
            )}

            {slot.executionDetails.performancePoolStats && (
              <div className="bg-muted/50 space-y-1 rounded p-3">
                <h5 className="text-muted-foreground mb-2 text-xs font-semibold">
                  Performance Pool
                </h5>
                <div className="flex justify-between text-sm">
                  <span>Users:</span>
                  <span className="font-medium">
                    {slot.executionDetails.performancePoolStats.usersReceived}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      slot.executionDetails.performancePoolStats
                        .totalDistributed
                    )}
                  </span>
                </div>
              </div>
            )}

            {slot.executionDetails.executionTimeMs && (
              <div className="text-sm">
                <span className="text-muted-foreground">Execution Time:</span>{' '}
                <span className="font-medium">
                  {(slot.executionDetails.executionTimeMs / 1000).toFixed(2)}s
                </span>
              </div>
            )}

            {slot.executionDetails.error && (
              <div className="rounded bg-red-50 p-3 dark:bg-red-950">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <div>
                    <h5 className="mb-1 text-xs font-semibold text-red-600">
                      Error
                    </h5>
                    <p className="text-sm text-red-600">
                      {slot.executionDetails.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
