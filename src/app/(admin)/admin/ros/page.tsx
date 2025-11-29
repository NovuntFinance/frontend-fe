'use client';

import React from 'react';
import { CalendarManagement } from '@/components/admin/ros/CalendarManagement';

export default function AdminROSPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ROS Management</h1>
          <p className="text-muted-foreground">
            Manage weekly Return on Staking (ROS) calendars and distribution.
          </p>
        </div>
      </div>

      <CalendarManagement />
    </div>
  );
}
