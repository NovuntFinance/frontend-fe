/**
 * Distribution Schedule Settings Page
 *
 * Route: /admin/settings/distribution-schedule
 *
 * This page allows admins to configure the multi-slot distribution schedule.
 * Admins can:
 * - Select timezone from 60+ options
 * - Configure 1-10 distribution slots per day
 * - Set precise time (HH:MM:SS) for each slot
 * - Enable/disable schedules
 * - Preview next execution times
 *
 * Requires: Admin role + settings.update permission
 */

import { CronSettingsPage } from '@/components/admin/cronSettings';

export default function DistributionSchedulePage() {
  return <CronSettingsPage />;
}

export const metadata = {
  title: 'Distribution Schedule | Admin',
  description: 'Configure multi-slot distribution schedules',
};
