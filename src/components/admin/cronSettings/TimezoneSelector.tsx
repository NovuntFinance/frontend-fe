'use client';

import React, { useState, useMemo } from 'react';
import { Globe, Search } from 'lucide-react';
import type { Timezone } from '@/types/cronSettings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  value: string;
  onChange: (value: string) => void;
  timezones: Timezone[];
  disabled?: boolean;
  error?: string;
}

export function TimezoneSelector({
  value,
  onChange,
  timezones,
  disabled,
  error,
}: Props) {
  const [search, setSearch] = useState('');

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!search.trim()) return timezones;

    const lowerSearch = search.toLowerCase();
    return timezones.filter(
      (tz) =>
        tz.displayName.toLowerCase().includes(lowerSearch) ||
        tz.name.toLowerCase().includes(lowerSearch) ||
        tz.offset.toLowerCase().includes(lowerSearch)
    );
  }, [timezones, search]);

  // Get display label for selected timezone
  const selectedTimezone = useMemo(() => {
    return timezones.find((tz) => tz.name === value);
  }, [timezones, value]);

  return (
    <div className="space-y-2">
      <Label htmlFor="timezone">
        <Globe className="mr-1 inline h-4 w-4" />
        Timezone *
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="timezone" className={error ? 'border-red-500' : ''}>
          <SelectValue>
            {selectedTimezone ? (
              <span className="flex items-center gap-2">
                <span>{selectedTimezone.displayName}</span>
                <span className="text-muted-foreground text-xs">
                  ({selectedTimezone.offset})
                </span>
              </span>
            ) : (
              'Select timezone...'
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Search input */}
          <div className="bg-background sticky top-0 border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search timezones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Timezone list */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredTimezones.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                No timezones found
              </div>
            ) : (
              filteredTimezones.map((tz) => (
                <SelectItem key={tz.name} value={tz.name}>
                  <span className="flex w-full items-center justify-between">
                    <span>{tz.displayName}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {tz.offset}
                    </span>
                  </span>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
