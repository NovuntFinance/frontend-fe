/**
 * Announcements API Service
 * Handles fetching and managing platform announcements
 */

import { api } from '@/lib/api';
import type {
  Announcement,
  AnnouncementsResponse,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from '@/types/announcement';

class AnnouncementsApiService {
  private readonly BASE_PATH = '/announcements';

  /**
   * Get all active announcements
   * Returns only active announcements that are within their date range
   * Public endpoint - no authentication required
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get<AnnouncementsResponse>(
        `${this.BASE_PATH}/active`
      );
      // api.get returns response.data, so response is already AnnouncementsResponse
      // Check if response has the expected structure
      if (response && typeof response === 'object' && 'data' in response) {
        const announcementsResponse = response as AnnouncementsResponse;
        return Array.isArray(announcementsResponse.data)
          ? announcementsResponse.data
          : [];
      }
      // Fallback: if response is already an array
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      // Check for 404 - return empty array gracefully
      const status = error?.response?.status || error?.statusCode;
      const isNotFound = status === 404;

      // Only log non-404 errors in development
      if (!isNotFound && process.env.NODE_ENV === 'development') {
        console.warn('[AnnouncementsApi] Error fetching announcements:', {
          status,
          message: error?.message || 'Unknown error',
        });
      }

      // Always return empty array for graceful degradation
      return [];
    }
  }

  /**
   * Get all announcements (admin only)
   * Requires authentication
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await api.get<AnnouncementsResponse>(this.BASE_PATH);
      if (response && typeof response === 'object' && 'data' in response) {
        const announcementsResponse = response as AnnouncementsResponse;
        return Array.isArray(announcementsResponse.data)
          ? announcementsResponse.data
          : [];
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(
        '[AnnouncementsApi] Error fetching all announcements:',
        error
      );
      throw error;
    }
  }

  /**
   * Get a single announcement by ID (admin only)
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    try {
      const response = await api.get<{ success: boolean; data: Announcement }>(
        `${this.BASE_PATH}/${id}`
      );
      if (response && 'data' in response) {
        return response.data;
      }
      return response as Announcement;
    } catch (error) {
      console.error(
        `[AnnouncementsApi] Error fetching announcement ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new announcement (admin only)
   */
  async createAnnouncement(
    payload: CreateAnnouncementPayload
  ): Promise<Announcement> {
    try {
      const response = await api.post<{ success: boolean; data: Announcement }>(
        this.BASE_PATH,
        payload
      );
      if (response && 'data' in response) {
        return response.data;
      }
      return response as Announcement;
    } catch (error) {
      console.error('[AnnouncementsApi] Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Update an announcement (admin only)
   */
  async updateAnnouncement(
    payload: UpdateAnnouncementPayload
  ): Promise<Announcement> {
    try {
      const { id, ...updateData } = payload;
      const response = await api.patch<{
        success: boolean;
        data: Announcement;
      }>(`${this.BASE_PATH}/${id}`, updateData);
      if (response && 'data' in response) {
        return response.data;
      }
      return response as Announcement;
    } catch (error) {
      console.error(
        `[AnnouncementsApi] Error updating announcement ${payload.id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete an announcement (admin only)
   */
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(
        `[AnnouncementsApi] Error deleting announcement ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Toggle announcement active status (admin only)
   */
  async toggleAnnouncementStatus(
    id: string,
    isActive: boolean
  ): Promise<Announcement> {
    try {
      const response = await api.patch<{
        success: boolean;
        data: Announcement;
      }>(`${this.BASE_PATH}/${id}/toggle`, { isActive });
      if (response && 'data' in response) {
        return response.data;
      }
      return response as Announcement;
    } catch (error) {
      console.error(
        `[AnnouncementsApi] Error toggling announcement ${id}:`,
        error
      );
      throw error;
    }
  }
}

export const announcementsApi = new AnnouncementsApiService();
export default announcementsApi;
