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
  const [authError, setAuthError] = useState<string | null>(null);
  const { promptFor2FA } = use2FA();

  // Temporary cache for 2FA code (valid for 25 seconds to account for 30-second refresh)
  const [cached2FACode, setCached2FACode] = useState<string | null>(null);
  const [cacheExpiry, setCacheExpiry] = useState<number | null>(null);

  // Helper to get cached 2FA code if still valid
  const getCached2FA = useCallback((): string | null => {
    if (cached2FACode && cacheExpiry && Date.now() < cacheExpiry) {
      console.log('[CalendarManagement] Using cached 2FA code');
      return cached2FACode;
    }
    return null;
  }, [cached2FACode, cacheExpiry]);

  // Helper to cache 2FA code
  const cache2FA = useCallback((code: string) => {
    setCached2FACode(code);
    // Cache for 25 seconds (codes refresh every 30 seconds)
    setCacheExpiry(Date.now() + 25000);
    console.log('[CalendarManagement] Cached 2FA code for 25 seconds');
  }, []);

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
      // Use cached code if no code provided and cache is valid
      const cachedCode = getCached2FA();
      const codeToUse: string | undefined =
        twoFACode || cachedCode || undefined;
      try {
        setLoading(true);
        setAuthError(null); // Clear any previous auth errors
        const data = await rosApi.getCurrentCalendar(codeToUse);
        setCurrentCalendar(data);
        if (!data) {
          toast.info('No active calendar found for the current week.');
        }
      } catch (error: any) {
        // Extract error data once
        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;

        // Handle 2FA_CODE_REQUIRED silently - this is expected on first request
        if (errorCode === '2FA_CODE_REQUIRED' && !codeToUse) {
          // Check if we have a cached valid 2FA code first
          const cachedCode = getCached2FA();
          if (cachedCode) {
            console.log(
              '[CalendarManagement] Using cached 2FA code for fetchCurrent'
            );
            await fetchCurrent(cachedCode);
            return;
          }

          // First attempt without 2FA - silently prompt for code
          console.log(
            '[CalendarManagement] 2FA required, prompting for code...'
          );
          const code = await promptFor2FA();
          if (code) {
            console.log('[CalendarManagement] Retrying with 2FA code...');
            // Cache the code for future requests
            cache2FA(code);
            // Retry with 2FA code (pass code explicitly to avoid recursion)
            const retryCode = code;
            await fetchCurrent(retryCode);
            return;
          } else {
            // User cancelled 2FA prompt - don't block, just show message
            toast.error('2FA code is required to view current calendar');
            return;
          }
        }

        // If we sent a 2FA code but still got REQUIRED, it means the code wasn't received/processed
        // This could mean the query parameter isn't being sent correctly or the code format is wrong
        if (errorCode === '2FA_CODE_REQUIRED' && codeToUse) {
          console.error(
            '[CalendarManagement] ⚠️ 2FA code was provided but backend still requires it!'
          );
          console.error('[CalendarManagement] Code that was sent:', codeToUse);
          console.error(
            '[CalendarManagement] Code length:',
            codeToUse?.length || 0
          );
          console.error('[CalendarManagement] This may indicate:');
          console.error('  1. Query parameter not being sent correctly');
          console.error('  2. Backend not reading query parameter');
          console.error('  3. Code format issue');

          const errorMessage =
            '2FA code was not received by the server. Please check your code and try again.';
          setAuthError(errorMessage);
          setCurrentCalendar(null);
          toast.error('Failed to send 2FA code. Please try again.');
          return;
        }

        // Now handle actual errors (only log/show errors for failures, not expected 2FA prompts)
        console.error(
          '[CalendarManagement] Failed to fetch current calendar:',
          error
        );

        // Handle 401 authentication errors
        if (error.response?.status === 401) {
          if (errorCode === 'INVALID_TOKEN') {
            toast.error('Your session has expired. Please log in again.');
            // Redirect will happen in rosApi.handleAuthError
            return;
          }
        }

        // Check if it's an invalid 2FA code - DON'T BLOCK, allow retry
        if (errorCode === '2FA_CODE_INVALID') {
          const backendMessage =
            errorData?.error?.message || 'Invalid 2FA code. Please try again.';
          const hint =
            errorData?.error?.hint ||
            "Make sure you're using the current code - they refresh every 30 seconds";

          // Show error but don't block - user can retry immediately
          toast.error(backendMessage, {
            description: hint,
            duration: 5000,
          });

          // Don't set authError - allow user to try again without blocking
          // Keep any existing calendar data if available
          return;
        }

        // Check for other 2FA errors
        const is2FAError =
          errorCode === '2FA_MANDATORY' ||
          (error.response?.status === 400 &&
            errorData?.message?.toLowerCase().includes('2fa'));

        if (is2FAError && !twoFACode) {
          // Should have been caught above, but handle just in case
          const code = await promptFor2FA();
          if (code) {
            await fetchCurrent(code);
            return;
          } else {
            setAuthError(
              '2FA code is required to view the ROS calendar. Please provide a valid 2FA code.'
            );
            setCurrentCalendar(null);
            toast.error('2FA code is required to view current calendar');
            return;
          }
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
    [promptFor2FA, getCached2FA, cache2FA]
  );

  const fetchHistory = useCallback(
    async (twoFACode?: string) => {
      try {
        setLoading(true);
        setAuthError(null); // Clear any previous auth errors
        const data = await rosApi.getAllCalendars(twoFACode);
        setCalendarHistory(data || []);
      } catch (error: any) {
        // Check for 2FA required FIRST - don't log this as an error
        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;

        // Handle 2FA_CODE_REQUIRED silently - this is expected on first request
        if (errorCode === '2FA_CODE_REQUIRED' && !twoFACode) {
          console.log(
            '[CalendarManagement] 2FA required for history, prompting for code...'
          );
          const code = await promptFor2FA();
          if (code) {
            // Retry with 2FA code - call the function directly
            return fetchHistory(code);
          } else {
            setAuthError(
              '2FA code is required to view calendar history. Please provide a valid 2FA code.'
            );
            setCalendarHistory([]);
            toast.error('2FA code is required to view calendar history');
            return;
          }
        }

        // Now handle actual errors
        console.error('Failed to fetch calendar history', error);

        // Handle 401 authentication errors
        if (error.response?.status === 401) {
          const errorData = error.response?.data;
          const errorCode = errorData?.error?.code;
          if (errorCode === 'INVALID_TOKEN') {
            toast.error('Your session has expired. Please log in again.');
            // Redirect will happen in rosApi.handleAuthError
            return;
          }
        }

        // Check for invalid 2FA code
        const isInvalid2FA =
          errorCode === '2FA_CODE_INVALID' ||
          (errorCode === '2FA_CODE_REQUIRED' && twoFACode);

        if (isInvalid2FA) {
          const errorMessage =
            'Invalid 2FA code. Please try again or contact support if the issue persists.';
          setAuthError(errorMessage);
          setCalendarHistory([]); // Clear any stale data
          toast.error('Invalid 2FA code. Please try again.');
          return;
        }

        // Check for other 2FA errors
        if (errorCode === '2FA_MANDATORY') {
          setAuthError(
            '2FA is mandatory for admin operations. Please set up 2FA first.'
          );
          setCalendarHistory([]);
          toast.error('2FA is mandatory for admin operations');
          return;
        }

        toast.error(error.message || 'Failed to fetch calendar history');
      } finally {
        setLoading(false);
      }
    },
    [promptFor2FA]
  );

  useEffect(() => {
    // Clear auth error when switching tabs to allow retry
    setAuthError(null);
    if (activeTab === 'current') fetchCurrent();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchCurrent, fetchHistory]);

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

      // Handle 401 authentication errors first
      if (error.response?.status === 401) {
        const errorData = error.response?.data;
        const errorCode = errorData?.error?.code;
        if (errorCode === 'INVALID_TOKEN') {
          toast.error('Your session has expired. Please log in again.');
          // Redirect will happen in rosApi.handleAuthError
          return;
        }
      }

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

            // Cache the 2FA code for future requests (25 seconds)
            cache2FA(twoFACode);

            toast.success('Calendar created successfully');
            setWeekStartDate('');

            // Auto-fetch current calendar using the cached 2FA code
            setActiveTab('current');
            try {
              await fetchCurrent(twoFACode);
            } catch {
              // Silently fail - user can manually refresh if needed
              console.log(
                '[CalendarManagement] Could not auto-fetch current calendar after creation'
              );
            }
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
            const backendMessage =
              retryError.response?.data?.error?.message ||
              'Invalid 2FA code. Please try again.';
            const hint =
              retryError.response?.data?.error?.hint ||
              "Make sure you're using the current code - they refresh every 30 seconds";

            // Show detailed error with hint - don't block, allow retry
            toast.error(backendMessage, {
              description: hint,
              duration: 5000,
            });

            // Don't set authError to block access - let user try again
            // The form is still available for retry
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

  // Show blocking error if authentication failed
  if (authError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            ROS Calendar Management
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <svg
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Authentication Required
                </h3>
                <p className="text-muted-foreground max-w-md">{authError}</p>
              </div>
              <Button
                onClick={() => {
                  setAuthError(null);
                  // Retry fetching data
                  if (activeTab === 'current') {
                    fetchCurrent();
                  } else if (activeTab === 'history') {
                    fetchHistory();
                  }
                }}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
