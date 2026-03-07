'use client';

import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const socialLinks = [
  {
    name: 'Facebook',
    icon: FaFacebook,
    href: 'https://www.facebook.com/share/16oLeHcQkH/',
  },
  {
    name: 'Instagram',
    icon: FaInstagram,
    href: 'https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5',
  },
  {
    name: 'TikTok',
    icon: SiTiktok,
    href: 'https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1',
  },
  {
    name: 'YouTube',
    icon: FaYoutube,
    href: 'https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4',
  },
  { name: 'Telegram', icon: FaTelegram, href: 'https://t.me/novunt' },
];

const footerLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Support', href: '/support' },
];

export function DashboardFooter() {
  return (
    <footer
      className="dashboard-footer fixed right-0 left-0 z-40 lg:left-[72px]"
      style={{
        background: 'var(--neu-bg)',
        borderTop: '1px solid var(--neu-border)',
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 sm:px-6">
        {/* Left: Brand + copyright */}
        <div className="flex items-center gap-2">
          <div
            role="img"
            aria-label="Novunt logo"
            className="h-4 w-4"
            style={{
              backgroundColor: 'var(--neu-accent)',
              maskImage: 'url(/icons/novunt_short.png)',
              WebkitMaskImage: 'url(/icons/novunt_short.png)',
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              opacity: 0.9,
            }}
          />
          <span
            className="text-[10px] leading-none sm:text-xs"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            © {new Date().getFullYear()} Novunt
          </span>
          <span
            className="hidden text-[10px] leading-none italic sm:inline sm:text-xs"
            style={{ color: 'var(--neu-text-secondary)', opacity: 0.6 }}
          >
            — No limits to value, net worth and growth.
          </span>
        </div>

        {/* Center-right: Nav links */}
        <div className="flex items-center gap-3 sm:gap-4">
          {footerLinks.map((link, i) => (
            <React.Fragment key={link.label}>
              {i > 0 && (
                <span
                  className="text-[8px]"
                  style={{ color: 'var(--neu-border)' }}
                >
                  |
                </span>
              )}
              <a
                href={link.href}
                className="text-[10px] transition-colors hover:underline sm:text-xs"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                {link.label}
              </a>
            </React.Fragment>
          ))}
        </div>

        {/* Right: Social icons */}
        <div className="flex items-center gap-2.5">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all hover:scale-110 active:scale-95"
                aria-label={social.name}
              >
                <Icon
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                  style={{ color: 'var(--neu-accent)' }}
                />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
