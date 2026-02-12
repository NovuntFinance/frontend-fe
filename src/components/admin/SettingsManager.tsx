'use client';

import React, { useState, useEffect } from 'react';
import { useSettingsBundle } from '@/hooks/useAdminSettings';
import type {
  BundleSetting,
  BundleCategory,
} from '@/services/adminSettingsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, RefreshCw } from 'lucide-react';
import { SettingTooltip } from './SettingTooltip';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { EmptyStates } from '@/components/EmptyStates';
import { CronSettingsPage } from '@/components/admin/cronSettings';

/** Setting keys to hide from admin UI; daily distribution is done via Daily Declaration Returns page. */
const HIDDEN_SETTING_KEYS = new Set<string>(['weekly_return_percentage']);

function filterVisibleSettings(settings: BundleSetting[]): BundleSetting[] {
  return settings.filter((s) => !HIDDEN_SETTING_KEYS.has(s.key));
}

/** Normalize value for display/compare; backend may send booleans as strings. */
function normalizeSettingValue(
  value: unknown,
  controlType: string,
  type: string
): unknown {
  if (controlType === 'toggle' || type === 'boolean') {
    return value === true || value === 'true';
  }
  if (controlType === 'number' || type === 'number') {
    if (value === '' || value == null) return 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
  }
  return value;
}

interface BundleSettingInputProps {
  setting: BundleSetting;
  value: unknown;
  onChange: (value: unknown) => void;
}

function BundleSettingInput({
  setting,
  value,
  onChange,
}: BundleSettingInputProps) {
  const controlType =
    setting.ui?.controlType ??
    (setting.type === 'boolean'
      ? 'toggle'
      : setting.type === 'number'
        ? 'number'
        : 'text');
  const validations = setting.validations ?? {};
  const min = validations.min;
  const max = validations.max;
  const options = validations.options;
  const unit = setting.ui?.recommendedUnit;

  switch (controlType) {
    case 'toggle':
      return (
        <Switch
          checked={
            value === true ||
            value === 'true' ||
            (typeof value === 'string' && value.toLowerCase() === 'true')
          }
          onCheckedChange={(v) => onChange(v)}
          disabled={!setting.isEditable}
        />
      );

    case 'number': {
      const num =
        typeof value === 'number' && !Number.isNaN(value) ? value : '';
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={num}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') onChange(0);
              else onChange(parseFloat(v));
            }}
            min={min}
            max={max}
            disabled={!setting.isEditable}
            className="max-w-xs"
          />
          {unit && (
            <span className="text-muted-foreground text-sm">{unit}</span>
          )}
        </div>
      );
    }

    case 'text':
      return (
        <Input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={!setting.isEditable}
          className="max-w-xs"
        />
      );

    case 'select':
      if (options && options.length > 0) {
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={(v) => {
              const first = options[0];
              if (typeof first === 'number') onChange(parseFloat(v) || first);
              else onChange(v);
            }}
            disabled={!setting.isEditable}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={String(opt)} value={String(opt)}>
                  {String(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <Input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={!setting.isEditable}
          className="max-w-xs"
        />
      );

    case 'multiselect': {
      const arr = Array.isArray(value) ? value : [];
      return (
        <Input
          type="text"
          value={arr.join(', ')}
          onChange={(e) => {
            const s = e.target.value;
            const next = s
              ? s
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean)
              : [];
            onChange(next);
          }}
          disabled={!setting.isEditable}
          className="max-w-xs"
          placeholder="Comma-separated values"
        />
      );
    }

    case 'json':
      return (
        <Input
          type="text"
          value={
            typeof value === 'object'
              ? JSON.stringify(value)
              : String(value ?? '')
          }
          onChange={(e) => {
            try {
              const v = e.target.value.trim();
              if (!v) onChange(null);
              else onChange(JSON.parse(v));
            } catch {
              // leave as-is on invalid JSON
            }
          }}
          disabled={!setting.isEditable}
          className="max-w-md font-mono text-sm"
        />
      );

    default:
      return (
        <Input
          type="text"
          value={
            typeof value === 'object'
              ? JSON.stringify(value)
              : String(value ?? '')
          }
          onChange={(e) => onChange(e.target.value)}
          disabled={!setting.isEditable}
          className="max-w-xs"
        />
      );
  }
}

