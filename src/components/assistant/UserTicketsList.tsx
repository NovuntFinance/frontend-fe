/**
 * User Tickets List — Mini ticket view inside the Nova chat widget
 *
 * Shows the user's support tickets with status badges,
 * inline ticket detail view with message thread + reply,
 * and Socket.io real-time updates.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Plus,
  ChevronLeft,
  Send,
  Ticket,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getMyTickets,
  getTicketDetail,
  replyToTicket,
} from '@/services/assistantApi';
import { useSupportSocket } from '@/hooks/useSupportSocket';
import { useUser } from '@/hooks/useUser';
import type {
  TicketListItem,
  TicketDetail,
  TicketStatus,
  TicketMessage,
} from '@/types/assistant';

// Status config
const statusConfig: Record<
  TicketStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    icon: <Clock className="h-3 w-3" />,
  },
  in_progress: {
    label: 'In Progress',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    icon: <Loader2 className="h-3 w-3" />,
  },
  resolved: {
    label: 'Resolved',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    icon: <CheckCircle className="h-3 w-3" />,
  },
};

interface UserTicketsListProps {
  onCreateTicket: () => void;
  conversationId: string | null;
}

export function UserTicketsList({ onCreateTicket }: UserTicketsListProps) {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyTickets({ limit: 20 });
      if (res?.success && res.data?.tickets) {
        setTickets(res.data.tickets);
      }
    } catch {
      // Silent fail — empty state will show
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (ticketId: string) => {
    setDetailLoading(true);
    try {
      const res = await getTicketDetail(ticketId);
      if (res?.success && res.data) {
        setSelectedTicket(res.data);
      }
    } catch {
      // show nothing
    } finally {
      setDetailLoading(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <TicketDetailView
        ticket={selectedTicket}
        onBack={() => {
          setSelectedTicket(null);
          loadTickets(); // refresh list
        }}
        onUpdate={(updated) => setSelectedTicket(updated)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-3">
        <h4 className="text-xs font-semibold">My Support Tickets</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCreateTicket}
          className="h-7 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" />
          New
        </Button>
      </div>

      {/* List */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-muted-foreground mb-2 h-6 w-6 animate-spin" />
            <p className="text-muted-foreground text-xs">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm font-medium">
              No tickets yet
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Create a ticket when you need human support
            </p>
            <Button
              size="sm"
              onClick={onCreateTicket}
              className="mt-3 gap-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-xs"
            >
              <Plus className="h-3 w-3" />
              Create Ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const cfg = statusConfig[ticket.status] || statusConfig.submitted;
              return (
                <motion.button
                  key={ticket.ticketId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openTicket(ticket.ticketId)}
                  className="w-full rounded-lg border border-white/10 bg-white/50 p-3 text-left transition-colors hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-xs font-medium">
                      {ticket.subject}
                    </p>
                    <span
                      className={cn(
                        'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        cfg.color
                      )}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px]">
                      #{ticket.ticketId}
                    </span>
                    <span className="text-muted-foreground text-[10px]">·</span>
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.messageCount > 0 && (
                      <>
                        <span className="text-muted-foreground text-[10px]">
                          ·
                        </span>
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                          <MessageSquare className="h-2.5 w-2.5" />
                          {ticket.messageCount}
                        </span>
                      </>
                    )}
                  </div>
                  {ticket.lastMessage && (
                    <p className="text-muted-foreground mt-1.5 line-clamp-1 text-[10px]">
                      {ticket.lastMessage.from === 'support'
                        ? '⟵ Support: '
                        : 'You: '}
                      {ticket.lastMessage.content}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ticket Detail View (inline) ─────────────────────────────────────
function TicketDetailView({
  ticket,
  onBack,
  onUpdate,
}: {
  ticket: TicketDetail;
  onBack: () => void;
  onUpdate: (ticket: TicketDetail) => void;
}) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const isOpen =
    ticket.status === 'submitted' || ticket.status === 'in_progress';

  // Socket.io for real-time updates
  const { joinTicket, leaveTicket } = useSupportSocket(
    user?._id || user?.id,
    'user',
    {
      onTicketReply: (data) => {
        if (data.ticketId === ticket.ticketId) {
          onUpdate({
            ...ticket,
            messages: [...ticket.messages, data.message],
          });
        }
      },
      onTicketStatusChanged: (data) => {
        if (data.ticketId === ticket.ticketId) {
          onUpdate({ ...ticket, status: data.status });
        }
      },
    }
  );

  // Join socket room
  useEffect(() => {
    joinTicket(ticket.ticketId);
    return () => leaveTicket(ticket.ticketId);
  }, [ticket.ticketId, joinTicket, leaveTicket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      const res = await replyToTicket(ticket.ticketId, replyText.trim());
      if (res?.success && res.data?.message) {
        onUpdate({
          ...ticket,
          messages: [...ticket.messages, res.data.message],
          status: res.data.status || ticket.status,
        });
        setReplyText('');
      }
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const cfg = statusConfig[ticket.status] || statusConfig.submitted;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-3">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 text-[10px] transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to tickets
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold">{ticket.subject}</p>
            <p className="text-muted-foreground text-[10px]">
              #{ticket.ticketId}
            </p>
          </div>
          <span
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
              cfg.color
            )}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Messages thread */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {/* Description as first message */}
          {ticket.description && (
            <div className="bg-muted/30 rounded-lg p-2.5">
              <p className="text-muted-foreground mb-1 text-[10px] font-medium">
                Original description
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}

          {ticket.messages.map((msg, i) => (
            <TicketMessageBubble key={i} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply input */}
      {isOpen && (
        <div className="border-t border-white/10 p-3">
          <div className="flex gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Type a reply..."
              disabled={sending}
              className="flex-1 text-xs"
            />
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sending}
              size="icon"
              className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="border-t border-white/10 p-3 text-center">
          <p className="text-muted-foreground text-[10px]">
            This ticket is{' '}
            {ticket.status === 'resolved' ? 'resolved' : 'closed'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Single ticket message bubble ────────────────────────────────────
function TicketMessageBubble({ message }: { message: TicketMessage }) {
  const isSupport = message.from === 'support';
  return (
    <div
      className={cn('flex gap-2', isSupport ? 'justify-start' : 'justify-end')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm',
          isSupport
            ? 'bg-muted/50 text-foreground'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        )}
      >
        {isSupport && message.senderName && (
          <p className="mb-0.5 text-[10px] font-semibold opacity-70">
            {message.senderName}
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-[9px] opacity-50',
            isSupport ? 'text-left' : 'text-right'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
