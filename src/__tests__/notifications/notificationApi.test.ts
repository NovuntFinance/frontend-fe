/**
 * Notification API Service Tests
 */

import axios, { type AxiosInstance } from 'axios';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  handleNotificationError,
} from '@/services/notificationApi';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createAxiosInstanceMock = (
  overrides: Partial<AxiosInstance>
): AxiosInstance => overrides as AxiosInstance;

describe('Notification API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [
            {
              _id: '123',
              notificationId: 'uuid-123',
              title: 'Test Notification',
              message: 'Test message',
              type: 'system',
              isRead: false,
              createdAt: '2024-01-15T10:00:00Z',
              user: 'user123',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
          unreadCount: 1,
        },
      };

      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          get: jest.fn().mockResolvedValue(mockResponse),
        })
      );

      const result = await getNotifications({ page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });

    it('should handle filters correctly', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
          unreadCount: 0,
        },
      };

      const mockGet = jest.fn().mockResolvedValue(mockResponse);
      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          get: mockGet,
        })
      );

      await getNotifications({
        page: 2,
        limit: 10,
        type: 'deposit',
        unreadOnly: true,
      });

      expect(mockGet).toHaveBeenCalledWith('', {
        params: {
          page: '2',
          limit: '10',
          type: 'deposit',
          unreadOnly: 'true',
        },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { unreadCount: 5 },
        },
      };

      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          get: jest.fn().mockResolvedValue(mockResponse),
        })
      );

      const count = await getUnreadCount();

      expect(count).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Notification marked as read',
        },
      };

      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          patch: jest.fn().mockResolvedValue(mockResponse),
        })
      );

      const result = await markAsRead('123');

      expect(result.success).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '5 notifications marked as read',
          updatedCount: 5,
        },
      };

      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          patch: jest.fn().mockResolvedValue(mockResponse),
        })
      );

      const result = await markAllAsRead();

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Notification deleted successfully',
        },
      };

      mockedAxios.create.mockReturnValue(
        createAxiosInstanceMock({
          delete: jest.fn().mockResolvedValue(mockResponse),
        })
      );

      const result = await deleteNotification('123');

      expect(result.success).toBe(true);
    });
  });

  describe('handleNotificationError', () => {
    it('should handle axios errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: 'API Error' },
        },
      };

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      const message = handleNotificationError(axiosError);

      expect(message).toBe('API Error');
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');

      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false);

      const message = handleNotificationError(error);

      expect(message).toBe('Generic error');
    });

    it('should handle unknown errors', () => {
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false);

      const message = handleNotificationError('unknown');

      expect(message).toBe('An unexpected error occurred');
    });
  });
});
