/**
 * Support Escalation Form
 * Form for escalating complex issues to human support
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/enhanced-toast';
import type { SupportEscalationRequest } from '@/types/assistant';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface SupportEscalationFormProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  onTicketCreated?: (ticketId: string) => void;
}

export function SupportEscalationForm({
  isOpen,
  onClose,
  conversationId,
  onTicketCreated,
}: SupportEscalationFormProps) {
  const [formData, setFormData] = useState<SupportEscalationRequest>({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        toast.error('Authentication required', {
          description: 'Please log in to submit a support request.',
        });
        return;
      }

      const data = await api.post<{
        success: boolean;
        data: { ticketId: string };
        message?: string;
      }>('/assistant/support/escalate', {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        conversationId: conversationId || undefined, // Link to conversation if available
      });

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to submit support request');
      }

      const ticketData = data.data;
      if (onTicketCreated && ticketData.ticketId) {
        onTicketCreated(ticketData.ticketId);
      }

      setIsSubmitted(true);
      toast.success('Support request submitted successfully!', {
        description: `Ticket ID: ${ticketData.ticketId}. Our team will respond within 24 hours.`,
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'general',
        });
        onClose();
      }, 3000);
    } catch {
      toast.error('Failed to submit support request', {
        description: 'Please try again or contact support directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Form Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <Card className="border-white/20 bg-gradient-to-b from-white/95 to-white/90 shadow-2xl backdrop-blur-2xl dark:from-slate-900/95 dark:to-slate-900/90">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="text-primary h-5 w-5" />
                      Escalate to Human Support
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Our team will respond within 24 hours
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                    aria-label="Close form"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Request Submitted!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We&apos;ve received your request and will respond within
                      24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(
                          value: SupportEscalationRequest['category']
                        ) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">
                            Technical Issue
                          </SelectItem>
                          <SelectItem value="account">
                            Account Related
                          </SelectItem>
                          <SelectItem value="billing">
                            Billing & Payments
                          </SelectItem>
                          <SelectItem value="general">
                            General Inquiry
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(
                          value: SupportEscalationRequest['priority']
                        ) =>
                          setFormData((prev) => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            Low - General question
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium - Needs attention
                          </SelectItem>
                          <SelectItem value="high">
                            High - Urgent issue
                          </SelectItem>
                          <SelectItem value="urgent">
                            Urgent - Critical problem
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        placeholder="Brief summary of your issue"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Please provide as much detail as possible..."
                        rows={6}
                        required
                        className="resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit Request
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <p className="text-muted-foreground text-xs">
                      💬 You&apos;ll receive a response via email within 24
                      hours. For urgent matters, please include
                      &quot;URGENT&quot; in your subject line.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
