/**
 * Socket.io Hook for Live Support Real-Time Communication
 *
 * Handles: Connection setup, ticket rooms, typing indicators,
 * real-time message delivery, status/assignment updates.
 *
 * Path: /ws (NOT the default /socket.io)
 * Auth: userId + role sent via socket auth
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  SocketTicketNew,
  SocketTicketReply,
  SocketTicketStatusChanged,
  SocketTicketAssigned,
  SocketTyping,
} from '@/types/assistant';

// Socket.io server URL — same as API URL but without /api/v1
const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Strip /api/v1 suffix to get the base server URL for Socket.io
  return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
};

export interface SupportSocketEvents {
  onTicketNew?: (data: SocketTicketNew) => void;
  onTicketReply?: (data: SocketTicketReply) => void;
  onTicketUserReply?: (data: SocketTicketReply) => void;
  onTicketStatusChanged?: (data: SocketTicketStatusChanged) => void;
  onTicketAssigned?: (data: SocketTicketAssigned) => void;
  onAgentTyping?: (data: SocketTyping) => void;
  onAgentTypingStop?: (data: SocketTyping) => void;
  onUserTyping?: (data: SocketTyping) => void;
  onUserTypingStop?: (data: SocketTyping) => void;
}

export function useSupportSocket(
  userId: string | undefined,
  role: string | undefined,
  events?: SupportSocketEvents
) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (!userId) return;

    const socketUrl = getSocketUrl();
    if (!socketUrl) {
      console.warn('[SupportSocket] No socket URL configured');
      return;
    }

    const socket = io(socketUrl, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        userId,
        role: role || 'user',
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    // Connection lifecycle
    socket.on('connect', () => {
      console.log('[SupportSocket] Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SupportSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[SupportSocket] Connection error:', err.message);
      setIsConnected(false);
    });

    // ── Server → Client Events ────────────────────────────────────

    // New ticket created (agents only)
    socket.on('ticket:new', (data: SocketTicketNew) => {
      eventsRef.current?.onTicketNew?.(data);
    });

    // Reply on a ticket (user or agent)
    socket.on('ticket:reply', (data: SocketTicketReply) => {
      eventsRef.current?.onTicketReply?.(data);
    });

    // User replied (targeted to assigned agent)
    socket.on('ticket:userReply', (data: SocketTicketReply) => {
      eventsRef.current?.onTicketUserReply?.(data);
    });

    // Ticket status changed
    socket.on('ticket:statusChanged', (data: SocketTicketStatusChanged) => {
      eventsRef.current?.onTicketStatusChanged?.(data);
    });

    // Ticket assigned
    socket.on('ticket:assigned', (data: SocketTicketAssigned) => {
      eventsRef.current?.onTicketAssigned?.(data);
    });

    // Agent typing indicators (for user-side)
    socket.on('agent:typing', (data: SocketTyping) => {
      eventsRef.current?.onAgentTyping?.(data);
    });
    socket.on('agent:typingStop', (data: SocketTyping) => {
      eventsRef.current?.onAgentTypingStop?.(data);
    });

    // User typing indicators (for admin-side)
    socket.on('user:typing', (data: SocketTyping) => {
      eventsRef.current?.onUserTyping?.(data);
    });
    socket.on('user:typingStop', (data: SocketTyping) => {
      eventsRef.current?.onUserTypingStop?.(data);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, role]);

  // ── Client → Server Emitters ──────────────────────────────────────

  /** Join a ticket room to receive real-time updates */
  const joinTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit('ticket:join', ticketId);
  }, []);

  /** Leave a ticket room */
  const leaveTicket = useCallback((ticketId: string) => {
    socketRef.current?.emit('ticket:leave', ticketId);
  }, []);

  /** Signal that current user started typing */
  const startTyping = useCallback((ticketId: string) => {
    socketRef.current?.emit('typing:start', ticketId);
  }, []);

  /** Signal that current user stopped typing (debounce ~2s after last keystroke) */
  const stopTyping = useCallback((ticketId: string) => {
    socketRef.current?.emit('typing:stop', ticketId);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinTicket,
    leaveTicket,
    startTyping,
    stopTyping,
  };
}
