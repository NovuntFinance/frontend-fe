/**
 * Error State Component
 * Shows error message with retry option
 * Follows Novunt design system
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorStateProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Error State Component
 * Displays error message with retry button
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-destructive/20 shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-destructive mb-1">
                Unable to Load Bonus Status
              </h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

