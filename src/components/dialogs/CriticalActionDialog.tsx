/**
 * Critical Action Dialog
 * Reusable modal for critical user actions requiring confirmation
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export interface CriticalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'warning' | 'error' | 'confirm' | 'success';
  title: string;
  description: string;
  details?: Array<{ label: string; value: string | React.ReactNode }>;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  children?: React.ReactNode;
}

const iconMap = {
  warning: AlertTriangle,
  error: AlertCircle,
  confirm: AlertCircle,
  success: CheckCircle,
};

const colorMap = {
  warning: 'text-orange-600 dark:text-orange-400',
  error: 'text-red-600 dark:text-red-400',
  confirm: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
};

const bgMap = {
  warning: 'bg-orange-100 dark:bg-orange-950',
  error: 'bg-red-100 dark:bg-red-950',
  confirm: 'bg-blue-100 dark:bg-blue-950',
  success: 'bg-green-100 dark:bg-green-950',
};

export function CriticalActionDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  children,
}: CriticalActionDialogProps) {
  const Icon = iconMap[type];
  const iconColor = colorMap[type];
  const iconBg = bgMap[type];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-3 ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Details Section */}
        {details && details.length > 0 && (
          <div className="space-y-3 border-t border-b py-4">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {detail.label}
                </span>
                <span className="text-sm font-semibold">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Custom Children */}
        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          {showCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 ${
                type === 'error' || type === 'warning'
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                  : ''
              }`}
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