interface BundleSettingRowProps {
  setting: BundleSetting;
  onUpdate: (key: string, value: unknown) => Promise<void>;
}

function BundleSettingRow({ setting, onUpdate }: BundleSettingRowProps) {
  const controlType =
    setting.ui?.controlType ?? (setting.type === 'boolean' ? 'toggle' : 'text');
  const normalizedInitial = normalizeSettingValue(
    setting.value,
    controlType,
    setting.type
  );
  const [value, setValue] = useState<unknown>(normalizedInitial);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync from backend only when there are no local unsaved changes, so the toggle doesn't jump back
  useEffect(() => {
    if (!hasChanges) {
      const next = normalizeSettingValue(
        setting.value,
        controlType,
        setting.type
      );
      setValue(next);
    }
  }, [setting.value, controlType, setting.type, hasChanges]);

  const handleChange = (newValue: unknown) => {
    setValue(newValue);
    const normalizedBackend = normalizeSettingValue(
      setting.value,
      controlType,
      setting.type
    );
    setHasChanges(
      JSON.stringify(newValue) !== JSON.stringify(normalizedBackend)
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const valueToSave =
        controlType === 'toggle' || setting.type === 'boolean'
          ? value === true || value === 'true'
          : value;
      await onUpdate(setting.key, valueToSave);
      setHasChanges(false);
    } catch {
      // Error shown by hook
    } finally {
      setSaving(false);
    }
  };

  const tooltip =
    setting.label || setting.description
      ? {
          title: setting.label,
          content: setting.description || setting.label || '',
          description: setting.description || '',
        }
      : null;

  const validations = setting.validations ?? {};
  const min = validations.min;
  const max = validations.max;

  return (
    <div className="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={setting.key} className="font-semibold">
            {setting.label}
          </Label>
          {tooltip && (
            <SettingTooltip tooltip={tooltip}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </SettingTooltip>
          )}
        </div>
        {setting.description && (
          <p className="text-muted-foreground text-sm">{setting.description}</p>
        )}
        <BundleSettingInput
          setting={setting}
          value={value}
          onChange={handleChange}
        />
        {typeof min === 'number' && typeof max === 'number' && (
          <p className="text-muted-foreground text-xs">
            Range: {min} – {max}
          </p>
        )}
      </div>
      {setting.isEditable && (
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          size="sm"
          variant={hasChanges ? 'default' : 'ghost'}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      )}
    </div>
  );
}

interface SettingsManagerProps {
  category?: string;
}

export function SettingsManager({ category }: SettingsManagerProps) {
  const { categories, loading, error, refresh, updateSetting } =
    useSettingsBundle();

  const handleUpdate = async (key: string, value: unknown) => {
    await updateSetting(key, value, `Updated ${key} via admin panel`);
  };

  if (loading) {
    return <LoadingStates.Page />;
  }

  if (error) {
    return (
      <UserFriendlyError
        error={error}
        onRetry={() => refresh()}
        className="min-h-[60vh]"
      />
    );
  }

  const list: BundleCategory[] = category
    ? categories.filter((c) => c.key === category)
    : [...categories].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (list.length === 0) {
    return (
      <EmptyStates.EmptyState
        title="No settings found"
        description="Settings will appear here once they are configured."
      />
    );
  }

  if (list.length === 1) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{list[0].title}</h2>
          <Button onClick={() => refresh()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="space-y-2">
          {list[0].settings.map((s) => (
            <BundleSettingRow key={s.key} setting={s} onUpdate={handleUpdate} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <Button onClick={() => refresh()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Tabs defaultValue={list[0]?.key ?? 'general'} className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1">
          {list.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.title}
            </TabsTrigger>
          ))}
          <TabsTrigger value="distribution-schedule">
            Distribution Schedule
          </TabsTrigger>
        </TabsList>
        {list.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{cat.title}</CardTitle>
                {cat.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {cat.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {filterVisibleSettings(cat.settings).map((s) => (
                  <BundleSettingRow
                    key={s.key}
                    setting={s}
                    onUpdate={handleUpdate}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        <TabsContent value="distribution-schedule" className="mt-4">
          <CronSettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
