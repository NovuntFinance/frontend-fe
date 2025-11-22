import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/glassmorphism.css';
import { Providers } from '@/components/Providers';
import { PWARegister } from '@/components/pwa-register';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  title: 'Novunt - Goal-Based Staking Platform',
  description: 'Stake USDT and earn up to 200% returns. Join Novunt for smart staking with Performance and Premium Pool rewards.',
  applicationName: 'Novunt',
  manifest: '/manifest.json',
  keywords: ['staking', 'crypto', 'USDT', 'blockchain', 'earn', 'ROS', 'DeFi'],
  authors: [{ name: 'Novunt' }],
  creator: 'Novunt',
  publisher: 'Novunt',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Novunt',
    startupImage: [
      {
        url: '/icons/icon-maskable.svg',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://novunt.com',
    title: 'Novunt - Goal-Based Staking Platform',
    description: 'Stake USDT and earn up to 200% returns',
    siteName: 'Novunt',
    images: [
      {
        url: '/icons/novunt.png',
        width: 1200,
        height: 630,
        alt: 'Novunt Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Novunt - Goal-Based Staking Platform',
    description: 'Stake USDT and earn up to 200% returns',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
      <body suppressHydrationWarning={true} className="antialiased">
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
