/**
 * Admin Ticket Detail — Full ticket view with live chat
 *
 * Features:
 *   - Ticket metadata (status, priority, category, assigned agent)
 *   - Full message thread with admin reply
 *   - Status / priority / assignment controls
 *   - Socket.io real-time updates (new messages, status changes)
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, Send, User, Shield, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import {
  getAdminTicketDetail,
  adminReplyToTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  getAdminSupportAgents,
} from '@/services/assistantApi';
import { useSupportSocket } from '@/hooks/useSupportSocket';
import { useAuthStore } from '@/store/authStore';
import type {
  AdminTicket,
  TicketStatus,
  TicketPriority,
  TicketMessage,
} from '@/types/assistant';

// Badge configs — used for status/priority display
const _statusStyles: Record<string, { label: string; color: string }> = {
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  in_progress: {
    label: 'In Progress',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  resolved: {
    label: 'Resolved',
    color:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};
void _statusStyles;

const _priorityStyles: Record<string, { label: string; color: string }> = {
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  high: {
    label: 'High',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};
void _priorityStyles;

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: adminUser } = useAuthStore();
  const ticketId = params?.ticketId as string;

  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [updatingAssign, setUpdatingAssign] = useState(false);
  const [agents, setAgents] = useState<
    Array<{ _id: string; displayName: string }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket.io
  const { joinTicket, leaveTicket } = useSupportSocket(
    adminUser?._id || adminUser?.id,
    'admin',
    {
      onTicketReply: (data) => {
        if (data.ticketId === ticketId && ticket) {
          setTicket((prev) =>
            prev
              ? { ...prev, messages: [...prev.messages, data.message] }
              : prev
          );
        }
      },
      onTicketUserReply: (data) => {
        if (data.ticketId === ticketId && ticket) {
          setTicket((prev) =>
            prev
              ? { ...prev, messages: [...prev.messages, data.message] }
              : prev
          );
        }
      },
      onTicketStatusChanged: (data) => {
        if (data.ticketId === ticketId) {
          setTicket((prev) => (prev ? { ...prev, status: data.status } : prev));
        }
      },
      onTicketAssigned: (data) => {
        if (data.ticketId === ticketId) {
          loadTicket();
        }
      },
    }
  );

  // Load ticket
  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await getAdminTicketDetail(ticketId);
      if (res?.success && res.data) {
        // Handle both { ticket: AdminTicket } and AdminTicket directly
        const ticketData =
          (res.data as { ticket?: AdminTicket }).ticket ||
          (res.data as unknown as AdminTicket);
        if (ticketData && ('ticketId' in ticketData || '_id' in ticketData)) {
          setTicket(ticketData);
        }
      }
    } catch {
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  useEffect(() => {
    getAdminSupportAgents()
      .then((res) => {
        if (res?.success && res.data?.agents) {
          setAgents(
            res.data.agents.map((a) => ({
              _id: a._id,
              displayName:
                a.displayName ||
                `${a.fname || ''} ${a.lname || ''}`.trim() ||
                a.username ||
                a.email,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Join socket room
  useEffect(() => {
    if (ticketId) {
      joinTicket(ticketId);
      return () => {
        leaveTicket(ticketId);
      };
    }
    return undefined;
  }, [ticketId, joinTicket, leaveTicket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending || !ticketId) return;
    setSending(true);
    try {
      const res = await adminReplyToTicket(ticketId, replyText.trim());
      if (res?.success) {
        // Optimistic update — socket will also fire but this covers immediate UI
        const newMsg: TicketMessage = {
          from: 'support',
          content: replyText.trim(),
          timestamp: new Date().toISOString(),
          senderName: 'Support Agent',
        };
        setTicket((prev) =>
          prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
        );
        setReplyText('');
        toast.success('Reply sent');
      }
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticketId) return;
    setUpdatingStatus(true);
    try {
      const res = await updateTicketStatus(ticketId, status);
      if (res?.success) {
        setTicket((prev) => (prev ? { ...prev, status } : prev));
        toast.success(`Status updated to ${status.replace('_', ' ')}`);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticketId) return;
    setUpdatingPriority(true);
    try {
      const res = await updateTicketPriority(ticketId, priority);
      if (res?.success) {
        setTicket((prev) => (prev ? { ...prev, priority } : prev));
        toast.success(`Priority updated to ${priority}`);
      }
    } catch {
      toast.error('Failed to update priority');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAssignChange = async (agentId: string) => {
    if (!ticketId) return;
    setUpdatingAssign(true);
    try {
      const res = await assignTicket(ticketId, agentId);
      if (res?.success && res.data) {
        const updated = (res.data as { ticket?: AdminTicket }).ticket;
        if (updated) {
          setTicket((prev) =>
            prev ? { ...prev, assignedTo: updated.assignedTo } : prev
          );
        }
        toast.success(agentId ? 'Ticket assigned' : 'Assignment cleared');
      }
    } catch {
      toast.error('Failed to assign ticket');
    } finally {
      setUpdatingAssign(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/support')}
          className="mt-4"
        >
          Back to Support Dashboard
        </Button>
      </div>
    );
  }

  const isOpen =
    ticket.status === 'submitted' || ticket.status === 'in_progress';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/admin/support')}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Support Dashboard
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message Thread (2/3) */}
        <div className="lg:col-span-2">
          <Card className="flex h-[calc(100vh-220px)] flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{ticket.subject}</CardTitle>
              <p className="text-muted-foreground text-xs">
                #{ticket.ticketId}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              {/* Messages */}
              <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Description */}
                  {ticket.description && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-muted-foreground mb-1 text-[10px] font-medium">
                        Original ticket description
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>
                  )}

                  {ticket.messages.map((msg, i) => {
                    const isSupport = msg.from === 'support';
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex gap-2.5',
                          isSupport ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {!isSupport && (
                          <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                            <User className="text-muted-foreground h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                            isSupport
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                              : 'bg-muted/50 text-foreground'
                          )}
                        >
                          {isSupport && msg.senderName && (
                            <p className="mb-0.5 text-[10px] font-semibold opacity-70">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-[10px] opacity-50',
                              isSupport ? 'text-right' : 'text-left'
                            )}
                          >
                            {new Date(msg.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {isSupport && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Reply input */}
              {isOpen ? (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                      disabled={sending}
                      className="resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      className="self-end bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    Ctrl+Enter to send
                  </p>
                </div>
              ) : (
                <div className="border-t p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    This ticket is{' '}
                    {ticket.status === 'resolved' ? 'resolved' : 'closed'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {ticket.userId ? (
                <>
                  <p className="font-medium">
                    {ticket.userId.fname} {ticket.userId.lname}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {ticket.userId.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    @{ticket.userId.username}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Unknown user</p>
              )}
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Status
                </p>
                <Select
                  value={ticket.status}
                  onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Priority
                </p>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) =>
                    handlePriorityChange(v as TicketPriority)
                  }
                  disabled={updatingPriority}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Category
                </p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {ticket.category}
                </span>
              </div>

              {/* Assigned */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Assigned To
                </p>
                <Select
                  value={
                    (typeof ticket.assignedTo === 'object'
                      ? ticket.assignedTo?._id
                      : ticket.assignedTo) || 'unassigned'
                  }
                  onValueChange={(v) =>
                    v === 'unassigned'
                      ? handleAssignChange('')
                      : handleAssignChange(v)
                  }
                  disabled={updatingAssign}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Created
                </p>
                <p className="text-xs">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Updated
                </p>
                <p className="text-xs">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </p>
              </div>

              {/* Message count */}
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Messages
                </p>
                <p className="text-xs">{ticket.messages.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
