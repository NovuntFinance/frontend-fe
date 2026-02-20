'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';
import {
  useInitiateDeposit,
  pollDepositStatus,
} from '@/lib/mutations/transactionMutations';
import type { DepositResponse } from '@/lib/mutations/transactionMutations';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { useUIStore } from '@/store/uiStore';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DepositStep = 'amount' | 'payment' | 'confirming' | 'success';

const MOCK_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_MOCK_PAYMENTS === 'true';

const STATUS_CLASSES: Record<string, string> = {
  completed:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200',
  confirmed:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200',
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-300/10 dark:text-amber-100',
  processing:
    'bg-amber-100 text-amber-800 dark:bg-amber-300/10 dark:text-amber-100',
  confirming:
    'bg-blue-100 text-blue-800 dark:bg-blue-300/10 dark:text-blue-100',
  awaiting_payment:
    'bg-blue-100 text-blue-800 dark:bg-blue-300/10 dark:text-blue-100',
  failed: 'bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-200',
  expired:
    'bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-100',
};

const PENDING_STATUSES = new Set([
  'pending',
  'processing',
  'confirming',
  'awaiting_payment',
]);
const SUCCESS_STATUSES = new Set(['confirmed', 'completed']);
const FAILURE_STATUSES = new Set(['failed', 'expired']);

