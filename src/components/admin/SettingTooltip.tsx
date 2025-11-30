'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { AdminTooltip } from '@/services/adminSettingsService';

interface SettingTooltipProps {
  tooltip: AdminTooltip;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function SettingTooltip({
  tooltip,
  children,
  position = 'top',
}: SettingTooltipProps) {
  const getIcon = () => {
    const theme = tooltip.styling?.theme || 'default';
    switch (theme) {
      case 'warning':
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={position} className="max-w-md">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              {getIcon()}
              <div className="flex-1">
                <h4 className="mb-1 text-sm font-semibold">{tooltip.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {tooltip.content_details?.shortDescription || tooltip.content}
                </p>
              </div>
            </div>

            {tooltip.content_details?.warnings &&
              tooltip.content_details.warnings.length > 0 && (
                <div className="border-t pt-2">
                  <p className="mb-1 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    ⚠️ Warnings:
                  </p>
                  <ul className="space-y-1 text-xs">
                    {tooltip.content_details.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-yellow-600">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {tooltip.content_details?.bestPractices &&
              tooltip.content_details.bestPractices.length > 0 && (
                <div className="border-t pt-2">
                  <p className="mb-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    ✅ Best Practices:
                  </p>
                  <ul className="space-y-1 text-xs">
                    {tooltip.content_details.bestPractices.map(
                      (practice, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-600">•</span>
                          <span>{practice}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {tooltip.content_details?.examples &&
              tooltip.content_details.examples.length > 0 && (
                <div className="border-t pt-2">
                  <p className="mb-1 text-xs font-semibold">💡 Examples:</p>
                  <ul className="space-y-1 text-xs">
                    {tooltip.content_details.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {tooltip.content_details?.businessImpact && (
              <div className="border-t pt-2">
                <p className="mb-1 text-xs font-semibold">
                  📊 Business Impact:
                </p>
                <p className="text-muted-foreground text-xs">
                  {tooltip.content_details.businessImpact}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
