'use client';

import React from 'react';
import { Clock, X } from 'lucide-react';
import type { DistributionSlot } from '@/types/cronSettings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  slot: DistributionSlot & { index: number };
  onChange: (slot: DistributionSlot) => void;
  onRemove?: () => void;
  disabled?: boolean;
  canRemove?: boolean;
}

export function SlotTimeInput({
  slot,
  onChange,
  onRemove,
  disabled,
  canRemove = true,
}: Props) {
  // Parse time string to get parts
  const timeParts = slot.time.split(':');
  const hour = timeParts[0] || '15';
  const minute = timeParts[1] || '59';
  const second = timeParts[2] || '59';

  const updateTime = (
    newHour: string,
    newMinute: string,
    newSecond: string
  ) => {
    const formattedTime = `${newHour.padStart(2, '0')}:${newMinute.padStart(2, '0')}:${newSecond.padStart(2, '0')}`;
    onChange({
      ...slot,
      time: formattedTime,
    });
  };

  const updateLabel = (label: string) => {
    onChange({
      ...slot,
      label: label || undefined,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <h4 className="font-medium">Slot {slot.index + 1}</h4>
          </div>
          {canRemove && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* HTML5 Time Input with seconds */}
        <div>
          <Label htmlFor={`slot-${slot.index}-time`} className="text-sm">
            Execution Time
          </Label>
          <Input
            id={`slot-${slot.index}-time`}
            type="time"
            step="1"
            value={`${hour}:${minute}:${second}`}
            onChange={(e) => {
              const value = e.target.value; // Format: HH:MM:SS
              if (value) {
                const parts = value.split(':');
                updateTime(
                  parts[0] || '00',
                  parts[1] || '00',
                  parts[2] || '00'
                );
              }
            }}
            disabled={disabled}
            className="text-center font-mono"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            24-hour format with seconds
          </p>
        </div>

        {/* Manual time inputs as fallback/fine-tuning */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor={`slot-${slot.index}-hour`} className="text-xs">
              Hour
            </Label>
            <Input
              id={`slot-${slot.index}-hour`}
              type="number"
              min="0"
              max="23"
              value={parseInt(hour)}
              onChange={(e) => {
                const val = Math.min(
                  23,
                  Math.max(0, parseInt(e.target.value) || 0)
                );
                updateTime(String(val), minute, second);
              }}
              disabled={disabled}
              placeholder="HH"
              className="text-center"
            />
          </div>

          <div>
            <Label htmlFor={`slot-${slot.index}-minute`} className="text-xs">
              Minute
            </Label>
            <Input
              id={`slot-${slot.index}-minute`}
              type="number"
              min="0"
              max="59"
              value={parseInt(minute)}
              onChange={(e) => {
                const val = Math.min(
                  59,
                  Math.max(0, parseInt(e.target.value) || 0)
                );
                updateTime(hour, String(val), second);
              }}
              disabled={disabled}
              placeholder="MM"
              className="text-center"
            />
          </div>

          <div>
            <Label htmlFor={`slot-${slot.index}-second`} className="text-xs">
              Second
            </Label>
            <Input
              id={`slot-${slot.index}-second`}
              type="number"
              min="0"
              max="59"
              value={parseInt(second)}
              onChange={(e) => {
                const val = Math.min(
                  59,
                  Math.max(0, parseInt(e.target.value) || 0)
                );
                updateTime(hour, minute, String(val));
              }}
              disabled={disabled}
              placeholder="SS"
              className="text-center"
            />
          </div>
        </div>

        {/* Optional label */}
        <div>
          <Label htmlFor={`slot-${slot.index}-label`} className="text-xs">
            Label (Optional)
          </Label>
          <Input
            id={`slot-${slot.index}-label`}
            type="text"
            maxLength={100}
            value={slot.label || ''}
            onChange={(e) => updateLabel(e.target.value)}
            disabled={disabled}
            placeholder="e.g., Morning Distribution"
          />
        </div>
      </div>
    </Card>
  );
}