const formatStatusLabel = (status?: string | null) => {
  if (!status) return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClass = (status?: string | null) => {
  if (!status) {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-100';
  }
  return (
    STATUS_CLASSES[status] ||
    'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-100'
  );
};

/**
 * Deposit Modal - Full NowPayments Integration Flow
 * Step 1: Enter amount
 * Step 2: Show payment address (QR code)
 * Step 3: Wait for confirmation
 * Step 4: Success!
 */
export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  // Network is always BEP20 - no need for state since it's constant
  const network = 'BEP20' as const; // Only BEP20 is supported
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used internally for polling state management
  const [isPolling, setIsPolling] = useState(false);
  const pollCancelRef = useRef<(() => void) | null>(null);

  const MIN_DEPOSIT = 1; // Production mode: Real crypto testing with small amounts

  // Mutation hooks and query client for refreshing wallet balance
  const queryClient = useQueryClient();
  const initiateMutation = useInitiateDeposit();
  const { openModal } = useUIStore();

  const normalizedStatus = depositData?.status?.toLowerCase?.() || '';
  const statusBadgeClass = getStatusClass(normalizedStatus);
  const statusDisplayLabel =
    depositData?.statusLabel || formatStatusLabel(depositData?.status);
  const isPendingStatus = PENDING_STATUSES.has(normalizedStatus);
  const isSuccessStatus = SUCCESS_STATUSES.has(normalizedStatus);
  const showMockBanner =
    !!depositData &&
    (depositData.mockMode || (MOCK_PAYMENTS_ENABLED && isSuccessStatus));
  const showSandboxBanner =
    !!depositData &&
    (depositData.isSandbox === true || depositData.isTestMode === true);
  const paymentPortalUrl =
    depositData?.paymentUrl || depositData?.invoiceUrl || '';
  const successAmount = depositData?.amount ?? amount;
  const successNetwork = 'BEP20'; // Only BEP20 is supported
  const successStatusLabel = formatStatusLabel(
    depositData?.status || 'completed'
  );

  const instructionList = useMemo(() => {
    if (!depositData?.instructions) return [];
    if (Array.isArray(depositData.instructions)) {
      return depositData.instructions.filter((instruction) =>
        Boolean(instruction && instruction.trim())
      );
    }
    if (typeof depositData.instructions === 'string') {
      return depositData.instructions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return Object.values(depositData.instructions)
      .map((line) => (typeof line === 'string' ? line.trim() : line))
      .filter((line): line is string => Boolean(line));
  }, [depositData?.instructions]);

  const formattedExpiry = useMemo(() => {
    if (!depositData?.expiresAt) return null;
    try {
      return new Date(depositData.expiresAt).toLocaleString();
    } catch {
      return depositData.expiresAt;
    }
  }, [depositData?.expiresAt]);

  // Reset on open and cleanup on close
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setAmount('');
      setDepositData(null);
      setError('');
      setQrCodeUrl('');
      setIsPolling(false);
    } else {
      // Cancel polling when modal closes
      if (pollCancelRef.current) {
        pollCancelRef.current();
        pollCancelRef.current = null;
      }
      setIsPolling(false);
    }

    // Cleanup on unmount
    return () => {
      if (pollCancelRef.current) {
        pollCancelRef.current();
        pollCancelRef.current = null;
      }
      setIsPolling(false);
    };
  }, [isOpen]);

  // Generate QR code when deposit data is available
  useEffect(() => {
    if (depositData) {
      // Use backend-provided QR code if available
      if (depositData.qrCodeUrl) {
        setQrCodeUrl(depositData.qrCodeUrl);
      } else if (depositData.depositAddress) {
        // Fallback: Generate QR code from address
        QRCodeLib.toDataURL(depositData.depositAddress, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff',
          },
        })
          .then(setQrCodeUrl)
          .catch(console.error);
      }
    }
  }, [depositData]);

  // Poll for deposit confirmation: use transactionId for POST check-status, else invoiceId for GET status
  useEffect(() => {
    const hasTransactionId = Boolean(depositData?.transactionId);
    const hasInvoiceId = Boolean(depositData?.invoiceId);
    if (!hasTransactionId && !hasInvoiceId) {
      setIsPolling(false);
      return;
    }

    const normalizedStatus = depositData?.status?.toLowerCase?.() || '';

    if (!PENDING_STATUSES.has(normalizedStatus)) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    const cancel = pollDepositStatus(
      {
        transactionId: depositData?.transactionId ?? null,
        invoiceId: depositData?.invoiceId ?? null,
      },
      (statusUpdate) => {
        setDepositData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: statusUpdate.status as DepositResponse['status'],
            transactionId: statusUpdate.transactionId || prev.transactionId,
            amount: statusUpdate.amount ?? prev.amount,
            paymentAddress: statusUpdate.paymentAddress || prev.paymentAddress,
            qrCodeUrl: statusUpdate.qrCodeUrl || prev.qrCodeUrl,
          };
        });
      },
      (finalStatus) => {
        setIsPolling(false);
        const finalNormalized = finalStatus.status?.toLowerCase?.() || '';

        setDepositData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: finalStatus.status as DepositResponse['status'],
            transactionId: finalStatus.transactionId || prev.transactionId,
            amount: finalStatus.amount ?? prev.amount,
            paymentAddress: finalStatus.paymentAddress || prev.paymentAddress,
            qrCodeUrl: finalStatus.qrCodeUrl || prev.qrCodeUrl,
            mockMode: finalStatus.mockMode ?? prev.mockMode,
          };
        });

        if (SUCCESS_STATUSES.has(finalNormalized)) {
          queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
          queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });

          setStep('success');
          toast.success('Deposit confirmed!', {
            description: `${finalStatus.amount ?? depositData?.amount ?? 0} USDT credited to your Funded Wallet`,
          });
        } else if (FAILURE_STATUSES.has(finalNormalized)) {
          setError(`Deposit ${finalNormalized}. Please try again.`);
          toast.error('Deposit update', {
            description: `Status: ${formatStatusLabel(finalNormalized)}`,
          });
          setStep('amount');
        }
      },
      (pollError) => {
        setIsPolling(false);
        console.error('Status check error:', pollError);
        toast.error('Deposit status', {
          description:
            pollError?.message ??
            'Failed to check deposit status. Please try again.',
        });
      },
      12000 // Poll every 10–15 seconds (backend recommendation)
    );

    // Safety timeout after 1 hour
    const timeoutId = setTimeout(() => {
      cancel();
      setIsPolling(false);
      setError(
        'Deposit status check timed out. Please verify from transaction history.'
      );
      toast.error('Payment window expired', {
        description:
          'We stopped polling after 60 minutes. Check your wallet balance manually.',
      });
    }, 3600000);

    pollCancelRef.current = () => {
      cancel();
      clearTimeout(timeoutId);
      setIsPolling(false);
    };

    return () => {
      cancel();
      clearTimeout(timeoutId);
      setIsPolling(false);
    };
  }, [
    depositData?.transactionId,
    depositData?.invoiceId,
    depositData?.status,
    depositData?.amount,
    queryClient,
  ]);

  const handleInitiateDeposit = async () => {
    const amountNum = parseFloat(amount);

    if (amountNum < MIN_DEPOSIT) {
      setError(`Minimum deposit is ${MIN_DEPOSIT} USDT`);
      return;
    }

    setError('');

    try {
      console.log(
        '[DepositModal] 🔄 Initiating deposit with amount:',
        amountNum,
        'network:',
        network
      );

      const response = await initiateMutation.mutateAsync({
        amount: amountNum,
        currency: 'USDT',
        network: network,
      });

      console.log(
        '[DepositModal] ✅ Deposit initiated successfully:',
        response
      );
      console.log('[DepositModal] 📊 Response status:', response?.status);
      console.log(
        '[DepositModal] 📦 Full response object:',
        JSON.stringify(response, null, 2)
      );
      if (response?.details) {
        console.log(
          '[DepositModal] 🧾 Backend details object:',
          response.details
        );
      }

      // Extract deposit address from various possible field names
      // NowPayments API uses 'pay_address', some backends might use 'address' or 'paymentAddress'
      const depositAddress =
        response.depositAddress ||
        response.pay_address ||
        response.payAddress ||
        response.address ||
        response.paymentAddress ||
        response.paymentAddressLegacy;

      console.log('[DepositModal] 🔍 Extracted address:', depositAddress);
      console.log('[DepositModal] 🔍 Available fields:', Object.keys(response));

      if (!depositAddress || depositAddress === '') {
        console.error(
          '[DepositModal] ❌ CRITICAL: No deposit address in backend response!'
        );
        console.error(
          '[DepositModal] ❌ Backend must return one of: depositAddress, pay_address, payAddress, address'
        );
        console.error(
          '[DepositModal] ❌ Response fields:',
          Object.keys(response)
        );
        throw new Error(
          'Backend did not return a deposit address. Backend is not calling NowPayments API correctly.'
        );
      }

      const normalizedStatus = response.status?.toLowerCase?.() || '';

      // Normalize the response to use depositAddress and sandbox flags from API
      const finalDepositData = {
        ...response,
        depositAddress: depositAddress,
        mockMode:
          response.mockMode ??
          (MOCK_PAYMENTS_ENABLED && SUCCESS_STATUSES.has(normalizedStatus)),
        isSandbox: response.isSandbox,
        isTestMode: response.isTestMode,
        invoiceUrl: response.invoiceUrl,
      };

      setDepositData(finalDepositData);
      // Network is always BEP20 - no need to set it

      // Handle immediate success (mock mode)
      if (SUCCESS_STATUSES.has(normalizedStatus)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });

        setIsPolling(false);
        setStep('success');
        toast.success('Deposit confirmed!', {
          description: `${response.amount} USDT credited instantly.`,
        });
        return;
      }

      // Show payment screen with QR code and address
      console.log(
        '[DepositModal] 📄 Showing payment step (status:',
        response?.status,
        ')'
      );
      setStep('payment');
      toast.success('Deposit initiated!', {
        description: `Send exactly ${amountNum} USDT using ${network} network`,
      });
    } catch (err: any) {
      console.error('[DepositModal] ❌ Deposit initiation failed:', err);
      console.error('[DepositModal] Error details:', {
        message: err?.message,
        response: err?.response?.data,
        statusCode: err?.statusCode || err?.response?.status,
      });
      if (err?.response?.data?.details) {
        console.error(
          '[DepositModal] Backend validation details:',
          err.response.data.details
        );
      }

      // Extract detailed error message
      let errorMessage = 'Failed to initiate deposit';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Add status code if available
      const statusCode = err?.statusCode || err?.response?.status;
      if (statusCode) {
        errorMessage += ` (Error ${statusCode})`;
      }

      setError(errorMessage);
      toast.error('Deposit failed', {
        description: errorMessage,
        duration: 5000, // Show longer for debugging
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const openPaymentPortal = () => {
    const url =
      paymentPortalUrl || depositData?.paymentUrl || depositData?.invoiceUrl;
    if (!url) return;
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed) {
        throw new Error('Popup blocked');
      }
    } catch (err) {
      console.error('[DepositModal] ❌ Unable to open payment URL:', err);
      toast.error('Could not open payment page', {
        description:
          'Please allow popups for this site or copy the URL manually.',
      });
    }
  };

  const handleClose = () => {
    if (step === 'confirming') {
      if (confirm('Transaction is pending. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Premium glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md backdrop-saturate-150 dark:bg-black/70"
          />

          {/* Modal - Mobile-first with proper height constraints */}
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative my-4 flex max-h-[calc(100vh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-2xl backdrop-saturate-200 sm:my-8 sm:max-h-[calc(100vh-2rem)] sm:rounded-3xl dark:border-white/10 dark:bg-gray-900/95 dark:shadow-black/40"
            >
              {/* Header - Premium gradient */}
              <div className="from-primary via-primary to-primary/90 relative bg-gradient-to-br p-4 shadow-lg sm:p-6">
                <div className="from-primary/20 via-primary/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 rounded-xl border border-white/30 bg-white/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3 dark:bg-white/10">
                      <Download className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
                        Deposit USDT
                      </h2>
                      <p className="truncate text-xs text-white/90 sm:text-sm">
                        Add funds to your wallet
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 flex-shrink-0 rounded-xl text-white/90 hover:bg-white/20 hover:text-white sm:h-10 sm:w-10"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>

              {/* Content - Scrollable with custom scrollbar */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:hover:bg-gray-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-700/70 [&::-webkit-scrollbar-track]:bg-transparent">
                {/* Step 1: Amount Input */}
                {step === 'amount' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Minimum deposit: <strong>{MIN_DEPOSIT} USDT</strong>
                        <br />
                        Supported network:{' '}
                        <strong>BEP20 (Binance Smart Chain) only</strong>
                        <br />
                        Confirmation time: <strong>5-15 minutes</strong>
                        <br />
                        <span className="font-semibold text-amber-600">
                          ⚠️ Real cryptocurrency - verify address before
                          sending!
                        </span>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USDT)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min={MIN_DEPOSIT}
                        step="0.01"
                        placeholder={`Enter amount (min ${MIN_DEPOSIT} USDT)`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Network Info - BEP20 Only */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                          BEP20
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground text-sm font-semibold">
                            Binance Smart Chain (BEP20)
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Only BEP20 network is supported for deposits
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                      <p className="font-semibold">How it works:</p>
                      <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                        <li>Enter deposit amount</li>
                        <li>Send USDT to the provided address</li>
                        <li>Wait for blockchain confirmation</li>
                        <li>Funds credited to your Deposit Wallet</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleInitiateDeposit}
                      disabled={
                        initiateMutation.isPending ||
                        parseFloat(amount) < MIN_DEPOSIT
                      }
                      className="bg-primary hover:bg-primary/90 w-full"
                      size="lg"
                    >
                      {initiateMutation.isPending && (
                        <NovuntSpinner size="sm" className="mr-2" />
                      )}
                      Generate Payment Address
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Payment Address */}
                {step === 'payment' && depositData && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <Alert className="bg-secondary/10 border-secondary">
                      <AlertCircle className="text-secondary h-4 w-4" />
                      <AlertDescription className="text-secondary-foreground">
                        Send <strong>{depositData.amount} USDT</strong> to the
                        address below using{' '}
                        <strong>BEP20 (Binance Smart Chain)</strong> network
                      </AlertDescription>
                    </Alert>

                    {showSandboxBanner && (
                      <Alert className="border-amber-300 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/30">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <div>
                          <AlertTitle className="text-amber-800 dark:text-amber-200">
                            Sandbox Mode
                          </AlertTitle>
                          <AlertDescription>
                            You are testing with sandbox. No real funds will be
                            transferred. Pending deposits may auto-confirm after
                            about 30 seconds—keep this window open.
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    {showMockBanner && !showSandboxBanner && (
                      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <div>
                          <AlertTitle>Sandbox Mode</AlertTitle>
                          <AlertDescription>
                            Payment auto-confirmed in mock mode. Funds are
                            credited instantly for testing only.
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <div className="border-border/70 bg-muted/30 space-y-3 rounded-2xl border p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Current status
                          </p>
                          <p className="text-lg font-semibold">
                            {statusDisplayLabel}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}
                        >
                          {statusDisplayLabel}
                        </span>
                      </div>
                      {isPendingStatus && (
                        <p className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          Monitoring confirmations automatically. You can keep
                          this tab open or return later.
                        </p>
                      )}
                      <div className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-2">
                        <span>
                          Invoice ID:{' '}
                          <strong className="text-foreground break-all">
                            {depositData.invoiceId}
                          </strong>
                        </span>
                        <span>
                          Transaction ID:{' '}
                          <strong className="text-foreground break-all">
                            {depositData.transactionId || 'Pending'}
                          </strong>
                        </span>
                        <span>
                          Expires:{' '}
                          <strong className="text-foreground">
                            {formattedExpiry || 'Not provided'}
                          </strong>
                        </span>
                        <span>
                          Network:{' '}
                          <strong className="text-foreground">
                            BEP20 (Binance Smart Chain)
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="bg-muted flex justify-center rounded-2xl p-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeUrl}
                          alt="Deposit Address QR Code"
                          className="h-64 w-64 rounded-xl"
                        />
                      </div>
                    )}

                    {/* Address */}
                    <div className="space-y-2">
                      <Label>Deposit Address</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={depositData.depositAddress}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(depositData.depositAddress)
                          }
                        >
                          {copied ? (
                            <CheckCircle2 className="text-success h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {paymentPortalUrl && (
                      <div className="space-y-2">
                        <Label>Payment Portal</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={openPaymentPortal}
                        >
                          <span>Open payment instructions</span>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <p className="text-muted-foreground text-xs break-all">
                          {paymentPortalUrl}
                        </p>
                      </div>
                    )}

                    {/* Instructions from backend */}
                    {instructionList.length > 0 && (
                      <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                        <p className="font-semibold">Instructions:</p>
                        <ol className="text-muted-foreground list-inside list-decimal space-y-1">
                          {instructionList.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> Only send USDT via{' '}
                        <strong>BEP20 (Binance Smart Chain)</strong> network.
                        Sending other tokens or using wrong network will result
                        in loss of funds.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Button
                        onClick={() => setStep('confirming')}
                        className="bg-secondary hover:bg-secondary/90 w-full"
                        size="lg"
                      >
                        I&apos;ve Sent the Payment
                      </Button>

                      <p className="text-muted-foreground text-center text-xs">
                        ⏱️ Confirmation typically takes 5-15 minutes. We&apos;re
                        monitoring the blockchain automatically.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirming */}
                {step === 'confirming' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 py-8 sm:space-y-6 sm:py-12"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="bg-primary/10 mx-auto inline-flex rounded-full p-6"
                    >
                      <NovuntSpinner size="lg" />
                    </motion.div>

                    <div className="space-y-2 text-center">
                      <h3 className="text-xl font-semibold">
                        Waiting for Confirmation
                      </h3>
                      <p className="text-muted-foreground">
                        This usually takes 5-15 minutes
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Don&apos;t close this window. We&apos;ll notify you when
                        confirmed.
                      </p>
                    </div>

                    <div className="border-border/70 bg-muted/30 text-muted-foreground space-y-3 rounded-2xl border p-4 text-sm">
                      <p>✓ Transaction broadcasted to blockchain</p>
                      <p>⏳ Waiting for network confirmations...</p>
                      <p className="text-xs break-all">
                        Invoice ID: {depositData?.invoiceId}
                      </p>
                      <p className="text-xs break-all">
                        Transaction ID:{' '}
                        {depositData?.transactionId || 'Pending'}
                      </p>
                    </div>

                    {depositData && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Deposit Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={depositData.depositAddress}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                copyToClipboard(depositData.depositAddress)
                              }
                            >
                              {copied ? (
                                <CheckCircle2 className="text-success h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {qrCodeUrl && (
                          <div className="bg-muted flex justify-center rounded-2xl p-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrCodeUrl}
                              alt="Deposit Address QR Code"
                              className="h-48 w-48 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4 py-8 text-center sm:space-y-6 sm:py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="bg-success/10 inline-flex rounded-full p-6"
                    >
                      <CheckCircle2 className="text-success h-12 w-12" />
                    </motion.div>

                    <div>
                      <h3 className="mb-2 text-2xl font-bold">
                        Deposit Confirmed!
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {successAmount} USDT has been credited to your Funded
                        Wallet
                      </p>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Your balance has been updated
                      </p>
                    </div>

                    {(showSandboxBanner || showMockBanner) && (
                      <Alert className="mx-auto max-w-xl border-amber-200 bg-amber-50 text-left dark:bg-amber-950/20">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <div>
                          <AlertTitle>Sandbox Mode</AlertTitle>
                          <AlertDescription>
                            {showSandboxBanner
                              ? 'You were testing with sandbox. No real funds were transferred.'
                              : 'Payment auto-confirmed in mock mode. These funds are for testing only.'}
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">
                          {successAmount} USDT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-semibold">{successNetwork}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-success font-semibold">
                          {successStatusLabel}
                        </span>
                      </div>
                      {depositData?.transactionId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Transaction ID:
                          </span>
                          <span className="text-right font-mono break-all">
                            {depositData.transactionId}
                          </span>
                        </div>
                      )}
                      {depositData?.invoiceId && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Invoice ID:
                          </span>
                          <span className="text-right font-mono break-all">
                            {depositData.invoiceId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full flex-1 sm:w-auto"
                        size="lg"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          onClose();
                          // Open create stake modal
                          openModal('create-stake');
                        }}
                        className="bg-primary hover:bg-primary/90 w-full flex-1 sm:w-auto"
                        size="lg"
                      >
                        Create Stake
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
