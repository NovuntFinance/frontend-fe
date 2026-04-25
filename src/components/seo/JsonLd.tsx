const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novunt.com';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  // Serialize and escape </script> sequences to prevent script injection
  const safeJson = JSON.stringify(data).replace(/<\/script>/gi, '<\\/script>');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Novunt',
        url: BASE_URL,
        logo: `${BASE_URL}/icons/icon-maskable.svg`,
        description:
          'Novunt is a goal-based staking platform where users stake USDT to earn up to 200% returns through daily payouts, referral commissions, and performance pool rewards.',
        sameAs: [
          'https://www.facebook.com/share/16oLeHcQkH/',
          'https://www.instagram.com/novunt_hq',
          'https://www.tiktok.com/@novuntofficial',
          'https://youtube.com/@novunthq',
          'https://t.me/novunt',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: '', // Support is in-app only
          contactType: 'customer support',
          availableLanguage: 'English',
        },
      }}
    />
  );
}

export function WebApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Novunt',
        url: BASE_URL,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        description:
          'Stake USDT and earn up to 200% accumulated returns. Smart goal-based staking with daily payouts, referral rewards, performance pools, and a comprehensive achievement system.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free to create an account. Minimum stake: 20 USDT.',
        },
        featureList: [
          'Goal-based USDT staking with 200% return target',
          'Daily Return on Stake (ROS) payouts',
          'Two-wallet system (Deposit + Earnings)',
          'Free instant P2P transfers',
          'Five-level referral commission system',
          'Performance and Premium reward pools',
          'Six-rank progression system',
          'NXP achievement and badge system',
          'Live trading signals across forex, crypto, metals, commodities',
          'Two-factor authentication (2FA) security',
          'Real-time platform activity feed',
          'Dark and light theme support',
        ],
      }}
    />
  );
}

export function FAQPageJsonLd() {
  const faqs = [
    {
      question: 'What is Novunt?',
      answer:
        'Novunt is a goal-based staking platform where you deposit USDT, create stakes with personal financial goals, and earn daily returns (ROS) targeting 200% of your stake amount.',
    },
    {
      question: 'How does staking work on Novunt?',
      answer:
        'You deposit USDT via BEP20 into your Funded Wallet, create a stake (minimum $20), and earn daily Return on Stake (ROS) payouts until your stake reaches the 200% target. Your earnings go to your Earnings Wallet.',
    },
    {
      question: 'What is the minimum deposit on Novunt?',
      answer:
        'The minimum deposit is 20 USDT via the BEP20 (Binance Smart Chain) network.',
    },
    {
      question: 'Is Novunt free to use?',
      answer:
        'Creating an account is free. Small fees apply to deposits (network fee) and withdrawals (percentage fee). P2P transfers between Novunt users are completely free. Creating stakes has no fee.',
    },
    {
      question: 'How do referral commissions work?',
      answer:
        'Novunt has a 5-level referral system. Level 1: 5%, Level 2: 2%, Level 3: 1.5%, Level 4: 1%, Level 5: 0.5%. You earn commissions when your referrals create or earn from stakes.',
    },
    {
      question: 'What is the 10% registration bonus?',
      answer:
        'New users who complete five setup steps (email verification, 2FA setup, withdrawal address, social media verification, and first stake) receive a 10% bonus stake on their first qualifying deposit.',
    },
    {
      question: 'How long do withdrawals take?',
      answer:
        'Withdrawals require admin approval and are typically processed within 1-24 hours. A 72-hour security moratorium applies after changing your withdrawal address.',
    },
    {
      question: 'What currency does Novunt support?',
      answer:
        'Novunt exclusively supports USDT (Tether) on the BEP20 network (Binance Smart Chain).',
    },
  ];

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
