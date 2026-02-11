'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { poolService } from '@/services/poolService';
import { adminSettingsService } from '@/services/adminSettingsService';
import { use2FA } from '@/contexts/TwoFAContext';
import { QualifierCounts } from '@/components/admin/pool/QualifierCounts';
import { UnifiedDeclarationCalendar } from './UnifiedDeclarationCalendar';
import { DeclareReturnsModal } from './DeclareReturnsModal';
import { DeclaredReturnsList } from './DeclaredReturnsList';
import { DistributionStatus } from '@/components/admin/dailyProfit/DistributionStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import type { PoolQualifiersResponse } from '@/types/pool';

const DEFAULT_MAX_ROS = 100;

export function DailyDeclarationReturnsManager() {
  const [qualifiers, setQualifiers] = useState<
    PoolQualifiersResponse['data'] | null
  >(null);
  const [isLoadingQualifiers, setIsLoadingQualifiers] = useState(true);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const { promptFor2FA } = use2FA();

  // Max ROS % from Admin Settings (optional; backend validates regardless)
  const { data: maxRosPercentage } = useQuery({
    queryKey: ['admin', 'setting', 'max_ros_percentage'],
    queryFn: async () => {
      try {
        const s = await adminSettingsService.getSetting('max_ros_percentage');
        const v = s?.value;
        return typeof v === 'number' && Number.isFinite(v)
          ? v
          : DEFAULT_MAX_ROS;
      } catch {
        return DEFAULT_MAX_ROS;
      }
    },
    staleTime: 60_000,
  });

  // Set 2FA getter from context
  useEffect(() => {
    poolService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
  }, [promptFor2FA]);

  // Load qualifier counts on mount
  useEffect(() => {
    loadQualifiers();
  }, []);

  const loadQualifiers = async () => {
    try {
      setIsLoadingQualifiers(true);
      const response = await poolService.getQualifiers();
      setQualifiers(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to load qualifier counts';
      toast.error(message);
    } finally {
      setIsLoadingQualifiers(false);
    }
  };

  const handleDateClick = (date: string) => {
    setEditingDate(date);
    setDeclareModalOpen(true);
  };

  const handleDeclareClick = () => {
    setEditingDate(null);
    setDeclareModalOpen(true);
  };

  const handleDeclareSuccess = () => {
    // Reload qualifiers (counts might have changed)
    loadQualifiers();
  };

  return (
    <div className="space-y-6">
      {/* Qualifier Counts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Qualifier Counts</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadQualifiers}
              disabled={isLoadingQualifiers}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoadingQualifiers ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingQualifiers ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ShimmerCard className="h-32" />
              <ShimmerCard className="h-32" />
            </div>
          ) : qualifiers ? (
            <QualifierCounts qualifiers={qualifiers} />
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              Failed to load qualifier counts
            </p>
          )}
        </CardContent>
      </Card>

      {/* Calendar and Status */}
      <div className="space-y-4 sm:space-y-6 xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0">
        {/* Calendar View - Full width on mobile/tablet, 2 columns on desktop */}
        <div className="xl:col-span-2">
          <UnifiedDeclarationCalendar
            onDateClick={handleDateClick}
            onDeclareClick={handleDeclareClick}
          />
        </div>

        {/* Distribution Status - right column */}
        <div className="xl:col-span-1">
          <DistributionStatus />
        </div>
      </div>

      {/* Declared Returns List - Full width */}
      <div>
        <DeclaredReturnsList onEdit={handleDateClick} />
      </div>

      {/* Declaration Modal */}
      <DeclareReturnsModal
        open={declareModalOpen}
        onOpenChange={setDeclareModalOpen}
        initialDate={editingDate || undefined}
        onSuccess={handleDeclareSuccess}
        maxRosPercentage={maxRosPercentage ?? DEFAULT_MAX_ROS}
      />
    </div>
  );
}
