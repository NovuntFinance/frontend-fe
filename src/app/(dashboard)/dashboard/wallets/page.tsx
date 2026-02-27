import { redirect } from 'next/navigation';

/**
 * Wallet is now a modal (triggered by the featured Wallet button).
 * Redirect any direct visit to /dashboard/wallets to the dashboard.
 */
export default function WalletPage() {
  redirect('/dashboard');
}
