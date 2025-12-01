'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { rosApi, CalendarEntry } from '@/services/rosApi';
import { use2FA } from '@/contexts/TwoFAContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Download } from 'lucide-react';

export function CalendarManagement() {
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(false);
  const { promptFor2FA } = use2FA();

  // Data states
  const [currentCalendar, setCurrentCalendar] = useState<CalendarEntry | null>(
    null
  );
  const [calendarHistory, setCalendarHistory] = useState<CalendarEntry[]>([]);

  // Form states
  const [mode, setMode] = useState<'random' | 'manual'>('random');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState(5.0);
  const [manualPercentages, setManualPercentages] = useState({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  });

  const fetchCurrent = useCallback(
    async (twoFACode?: string) => {
      try {
        setLoading(true);
        const data = await rosApi.getCurrentCalendar(twoFACode);
        setCurrentCalendar(data);
        if (!data) {
          toast.info('No active calendar found for the current week.');
        }
      } catch (error: any) {
        console.error(
          '[CalendarManagement] Failed to fetch current calendar:',
          error
        );

        // Check if it's a 2FA error
        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;
        const is2FAError =
          errorCode === '2FA_CODE_REQUIRED' ||
          errorCode === '2FA_CODE_INVALID' ||
          errorCode === '2FA_MANDATORY' ||
          (error.response?.status === 400 &&
            errorData?.message?.toLowerCase().includes('2fa'));

        if (is2FAError && !twoFACode) {
          // First attempt - prompt for 2FA code
          console.log(
            '[CalendarManagement] 2FA required for getCurrentCalendar, prompting for code...'
          );
          const code = await promptFor2FA();
          if (code) {
            console.log(
              '[CalendarManagement] Retrying getCurrentCalendar with 2FA code...'
            );
            // Retry with 2FA code
            await fetchCurrent(code);
            return;
          } else {
            toast.error('2FA code is required to view current calendar');
            return;
          }
        } else if (is2FAError && twoFACode) {
          // Retry failed - invalid 2FA code
          toast.error('Invalid 2FA code. Please try again.');
          return;
        }

        // For other errors, show error message but don't throw
        // GET requests can fail gracefully - just show a toast
        if (error.response?.status !== 404) {
          toast.error(error.message || 'Failed to fetch current calendar');
        }
      } finally {
        setLoading(false);
      }
    },
    [promptFor2FA]
  );

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await rosApi.getAllCalendars();
      setCalendarHistory(data || []);
    } catch (error: any) {
      console.error('Failed to fetch calendar history', error);
      toast.error(error.message || 'Failed to fetch calendar history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'current') fetchCurrent();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchCurrent]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure date is Monday? The API might validate this.
      // Format date to ISO string with time if needed, or just date string.
      // The guide example uses: '2025-12-22T12:00:00Z'
      const startDateISO = new Date(weekStartDate).toISOString();

      const payload =
        mode === 'random'
          ? {
              weekStartDate: startDateISO,
              targetWeeklyPercentage: weeklyTarget,
              description: `Week starting ${weekStartDate} - Random ${weeklyTarget}%`,
            }
          : {
              weekStartDate: startDateISO,
              dailyPercentages: manualPercentages,
              description: `Week starting ${weekStartDate} - Manual`,
            };

      await rosApi.createCalendar(payload);
      toast.success('Calendar created successfully');
      // Reset form or switch tab
      setWeekStartDate('');
      fetchCurrent();
      setActiveTab('current');
    } catch (error: any) {
      console.error('[CalendarManagement] Failed to create calendar:', error);

      // Extract error message from various possible locations
      const errorData = error.response?.data;
      const errorCode = errorData?.error?.code;
      const errorMsg =
        error.message || errorData?.message || errorData?.error?.message || '';

      // Log each property separately to avoid serialization issues
      console.error('[CalendarManagement] Error details:');
      console.error('  - Message:', error.message);
      console.error('  - Code:', error.code);
      console.error('  - Is Network Error:', error.isNetworkError);
      console.error('  - Has Response:', !!error.response);
      if (error.response) {
        console.error('  - Response Status:', error.response.status);
        console.error('  - Response Data:', error.response.data);
        console.error(
          '  - Response Data (Stringified):',
          JSON.stringify(error.response.data, null, 2)
        );
      }
      console.error('  - Error Message:', errorMsg);
      console.error('  - Error Code:', errorCode);

      // Check if calendar already exists (409 Conflict) - handle before 2FA check
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            errorData?.message ||
            'A calendar for this week already exists.'
        );
        return;
      }

      // Check if it's a 2FA error FIRST - check error message string even if no response
      // The error message "2FA code is required for admin operations" indicates a 2FA error
      const is2FAError =
        errorCode === '2FA_CODE_REQUIRED' ||
        errorCode === '2FA_CODE_INVALID' ||
        errorCode === '2FA_MANDATORY' ||
        errorMsg.toLowerCase().includes('2fa') ||
        errorMsg.toLowerCase().includes('two-factor') ||
        errorMsg.toLowerCase().includes('two factor') ||
        errorMsg.toLowerCase().includes('2fa code is required');

      // Check if status is 400 or 403 (both can mean 2FA required for admin endpoints)
      const statusCode = error.response?.status;
      const is2FAStatus = statusCode === 400 || statusCode === 403;

      if (is2FAError || is2FAStatus) {
        // For 403 errors or 2FA-related messages, prompt for 2FA code
        console.log(
          '[CalendarManagement] 2FA required, prompting for code...',
          {
            is2FAError,
            is2FAStatus,
            statusCode,
            errorMessage: errorMsg,
            errorCode,
            hasResponse: !!error.response,
          }
        );
        // Prompt for 2FA code and retry
        try {
          console.log('[CalendarManagement] Calling promptFor2FA()...');
          const twoFACode = await promptFor2FA();
          console.log(
            '[CalendarManagement] Received 2FA code:',
            twoFACode ? 'YES' : 'NO'
          );
          if (twoFACode) {
            // Retry with 2FA code
            console.log('[CalendarManagement] Retrying with 2FA code...');
            const startDateISO = new Date(weekStartDate).toISOString();
            const payload =
              mode === 'random'
                ? {
                    weekStartDate: startDateISO,
                    targetWeeklyPercentage: weeklyTarget,
                    description: `Week starting ${weekStartDate} - Random ${weeklyTarget}%`,
                  }
                : {
                    weekStartDate: startDateISO,
                    dailyPercentages: manualPercentages,
                    description: `Week starting ${weekStartDate} - Manual`,
                  };

            console.log('[CalendarManagement] Retry payload:', payload);
            console.log(
              '[CalendarManagement] Retry with 2FA code:',
              twoFACode ? 'YES' : 'NO'
            );

            await rosApi.createCalendar(payload, twoFACode);
            toast.success('Calendar created successfully');
            setWeekStartDate('');
            fetchCurrent();
            setActiveTab('current');
            return;
          } else {
            toast.error('2FA code is required to create calendar');
            return;
          }
        } catch (retryError: any) {
          console.error('[CalendarManagement] Retry failed:', retryError);

          // Check if it's still a network error after providing 2FA code
          if (retryError.isNetworkError || !retryError.response) {
            toast.error(
              'Network error: The backend endpoint may not be implemented. ' +
                'Please check with the backend team if the calendar creation endpoint exists.'
            );
            return;
          }

          // Check if 2FA code was invalid
          const retryErrorCode = retryError.response?.data?.error?.code;
          if (retryErrorCode === '2FA_CODE_INVALID') {
            toast.error('Invalid 2FA code. Please try again.');
            return;
          }

          // Check if calendar already exists (409 Conflict)
          if (retryError.response?.status === 409) {
            toast.error(
              retryError.response?.data?.message ||
                'A calendar for this week already exists.'
            );
            return;
          }

          const retryErrorMessage =
            retryError.message ||
            retryError.response?.data?.message ||
            retryError.response?.data?.error?.message ||
            'Failed to create calendar with 2FA code.';
          toast.error(retryErrorMessage);
          return;
        }
      }

      // Check if it's a network error (only after checking for 2FA)
      if (
        error.isNetworkError ||
        (!error.response &&
          !is2FAError &&
          !errorMsg.toLowerCase().includes('2fa'))
      ) {
        toast.error(
          error.message ||
            'Network error: Unable to connect to the backend. Please check your internet connection and ensure the backend server is running.'
        );
        return;
      }

      const finalErrorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        'Failed to create calendar. Please check the backend endpoint is implemented.';
      toast.error(finalErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          ROS Calendar Management
        </h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="current">Current Week</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Active Calendar</CardTitle>
              <CardDescription>
                Week {currentCalendar?.weekNumber}, {currentCalendar?.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading calendar...
                </div>
              ) : currentCalendar ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm font-medium">
                        Total Weekly Target
                      </div>
                      <div className="text-2xl font-bold text-emerald-500">
                        {currentCalendar.totalWeeklyPercentage}%
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm font-medium">
                        Start Date
                      </div>
                      <div className="text-lg font-semibold">
                        {new Date(
                          currentCalendar.weekStartDate
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-muted-foreground text-sm font-medium">
                        End Date
                      </div>
                      <div className="text-lg font-semibold">
                        {new Date(
                          currentCalendar.weekEndDate
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-sm font-semibold">
                      Daily Breakdown
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(currentCalendar.dailyPercentages).map(
                          ([day, pct]) => (
                            <TableRow key={day}>
                              <TableCell className="capitalize">
                                {day}
                              </TableCell>
                              <TableCell>{pct}%</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground flex h-40 items-center justify-center">
                  No active calendar found for this week.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Weekly Calendar</CardTitle>
              <CardDescription>
                Set up the ROS distribution for an upcoming week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label>Week Start Date (Monday)</Label>
                  <Input
                    type="date"
                    required
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Distribution Mode</Label>
                  <RadioGroup
                    value={mode}
                    onValueChange={(v: any) => setMode(v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="random" />
                      <Label htmlFor="random">Randomized</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manual</Label>
                    </div>
                  </RadioGroup>
                </div>

                {mode === 'random' ? (
                  <div className="space-y-2">
                    <Label>Weekly Target Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={weeklyTarget || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : parseFloat(value);
                        if (!isNaN(numValue)) {
                          setWeeklyTarget(numValue);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {Object.keys(manualPercentages).map((day) => (
                      <div key={day} className="space-y-2">
                        <Label className="capitalize">{day}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={
                            Number.isFinite((manualPercentages as any)[day])
                              ? (manualPercentages as any)[day]
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              setManualPercentages((prev) => ({
                                ...prev,
                                [day]: 0,
                              }));
                              return;
                            }
                            const numValue = parseFloat(value);
                            if (!isNaN(numValue) && isFinite(numValue)) {
                              setManualPercentages((prev) => ({
                                ...prev,
                                [day]: numValue,
                              }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Download className="mr-2 h-4 w-4" />
                  Create Calendar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Total %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendarHistory.map((cal, i) => (
                    <TableRow key={i}>
                      <TableCell>{cal.weekNumber}</TableCell>
                      <TableCell>{cal.year}</TableCell>
                      <TableCell>
                        {new Date(cal.weekStartDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{cal.totalWeeklyPercentage}%</TableCell>
                      <TableCell>
                        {cal.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
