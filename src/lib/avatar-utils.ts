/**
 * Avatar Utilities
 * Functions for generating and managing user avatars
 */

import type { User } from '@/types/user';

export type AvatarStyle = 'adventurer' | 'bottts' | 'big-smile';

// Available avatar styles (happy/friendly only)
export const AVATAR_STYLES: AvatarStyle[] = ['adventurer', 'bottts', 'big-smile'];

/**
 * Generate avatar URL from DiceBear API
 * @param style - Avatar style
 * @param seed - Unique seed for consistency
 * @returns DiceBear avatar URL
 */
export const generateAvatarUrl = (style: AvatarStyle, seed: string): string => {
  // Add mood parameters to ensure happy/friendly avatars
  const moodParams: Record<AvatarStyle, string> = {
    adventurer: 'mood=happy',
    'big-smile': 'mood=happy',
    bottts: 'eyes=happy',
  };
  
  const moodParam = moodParams[style] || '';
  const separator = moodParam ? '&' : '';
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${separator}${moodParam}`;
};

/**
 * Generate a random but consistent default avatar for a user
 * Uses user ID and email to ensure the same avatar is generated each time
 * @param user - User object (needs _id or id, and email)
 * @returns Consistent random avatar URL
 */
export const generateDefaultAvatar = (user: Partial<User> | { _id?: string; id?: string; email: string }): string => {
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
 * Get user avatar URL
 * Returns user's custom avatar if set, otherwise returns null
 * Users must set their own avatar - no random avatars are generated
 * @param user - User object
 * @returns Avatar URL or null if no avatar is set
 */
export const getUserAvatarUrl = (user: Partial<User> | null): string | null => {
  if (!user) {
    return null;
  }
  
  // Only return avatar if user has explicitly set one
  // Do NOT generate random avatars - users must choose their own
  if (user.avatar) {
    return user.avatar;
  }
  
  // Return null if no avatar is set - components should show initials instead
  return null;
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

