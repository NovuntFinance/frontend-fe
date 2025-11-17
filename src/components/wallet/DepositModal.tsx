/**
 * Deposit Modal Component
 * Ultra-modern deposit flow with QR code and payment URL
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Loader2, QrCode, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDeposit, useDepositStatus } from '@/hooks/useWallet';
import { formatCurrency, formatTimeRemaining, getTimeRemaining } from '@/lib/utils/wallet';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { ConfettiBurst } from '@/components/ui/confetti';
import { CheckCircle2 } from 'lucide-react';

const depositSchema = z.object({
  amount: z
    .number()
    .min(10, 'Minimum deposit is 10 USDT')
    .max(100000, 'Maximum deposit is 100,000 USDT'),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  
  const createDeposit = useCreateDeposit();
  const { data: depositStatus } = useDepositStatus(currentInvoiceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setCurrentInvoiceId(null);
      setCopied(false);
    }
  }, [open, reset]);

  const [showConfetti, setShowConfetti] = useState(false);

  // Handle deposit status updates
  useEffect(() => {
    if (depositStatus?.data?.status === 'confirmed') {
      setShowConfetti(true);
      toast.success('Deposit confirmed!', {
        description: 'Your deposit has been successfully processed',
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
      setTimeout(() => {
        setShowConfetti(false);
        onOpenChange(false);
      }, 2000);
    } else if (depositStatus?.data?.status === 'failed') {
      toast.error('Deposit failed', {
        description: 'Please try again or contact support',
      });
    }
  }, [depositStatus, onOpenChange]);

  const onSubmit = async (data: DepositFormData) => {
    try {
      console.log('[DepositModal] Submitting deposit for amount:', data.amount);
      
      const response = await createDeposit.mutateAsync(data.amount);
      
      // Debug logging - ALWAYS log to help debug
      console.log('[DepositModal] ✅ Deposit response received:', response);
      console.log('[DepositModal] Response type:', typeof response);
      console.log('[DepositModal] Response keys:', response ? Object.keys(response) : 'null');
      console.log('[DepositModal] Response.data:', response?.data);
      console.log('[DepositModal] Response.success:', response?.success);
      
      // Handle response structure - API returns { success: true, data: {...} }
      // axios automatically unwraps response.data, so response is the API response object
      if (!response) {
        console.error('[DepositModal] ❌ No response received');
        toast.error('No response from server', {
          description: 'Please try again',
        });
        return;
      }
      
      // Check if response has success flag
      if (response.success === false) {
        console.error('[DepositModal] ❌ Deposit failed:', response.message);
        toast.error('Deposit failed', {
          description: response.message || 'Please try again',
        });
        return;
      }
      
      // Extract deposit data
      const depositData = response.data;
      
      if (!depositData) {
        console.error('[DepositModal] ❌ No data in response:', response);
        toast.error('Invalid response', {
          description: 'Please try again or contact support',
        });
        return;
      }
      
      console.log('[DepositModal] Deposit data:', depositData);
      console.log('[DepositModal] Invoice ID:', depositData.invoiceId);
      console.log('[DepositModal] Payment URL:', depositData.paymentUrl);
      
      // Set invoice ID to start polling
      if (depositData.invoiceId) {
        setCurrentInvoiceId(depositData.invoiceId);
      }
      
      // Show success toast IMMEDIATELY
      toast.success('Deposit created successfully!', {
        description: depositData.paymentUrl ? 'Opening payment page...' : 'Payment details loading...',
        duration: 4000,
      });
      
      // Automatically redirect to payment URL if available
      if (depositData.paymentUrl) {
        console.log('[DepositModal] 🚀 Will open payment URL:', depositData.paymentUrl);
        
        // Open payment URL in new tab after a short delay
        setTimeout(() => {
          console.log('[DepositModal] 🚀 Opening payment URL now:', depositData.paymentUrl);
          try {
            const newWindow = window.open(depositData.paymentUrl, '_blank', 'noopener,noreferrer');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              console.warn('[DepositModal] ⚠️ Popup blocked, showing error toast');
              toast.error('Popup blocked', {
                description: 'Please allow popups for this site, or click the external link button below',
                duration: 5000,
              });
            } else {
              console.log('[DepositModal] ✅ Payment page opened successfully');
            }
          } catch (err) {
            console.error('[DepositModal] ❌ Error opening payment URL:', err);
            toast.error('Could not open payment page', {
              description: 'Please click the external link button below',
            });
          }
        }, 1000); // Increased delay to ensure toast is visible
      } else {
        console.warn('[DepositModal] ⚠️ No payment URL in response');
        toast.info('Payment URL not available', {
          description: 'Please wait for payment details to load',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('[DepositModal] ❌ Deposit creation error:', error);
      console.error('[DepositModal] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Show error toast if mutation didn't handle it
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create deposit';
      toast.error('Deposit failed', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPaymentUrl = () => {
    if (depositStatus?.data?.paymentUrl) {
      window.open(depositStatus.data.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const depositData = depositStatus?.data;
  const timeRemaining = depositData?.expiresAt ? getTimeRemaining(depositData.expiresAt) : null;

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Deposit</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!currentInvoiceId ? (
            // Step 1: Amount Input
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="amount">Deposit Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max="100000"
                  placeholder="Enter amount (10 - 100,000 USDT)"
                  {...register('amount', { valueAsNumber: true })}
                  className="mt-2"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum: 10 USDT • Maximum: 100,000 USDT
                </p>
              </div>

              <Button
                type="submit"
                disabled={createDeposit.isPending}
                className="w-full"
                size="lg"
              >
                {createDeposit.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating deposit...
                  </>
                ) : (
                  'Create Deposit'
                )}
              </Button>
            </motion.form>
          ) : (
            // Step 2: Payment Details
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {depositData && (
                <>
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        depositData.status === 'pending'
                          ? 'bg-warning/10 text-warning border border-warning/20'
                          : depositData.status === 'confirmed'
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}
                    >
                      {depositData.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Payment Pending
                        </div>
                      )}
                      {depositData.status === 'confirmed' && '✓ Payment Confirmed'}
                      {depositData.status === 'failed' && '✗ Payment Failed'}
                    </div>
                  </div>

                  {/* Amount Display */}
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Deposit Amount</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(depositData.amount)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* QR Code */}
                  {depositData.qrCode && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-white rounded-xl border-2 border-border">
                        <img
                          src={depositData.qrCode}
                          alt="Payment QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Scan QR code with your wallet app
                      </p>
                    </div>
                  )}

                  {/* Payment URL */}
                  {depositData.paymentUrl && (
                    <div>
                      <Label>Payment URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={depositData.paymentUrl}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(depositData.paymentUrl!)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleOpenPaymentUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Expiration Timer */}
                  {timeRemaining && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Expires in: {formatTimeRemaining(timeRemaining)}</span>
                    </div>
                  )}

                  {/* Network Info */}
                  {depositData.network && (
                    <div>
                      <Label>Network</Label>
                      <div className="mt-2">
                        <span className="px-3 py-1 rounded-lg bg-muted text-sm font-medium">
                          {depositData.network}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold mb-2">Payment Instructions:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Scan the QR code or copy the payment URL</li>
                        <li>Send exactly {formatCurrency(depositData.amount)} to the address</li>
                        <li>Wait for blockchain confirmation (usually 1-5 minutes)</li>
                        <li>Your deposit will be automatically credited</li>
                      </ol>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
    </>
  );
}

