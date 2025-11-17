/**
 * Admin Root Page
 * Redirects to /admin/overview as the default admin page
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  // Redirect to overview page
  redirect('/admin/overview');
}
