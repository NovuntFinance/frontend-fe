'use client';

import React from 'react';
import Link from 'next/link';
import { PLATFORM_CONFIG } from '@/config/socialMediaIcons';
import { SocialMediaPlatform } from '@/types/registrationBonus';

/**
 * Dashboard Footer Component
 * Global footer with social media links, copyright, and legal links
 */
export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    SocialMediaPlatform.FACEBOOK,
    SocialMediaPlatform.INSTAGRAM,
    SocialMediaPlatform.YOUTUBE,
    SocialMediaPlatform.TIKTOK,
    SocialMediaPlatform.TELEGRAM,
  ];

  return (
    <footer
      className="mt-12 border-t py-4 md:py-5"
      style={{
        borderColor: 'var(--neu-border)',
        background: 'var(--neu-bg)',
      }}
    >
      <div className="dashboard-page-container">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Social Media Links */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((platform) => {
                const config = PLATFORM_CONFIG[platform];
                const Icon = config.icon;
                return (
                  <a
                    key={platform}
                    href={config.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                      background: 'var(--neu-surface)',
                      border: '1px solid var(--neu-border)',
                    }}
                    aria-label={`Visit our ${config.name} page`}
                  >
                    <Icon
                      className="h-5 w-5 transition-colors duration-200 group-hover:opacity-80"
                      style={{ color: 'var(--neu-accent)' }}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Legal Links & Copyright */}
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
              <Link
                href="/terms"
                className="text-sm transition-colors duration-200 hover:underline"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy"
                className="text-sm transition-colors duration-200 hover:underline"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Privacy Policy
              </Link>
            </div>

            {/* Copyright */}
            <div
              className="text-center text-sm lg:text-right"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              © {currentYear} Novunt. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
