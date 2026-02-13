'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Plus, Clock, RefreshCw } from 'lucide-react';
import { use2FA } from '@/contexts/TwoFAContext';
import { useCronSettings, useTimezones } from '@/hooks/useCronSettings';
import { TimezoneSelector } from './TimezoneSelector';
import { SlotTimeInput } from './SlotTimeInput';
import { SchedulePreview } from './SchedulePreview';
import { cronSettingsService } from '@/services/cronSettingsService';
import type {
  DistributionSlot,
  UpdateScheduleRequest,
} from '@/types/cronSettings';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Maximum number of distribution slots allowed per day
const MAX_SLOTS = 100;

export function CronSettingsPage() {
  const router = useRouter();
  const { promptFor2FA } = use2FA();
  const {
    cronSettings,
    isLoading,
    updateCronSettings,
    toggleCronSettings,
    isUpdating,
    isToggling,
  } = useCronSettings();
  const { timezones, isLoading: isLoadingTimezones } = useTimezones();

  const [formData, setFormData] = useState<UpdateScheduleRequest>({
    timezone: '',
    slots: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Set up 2FA
  useEffect(() => {
    cronSettingsService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
  }, [promptFor2FA]);

  // Initialize form from API data
  useEffect(() => {
    if (cronSettings) {
      setFormData({
        timezone: cronSettings.timezone,
        slots: cronSettings.slots || [],
      });
      setIsEnabled(cronSettings.isEnabled);
    }
  }, [cronSettings]);

  // Handle slot addition
  const handleAddSlot = () => {
    if (formData.slots.length >= MAX_SLOTS) {
      toast.error(`Maximum ${MAX_SLOTS} slots allowed`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      slots: [...prev.slots, { time: '15:59:59', label: '' }],
    }));
  };

  // Handle slot change
  const handleSlotChange = (index: number, slot: DistributionSlot) => {
    setFormData((prev) => {
      const newSlots = [...prev.slots];
      newSlots[index] = slot;
      return { ...prev, slots: newSlots };
    });
  };

  // Handle slot removal
  const handleSlotRemove = (index: number) => {
    if (formData.slots.length <= 1) {
      toast.error('Must have at least 1 slot');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      slots: prev.slots.filter((_, idx) => idx !== index),
    }));
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!formData.timezone) {
      errors.push('Timezone is required');
    }

    if (formData.slots.length < 1 || formData.slots.length > MAX_SLOTS) {
      errors.push(`Number of slots must be between 1 and ${MAX_SLOTS}`);
    }

    formData.slots.forEach((slot, idx) => {
      // Validate time format HH:MM:SS
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
      if (!timeRegex.test(slot.time)) {
        errors.push(`Slot ${idx + 1}: Invalid time format (must be HH:MM:SS)`);
      }

      // Validate label length
      if (slot.label && slot.label.length > 100) {
        errors.push(`Slot ${idx + 1}: Label too long (max 100 characters)`);
      }
    });

    return errors;
  }, [formData]);

  const isValid = validationErrors.length === 0;

  // Handle save
  const handleSave = async () => {
    if (!isValid) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await updateCronSettings(formData);
      setIsEditing(false);
    } catch {
      // Error already handled by mutation
    }
  };

  // Handle toggle
  const handleToggle = async () => {
    try {
      await toggleCronSettings({ isEnabled: !isEnabled });
      setIsEnabled(!isEnabled);
    } catch {
      // Error already handled by mutation
    }
  };

  if (isLoading || isLoadingTimezones) {
    return (
      <div className="space-y-4">
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Distribution Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Configure when daily distributions execute
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <Label
              htmlFor="enabled-toggle"
              className="mb-1 text-sm font-medium"
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {cronSettings?.mode}
            </Badge>
          </div>
          <Switch
            id="enabled-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        </div>
      </div>

      {/* Current Schedule Display */}
      {!isEditing && cronSettings && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Schedule</CardTitle>
              <CardDescription>
                Your active distribution configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Mode</Label>
                  <p className="font-medium">{cronSettings.mode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">
                    Number of Slots
                  </Label>
                  <p className="font-medium">
                    {cronSettings.slots?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-sm">
                  Timezone
                </Label>
                <p className="font-medium">{cronSettings.timezone}</p>
                <p className="text-muted-foreground text-xs">
                  {cronSettings.timezoneOffset}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-sm">
                  Schedule
                </Label>
                {(cronSettings.slots || []).map((slot, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">Slot {index + 1}</span>
                      <span className="font-mono text-sm">{slot.time}</span>
                    </div>
                    {slot.label && (
                      <span className="text-muted-foreground text-sm">
                        {slot.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="mt-4 w-full"
              >
                Edit Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Preview in view mode */}
          <SchedulePreview
            timezone={cronSettings.timezone}
            slots={cronSettings.slots}
          />
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Schedule</CardTitle>
              <CardDescription>
                Update distribution times and timezone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-inside list-disc space-y-1">
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Timezone Selector */}
              <TimezoneSelector
                value={formData.timezone}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, timezone: value }))
                }
                timezones={timezones}
                disabled={isUpdating}
              />

              <hr />

              {/* Slot Time Inputs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">
                    Time Slots ({formData.slots.length}/{MAX_SLOTS})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSlot}
                    disabled={formData.slots.length >= MAX_SLOTS || isUpdating}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Slot
                  </Button>
                </div>

                {/* Scrollable container for many slots */}
                <div className="max-h-[600px] space-y-3 overflow-y-auto pr-2">
                  {formData.slots.map((slot, idx) => (
                    <SlotTimeInput
                      key={idx}
                      slot={{ ...slot, index: idx }}
                      onChange={(updatedSlot) =>
                        handleSlotChange(idx, updatedSlot)
                      }
                      onRemove={() => handleSlotRemove(idx)}
                      disabled={isUpdating}
                      canRemove={formData.slots.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!isValid || isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  ⚠️ Changes apply immediately without server restart. Active
                  distributions will continue, but future distributions will use
                  the new schedule.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Preview in edit mode */}
          <SchedulePreview
            timezone={formData.timezone}
            slots={formData.slots}
          />
        </div>
      )}
    </div>
  );
}
