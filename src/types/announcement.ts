/**
 * Announcement Types
 * Types for platform announcements displayed in the information marquee
 */

export type AnnouncementType = 'info' | 'success' | 'warning' | 'promo';

export interface Announcement {
  id: string;
  text: string;
  type: AnnouncementType;
  icon?: string; // Optional: Icon name or emoji
  priority?: number; // For ordering (lower = higher priority)
  isActive: boolean; // Whether to display this announcement
  startDate?: string; // ISO date string - when to start showing
  endDate?: string; // ISO date string - when to stop showing
  targetAudience?: 'all' | 'new' | 'existing' | 'premium'; // Optional audience targeting
  linkUrl?: string; // Optional: URL to navigate when clicked
  linkText?: string; // Optional: Text for the link
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsResponse {
  success: boolean;
  data: Announcement[];
  timestamp: string;
}

export interface CreateAnnouncementPayload {
  text: string;
  type: AnnouncementType;
  icon?: string;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience?: 'all' | 'new' | 'existing' | 'premium';
  linkUrl?: string;
  linkText?: string;
}

export interface UpdateAnnouncementPayload
  extends Partial<CreateAnnouncementPayload> {
  id: string;
}
