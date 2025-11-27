/**
 * NotificationItem Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import type { Notification } from '@/types/notification';

const mockNotification: Notification = {
  _id: '123',
  notificationId: 'uuid-123',
  user: 'user123',
  title: 'Test Notification',
  message: 'This is a test notification message',
  type: 'system',
  isRead: false,
  createdAt: new Date().toISOString(),
  readAt: null,
};

describe('NotificationItem', () => {
  const mockOnMarkAsRead = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification correctly', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test notification message')
    ).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows unread indicator for unread notifications', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByLabelText('Unread')).toBeInTheDocument();
  });

  it('does not show unread indicator for read notifications', () => {
    const readNotification = { ...mockNotification, isRead: true };

    render(
      <NotificationItem
        notification={readNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();
  });

  it('calls onMarkAsRead when clicking unread notification', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('123');
  });

  it('calls onClick when provided', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalledWith(mockNotification);
  });

  it('calls onDelete when clicking delete button', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Delete notification');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('123');
  });

  it('renders CTA button when metadata.ctaUrl is present', () => {
    const notificationWithCTA = {
      ...mockNotification,
      metadata: {
        ctaUrl: '/test-url',
        ctaText: 'View Details',
      },
    };

    render(
      <NotificationItem
        notification={notificationWithCTA}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('hides delete button when showDelete is false', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        showDelete={false}
      />
    );

    expect(
      screen.queryByLabelText('Delete notification')
    ).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <NotificationItem
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        onDelete={mockOnDelete}
        onClick={mockOnClick}
      />
    );

    const notificationElement = screen.getByRole('button');

    fireEvent.keyDown(notificationElement, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(notificationElement, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
});
