/**
 * Social Media Icons Configuration
 * Centralized configuration for social media platform icons
 * 
 * Note: This file imports React components (react-icons) and should only be imported
 * in client components (components marked with 'use client').
 */

import { IconType } from 'react-icons';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { SocialMediaPlatform } from '@/types/registrationBonus';

export interface PlatformConfig {
  name: string;
  icon: IconType;
  url: string;
  color: string;
}

export const PLATFORM_CONFIG: Record<SocialMediaPlatform, PlatformConfig> = {
  [SocialMediaPlatform.FACEBOOK]: {
    name: 'Facebook',
    icon: FaFacebook,
    url: 'https://www.facebook.com/share/16oLeHcQkH/',
    color: 'blue',
  },
  [SocialMediaPlatform.INSTAGRAM]: {
    name: 'Instagram',
    icon: FaInstagram,
    url: 'https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5',
    color: 'pink',
  },
  [SocialMediaPlatform.YOUTUBE]: {
    name: 'YouTube',
    icon: FaYoutube,
    url: 'https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4',
    color: 'red',
  },
  [SocialMediaPlatform.TIKTOK]: {
    name: 'TikTok',
    icon: SiTiktok,
    url: 'https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1',
    color: 'black',
  },
  [SocialMediaPlatform.TELEGRAM]: {
    name: 'Telegram',
    icon: FaTelegram,
    url: 'https://t.me/novunt',
    color: 'blue',
  },
};

