'use client';

import React, { useState, useEffect } from 'react';
import { rosApi, CalendarEntry } from '@/services/rosApi';
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
import { Loader2, Calendar as CalendarIcon, Save } from 'lucide-react';

export function CalendarManagement() {
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(false);

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

  const fetchCurrent = async () => {
    try {
      const data = await rosApi.getCurrentCalendar();
      setCurrentCalendar(data);
    } catch (error) {
      console.error('Failed to fetch current calendar', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await rosApi.getAllCalendars();
      setCalendarHistory(data);
    } catch (error) {
      console.error('Failed to fetch calendar history', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'current') fetchCurrent();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

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
    } catch (error) {
      console.error('Failed to create calendar', error);
      toast.error('Failed to create calendar');
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
              {currentCalendar ? (
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
                      value={weeklyTarget}
                      onChange={(e) =>
                        setWeeklyTarget(parseFloat(e.target.value))
                      }
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
                          value={(manualPercentages as any)[day]}
                          onChange={(e) =>
                            setManualPercentages((prev) => ({
                              ...prev,
                              [day]: parseFloat(e.target.value),
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
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
