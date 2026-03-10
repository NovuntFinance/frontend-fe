import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/glassmorphism.css';
import { Providers } from '@/components/Providers';
import { PWARegister } from '@/components/pwa-register';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import {
  OrganizationJsonLd,
  WebApplicationJsonLd,
  FAQPageJsonLd,
} from '@/components/seo/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novunt.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default:
      'Novunt – Stake USDT & Earn Up to 200% Returns | Smart Goal Staking Platform',
    template: '%s | Novunt',
  },
  description:
    'Novunt is a goal-based staking platform. Stake USDT on BEP20 and earn up to 200% accumulated returns through daily ROS payouts. Join for free, get a 10% welcome bonus, build your team with 5-level referral commissions, and access Performance & Premium reward pools.',
  applicationName: 'Novunt',
  manifest: '/manifest.json',
  keywords: [
    'Novunt',
    'USDT staking',
    'stake USDT',
    'earn USDT',
    'crypto staking platform',
    'goal-based staking',
    'smart staking',
    'return on stake',
    'ROS',
    '200% returns',
    'daily crypto returns',
    'passive income crypto',
    'earn passive income',
    'make money online',
    'crypto investment platform',
    'USDT investment',
    'stablecoin staking',
    'BEP20 staking',
    'Binance Smart Chain',
    'crypto earnings',
    'referral commissions',
    'performance pool',
    'premium pool',
    'crypto rewards',
    'financial goals',
    'wealth building platform',
    'digital asset staking',
    'P2P crypto transfers',
    'free crypto transfers',
    'trading signals',
    'forex signals',
    'crypto signals',
    'NXP tokens',
    'staking streak',
    'rank system',
    'team building crypto',
    'crypto referral program',
    'registration bonus',
    'welcome bonus crypto',
    '10% bonus',
    'money making platform',
    'online investment',
    'grow your money',
    'compound earnings',
    'staking rewards',
  ],
  authors: [{ name: 'Novunt', url: BASE_URL }],
  creator: 'Novunt',
  publisher: 'Novunt',
  formatDetection: { telephone: false },
  category: 'finance',
  classification: 'Finance, Investment, Cryptocurrency, Staking',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Novunt',
    startupImage: [
      {
        url: '/icons/icon-maskable.svg',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    title: 'Novunt – Stake USDT & Earn Up to 200% Returns',
    description:
      'Join Novunt to stake USDT and earn up to 200% accumulated returns. Daily payouts, 10% welcome bonus, 5-level referral commissions, Performance & Premium pools. Free to join.',
    siteName: 'Novunt',
    images: [
      {
        url: '/icons/icon-maskable.svg',
        width: 1200,
        height: 630,
        alt: 'Novunt – Smart Goal Staking Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Novunt – Stake USDT & Earn Up to 200% Returns',
    description:
      'Goal-based USDT staking with daily payouts, 10% welcome bonus, referral commissions, and Performance & Premium pool rewards. Join free.',
    images: ['/icons/icon-maskable.svg'],
  },
  alternates: {
    canonical: BASE_URL,
  },
  other: {
    'msapplication-TileColor': '#4f46e5',
    'apple-mobile-web-app-title': 'Novunt',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#312e81' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebApplicationJsonLd />
        <FAQPageJsonLd />
      </head>
      <body suppressHydrationWarning={true} className="antialiased">
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1600] focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <PWARegister />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
