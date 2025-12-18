'use client';

import React, { useState } from 'react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { AdminSetting } from '@/services/adminSettingsService';
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

import { Info, RefreshCw } from 'lucide-react';
import { SettingTooltip } from './SettingTooltip';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { EmptyStates } from '@/components/EmptyStates';

interface SettingInputProps {
  setting: AdminSetting;
  value: any;
  onChange: (value: any) => void;
}

function SettingInput({ setting, value, onChange }: SettingInputProps) {
  const renderInput = () => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={onChange}
            disabled={!setting.isEditable}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={setting.minValue}
            max={setting.maxValue}
            disabled={!setting.isEditable}
            className="max-w-xs"
          />
        );

      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!setting.isEditable}
            className="max-w-xs"
          />
        );

      case 'select':
        if (setting.validOptions && setting.validOptions.length > 0) {
          return (
            <Select
              value={String(value)}
              onValueChange={onChange}
              disabled={!setting.isEditable}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.validOptions.map((option) => (
                  <SelectItem key={String(option)} value={String(option)}>
                    {String(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return null;

      default:
        return (
          <Input
            type="text"
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            disabled={!setting.isEditable}
            className="max-w-xs"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {renderInput()}
      {setting.minValue !== undefined && setting.maxValue !== undefined && (
        <p className="text-muted-foreground text-xs">
          Range: {setting.minValue} - {setting.maxValue}
        </p>
      )}
    </div>
  );
}

interface SettingRowProps {
  setting: AdminSetting;
  onUpdate: (key: string, value: any) => Promise<void>;
}

function SettingRow({ setting, onUpdate }: SettingRowProps) {
  const [value, setValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    setHasChanges(JSON.stringify(newValue) !== JSON.stringify(setting.value));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(setting.key, value);
      setHasChanges(false);
    } catch {
      // Error already handled in onUpdate
    } finally {
      setSaving(false);
    }
  };

  const tooltip = setting.tooltip || {
    title: setting.helperTitle,
    content: setting.helperText || setting.description,
    description: setting.description,
  };

  return (
    <div className="hover:bg-muted/50 flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={setting.key} className="font-semibold">
            {setting.displayName}
          </Label>
          {tooltip && (
            <SettingTooltip tooltip={tooltip}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </SettingTooltip>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{setting.description}</p>
        <SettingInput setting={setting} value={value} onChange={handleChange} />
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
  const { settings, loading, error, refresh, updateSetting } =
    useAdminSettings(category);

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

  const handleUpdate = async (key: string, value: any) => {
    await updateSetting(key, value, `Updated ${key} via admin panel`);
  };

  // Render settings grouped by category or as a single list
  if (category && Array.isArray(settings)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Settings: {category}</h2>
          <Button onClick={() => refresh()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="space-y-2">
          {settings.map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!category && settings && typeof settings === 'object') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Settings</h2>
          <Button onClick={() => refresh()} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        {Object.entries(settings).map(([categoryName, categorySettings]) => (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="capitalize">{categoryName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.isArray(categorySettings) &&
                categorySettings.map((setting) => (
                  <SettingRow
                    key={setting.key}
                    setting={setting}
                    onUpdate={handleUpdate}
                  />
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <EmptyStates.EmptyState
      title="No settings found"
      description="Settings will appear here once they are configured"
    />
  );
}
