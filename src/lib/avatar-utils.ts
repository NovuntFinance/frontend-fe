/**
 * Avatar Utilities
 * Functions for generating and managing user avatars
 */

import type { User } from '@/types/user';

// Beautiful avatar styles - happy, friendly, and professional
export type AvatarStyle = 'lorelei' | 'notionists' | 'fun-emoji';

// Available avatar styles (beautiful and friendly only)
export const AVATAR_STYLES: AvatarStyle[] = [
  'lorelei',
  'notionists',
  'fun-emoji',
];

/**
 * Generate avatar URL from DiceBear API
 * @param style - Avatar style
 * @param seed - Unique seed for consistency
 * @returns DiceBear avatar URL
 */
export const generateAvatarUrl = (style: AvatarStyle, seed: string): string => {
  // All selected styles are naturally happy/friendly, no mood params needed
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

/**
 * Generate a random but consistent default avatar for a user
 * Uses user ID and email to ensure the same avatar is generated each time
 * @param user - User object (needs _id or id, and email)
 * @returns Consistent random avatar URL
 */
export const generateDefaultAvatar = (
  user: Partial<User> | { _id?: string; id?: string; email: string }
): string => {
  const userWithId = user as { _id?: string; id?: string; email: string };
  const userId = user._id || userWithId.id || 'default';
  const email = user.email || 'user';

  // Use user ID and email to create a consistent seed
  const seed = `${email}-${userId}`;

  // Generate a number from the seed to pick a style
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Pick one of the 3 styles based on hash
  const styleIndex = Math.abs(hash) % AVATAR_STYLES.length;
  const style = AVATAR_STYLES[styleIndex];

  return generateAvatarUrl(style, seed);
};

/**
 * Check if avatar is a badge icon (emoji)
 * @param avatar - Avatar string
 * @returns True if avatar is an emoji/badge icon
 */
export const isBadgeIcon = (avatar: string | null | undefined): boolean => {
  if (!avatar) return false;

  // Check if it's a single emoji or badge icon (not a URL)
  // Emojis are typically 1-2 characters, but some can be longer
  // URLs contain http:// or https:// or data: or / (path)
  const isUrl = /^(https?:\/\/|data:|\.|\/)/.test(avatar.trim());

  // If it's not a URL and is short (likely emoji), treat as badge icon
  return !isUrl && avatar.trim().length <= 10;
};

/**
 * Get badge icon from avatar string
 * @param avatar - Avatar string that contains badge icon
 * @returns Badge icon emoji or null
 */
export const getBadgeIcon = (
  avatar: string | null | undefined
): string | null => {
  if (!avatar || !isBadgeIcon(avatar)) return null;
  return avatar.trim();
};

/**
 * Get user avatar URL
 * Returns user's custom avatar if set, otherwise generates a random avatar
 * @param user - User object
 * @returns Avatar URL (never returns null - always returns an avatar)
 */
export const getUserAvatarUrl = (user: Partial<User> | null): string | null => {
  if (!user) {
    return null;
  }

  // Return user's custom avatar if they have one
  if (user.avatar) {
    // If it's a badge icon, return it as-is (will be handled by display component)
    if (isBadgeIcon(user.avatar)) {
      return user.avatar;
    }
    return user.avatar;
  }

  // Generate a beautiful random avatar based on user's email and ID
  // This ensures users always have a nice avatar, even if they haven't set one
  return generateDefaultAvatar(user);
};

/**
 * Get user initials for fallback display
 * @param user - User object
 * @returns User initials (e.g., "JD")
 */
export const getUserInitials = (user: Partial<User> | null): string => {
  if (!user) return '?';

  const firstName = user.firstName || user.fname || '';
  const lastName = user.lastName || user.lname || '';

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  const userWithUsername = user as { username?: string };
  if (userWithUsername.username) {
    return (userWithUsername.username[0] || '?').toUpperCase();
  }

  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return '?';
};

/**
 * Preload avatar image
 * @param url - Avatar URL to preload
 */
export const preloadAvatar = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};
