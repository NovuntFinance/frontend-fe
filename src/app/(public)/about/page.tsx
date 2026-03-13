import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Novunt – Goal-Based USDT Staking Platform',
  description:
    'Learn about Novunt, the smart goal-based staking platform where you stake USDT and earn up to 200% accumulated returns. Daily payouts, referral commissions, reward pools, and more.',
  openGraph: {
    title: 'About Novunt – Goal-Based USDT Staking Platform',
    description:
      'Learn about Novunt, the smart goal-based staking platform. Stake USDT, earn daily returns, and build your wealth with a community-driven approach.',
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="prose prose-invert max-w-3xl space-y-6">
      <h1>About Novunt</h1>

      <p>
        Novunt is a modern, goal-based staking platform that empowers users to
        grow their digital assets through transparent, structured returns. Built
        for both beginners and experienced users, Novunt makes it simple to
        stake USDT and earn up to <strong>200% accumulated returns</strong>{' '}
        through daily payouts.
      </p>

      <h2>Our Mission</h2>
      <p>
        We believe everyone should have access to tools that help them build
        wealth. Novunt combines cutting-edge technology with user-friendly
        design to create a platform where your money works for you — whether you
        are saving for a home, building an emergency fund, planning a vacation,
        or growing long-term wealth.
      </p>

      <h2>How Novunt Works</h2>
      <ul>
        <li>
          <strong>Deposit USDT</strong> — Fund your wallet via the BEP20
          (Binance Smart Chain) network. Minimum deposit: just $20.
        </li>
        <li>
          <strong>Create Goal-Based Stakes</strong> — Tag each stake with a
          personal financial goal (housing, education, travel, retirement, and
          more). Track your progress visually.
        </li>
        <li>
          <strong>Earn Daily Returns</strong> — Your stakes earn daily Return on
          Stake (ROS), distributed to your Earnings Wallet until the 200% target
          is reached.
        </li>
        <li>
          <strong>Withdraw or Re-stake</strong> — Withdraw your earnings to your
          external BEP20 wallet, or compound your growth by re-staking.
        </li>
      </ul>

      <h2>Key Features</h2>
      <ul>
        <li>
          <strong>Two-Wallet System</strong> — A Funded Wallet for deposits and
          staking, and an Earnings Wallet for returns and withdrawals.
          Separation keeps your finances organized and secure.
        </li>
        <li>
          <strong>10% Welcome Bonus</strong> — New users who complete five
          simple setup steps receive a 10% bonus on their first stake.
        </li>
        <li>
          <strong>5-Level Referral Program</strong> — Earn commissions across
          five levels of referrals (5%, 2%, 1.5%, 1%, 0.5%) when your network
          stakes.
        </li>
        <li>
          <strong>Performance &amp; Premium Pools</strong> — Qualified
          higher-rank members receive additional earnings from shared reward
          pools.
        </li>
        <li>
          <strong>Six-Rank Progression</strong> — From Stakeholder to Finance
          Titan, climb the ranks by growing your personal stake and building an
          active team.
        </li>
        <li>
          <strong>Live Trading Signals</strong> — Verified signals across forex,
          crypto, metals, and commodities markets for full transparency.
        </li>
        <li>
          <strong>Free P2P Transfers</strong> — Send USDT to other Novunt users
          instantly with zero fees.
        </li>
        <li>
          <strong>Achievement &amp; NXP System</strong> — Earn Novunt Experience
          Points and badges for platform activity. NXP will convert to Novunt
          Loyalty Points (NLP) with exclusive future benefits.
        </li>
      </ul>

      <h2>Security First</h2>
      <p>
        Your security is our top priority. Novunt includes two-factor
        authentication (2FA), email OTP verification for sensitive actions,
        withdrawal address whitelisting with a 72-hour moratorium on changes,
        and comprehensive activity monitoring. We never store more personal data
        than necessary — just your name, username, and email.
      </p>

      <h2>Built for Everyone</h2>
      <p>
        Whether you are new to digital assets or an experienced investor, Novunt
        is designed to be intuitive and accessible. Our platform supports light
        and dark themes, works on any device, and includes a comprehensive
        Knowledge Base and AI-powered assistant (Nova) to help you every step of
        the way.
      </p>

      <h2>Get Started</h2>
      <p>
        Ready to start growing your wealth? Creating an account is free and
        takes just a few minutes. Make your first deposit, create your first
        goal-based stake, and start earning daily returns today.
      </p>
      <p>Questions? Reach us via the Support section in the app.</p>
    </div>
  );
}
