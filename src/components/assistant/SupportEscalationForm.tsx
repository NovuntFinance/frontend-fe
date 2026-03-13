/**
 * Support Escalation Form
 * Form for escalating complex issues to human support
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/enhanced-toast';
import type { SupportEscalationRequest } from '@/types/assistant';
import {
  createSupportTicket,
  getSupportOptions,
} from '@/services/assistantApi';

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
  const [categories, setCategories] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account Related' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' },
  ]);
  const [priorities, setPriorities] = useState<
    Array<{ value: string; label: string }>
  >([
    { value: 'low', label: 'Low - General question' },
    { value: 'medium', label: 'Medium - Needs attention' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'urgent', label: 'Urgent - Critical problem' },
  ]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Fetch support options from backend when form opens
  useEffect(() => {
    if (!isOpen) return;
    getSupportOptions()
      .then((res) => {
        if (res?.success && res?.data) {
          if (res.data.categories?.length) setCategories(res.data.categories);
          if (res.data.priorities?.length) setPriorities(res.data.priorities);
        }
      })
      .catch(() => {
        // Keep hardcoded fallback on fetch failure
      });
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const subject = formData.subject.trim();
    const description = formData.description.trim();

    if (!subject || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (subject.length > 500) {
      toast.error('Subject must be 500 characters or less');
      return;
    }
    if (description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createSupportTicket({
        subject,
        description,
        priority: formData.priority,
        category: formData.category,
        conversationId: conversationId || undefined,
      });

      if (!response?.success || !response?.data) {
        throw new Error('Failed to submit support request');
      }

      const ticketData = response.data;
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
    } catch (err: unknown) {
      const axiosErr = err as {
        message?: string;
        response?: {
          data?: { error?: { message?: string }; message?: string };
        };
      };
      const backendMsg =
        axiosErr?.response?.data?.error?.message ||
        axiosErr?.response?.data?.message ||
        axiosErr?.message;
      toast.error('Failed to submit support request', {
        description:
          backendMsg ||
          'Please try again, or use the Support section in the app.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — below form so form receives pointer events first */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Form Modal — stopPropagation prevents backdrop from capturing clicks; isolation ensures stacking */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="fixed top-1/2 left-1/2 z-[99999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
            style={{ isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="escalation-form-title"
          >
            <Card className="pointer-events-auto border-white/20 bg-gradient-to-b from-white/95 to-white/90 shadow-2xl backdrop-blur-2xl dark:from-slate-900/95 dark:to-slate-900/90">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle
                      id="escalation-form-title"
                      className="flex items-center gap-2"
                    >
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
                    {/* Category — Radix Select so dropdown renders above modal */}
                    <div
                      className="space-y-2"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: v as SupportEscalationRequest['category'],
                          }))
                        }
                      >
                        <SelectTrigger
                          id="category"
                          aria-label="Category"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="z-[100001]">
                          {categories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority — Radix Select so dropdown renders above modal */}
                    <div
                      className="space-y-2"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) =>
                          setFormData((prev) => ({
                            ...prev,
                            priority: v as SupportEscalationRequest['priority'],
                          }))
                        }
                      >
                        <SelectTrigger
                          id="priority"
                          aria-label="Priority"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="z-[100001]">
                          {priorities.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
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
                        autoFocus
                        maxLength={500}
                        className="touch-manipulation"
                      />
                    </div>

                    {/* Description — wrapper focuses textarea on click (fixes modal overlay blocking focus) */}
                    <div
                      className="space-y-2"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        descriptionRef.current?.focus();
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        ref={descriptionRef}
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        onPointerDown={(e) => e.stopPropagation()}
                        placeholder="Please provide as much detail as possible... (min 10 characters)"
                        rows={6}
                        required
                        minLength={10}
                        className="touch-manipulation resize-none"
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

                    {/* Info — Support is in-app only; no email for ticket replies */}
                    <p className="text-muted-foreground text-xs">
                      💬 All support replies happen in-app. You&apos;ll see a
                      notification when our team replies—check the{' '}
                      <strong>My Tickets</strong> tab in Nova Assistant for
                      updates. For urgent matters, include &quot;URGENT&quot; in
                      your subject.
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

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
