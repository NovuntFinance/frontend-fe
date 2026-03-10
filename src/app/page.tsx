import type { Metadata } from 'next';
import OnboardingPage from '@/components/onboarding/OnboardingPage';

export const metadata: Metadata = {
  title:
    'Novunt – Stake USDT & Earn Up to 200% Returns | Smart Goal Staking Platform',
  description:
    'Novunt is the leading goal-based USDT staking platform. Stake as little as $20, earn daily returns targeting 200%, get a 10% welcome bonus, and build passive income with 5-level referral commissions. Free P2P transfers, Performance & Premium reward pools, live trading signals, and more. Join thousands growing their wealth with Novunt.',
  openGraph: {
    title: 'Novunt – Stake USDT & Earn Up to 200% Returns',
    description:
      'Join Novunt to stake USDT and earn up to 200% accumulated returns. Daily payouts, 10% welcome bonus, 5-level referral commissions, Performance & Premium pools. Free to join.',
    url: '/',
  },
  twitter: {
    title: 'Novunt – Stake USDT & Earn Up to 200% Returns',
    description:
      'Goal-based USDT staking with daily payouts. 10% welcome bonus, referral commissions, and reward pools. Start with just $20.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootPage() {
  return <OnboardingPage />;
}
