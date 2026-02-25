'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
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
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InfoCallout,
  PrimaryButton,
  SecondaryButton,
} from '@/components/neumorphic-modal';
import {
  NEU_TOKENS,
  neuInset,
  neuRaised,
  neuRadius,
} from '@/components/neumorphic-modal/tokens';
import { cn } from '@/lib/utils';

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

  const insetStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuInset,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };
  const raisedStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuRaised,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={step === 'confirming'}
    >
      {step === 'amount' && (
        <>
          <ModalHeader
            title="Deposit USDT"
            subtitle="Add funds to your wallet"
            onClose={handleClose}
          />
          <ModalBody>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              <InfoCallout
                icon={
                  <AlertCircle
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                }
                title="Deposit details"
                description={
                  <>
                    Minimum deposit: <strong>{MIN_DEPOSIT} USDT</strong>
                    <br />
                    Supported network:{' '}
                    <strong>BEP20 (Binance Smart Chain) only</strong>
                    <br />
                    Confirmation time: <strong>5-15 minutes</strong>
                    <br />
                    <span style={{ color: NEU_TOKENS.white80 }}>
                      ⚠️ Real cryptocurrency — verify address before sending.
                    </span>
                  </>
                }
                borderColor="rgba(245, 158, 11, 0.25)"
              />

              <div className="space-y-1.5">
                <Label
                  htmlFor="amount"
                  className="text-sm font-medium"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Amount (USDT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={MIN_DEPOSIT}
                  step="0.01"
                  placeholder={`Enter amount (min ${MIN_DEPOSIT} USDT)`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="neu-input h-12 w-full border-0 text-lg focus-visible:ring-0"
                />
              </div>

              <InfoCallout
                icon={
                  <span
                    className="text-xs font-bold"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    BEP20
                  </span>
                }
                title="Binance Smart Chain (BEP20)"
                description="Only BEP20 network is supported for deposits."
              />

              {error && (
                <p className="neu-error text-xs font-medium">{error}</p>
              )}

              <div className="rounded-xl p-4" style={insetStyle}>
                <p
                  className="text-sm font-semibold"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  How it works
                </p>
                <ol
                  className="mt-2 list-inside list-decimal space-y-1 text-xs"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  <li>Enter deposit amount</li>
                  <li>Send USDT to the provided address</li>
                  <li>Wait for blockchain confirmation</li>
                  <li>Funds credited to your Deposit Wallet</li>
                </ol>
              </div>

              <ModalFooter className="pt-2">
                <PrimaryButton
                  onClick={handleInitiateDeposit}
                  disabled={
                    initiateMutation.isPending ||
                    parseFloat(amount) < MIN_DEPOSIT
                  }
                  loading={initiateMutation.isPending}
                >
                  {initiateMutation.isPending
                    ? 'Generating...'
                    : 'Generate Payment Address'}
                </PrimaryButton>
              </ModalFooter>
            </motion.div>
          </ModalBody>
        </>
      )}

      {step === 'payment' && depositData && (
        <>
          <ModalHeader
            title="Deposit USDT"
            subtitle="Send USDT to the address below"
            onClose={handleClose}
          />
          <ModalBody>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              <InfoCallout
                icon={
                  <AlertCircle
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                }
                title="Send payment"
                description={
                  <>
                    Send <strong>{depositData.amount} USDT</strong> to the
                    address below using{' '}
                    <strong>BEP20 (Binance Smart Chain)</strong> network.
                  </>
                }
              />

              {(showSandboxBanner ||
                (showMockBanner && !showSandboxBanner)) && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    ...insetStyle,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: NEU_TOKENS.white80 }}
                  >
                    Sandbox Mode
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    {showSandboxBanner
                      ? 'You are testing with sandbox. No real funds will be transferred. Pending deposits may auto-confirm after about 30 seconds—keep this window open.'
                      : 'Payment auto-confirmed in mock mode. Funds are credited instantly for testing only.'}
                  </p>
                </div>
              )}

              <div className="rounded-xl p-4" style={insetStyle}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Current status
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {statusDisplayLabel}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    {statusDisplayLabel}
                  </span>
                </div>
                {isPendingStatus && (
                  <p
                    className="mt-2 flex items-center gap-2 text-xs"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    <Clock className="size-3.5" />
                    Monitoring confirmations automatically. You can keep this
                    tab open or return later.
                  </p>
                )}
                <div
                  className="mt-3 grid gap-2 text-xs sm:grid-cols-2"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  <span>
                    Invoice ID:{' '}
                    <strong
                      style={{ color: NEU_TOKENS.white80 }}
                      className="break-all"
                    >
                      {depositData.invoiceId}
                    </strong>
                  </span>
                  <span>
                    Transaction ID:{' '}
                    <strong
                      style={{ color: NEU_TOKENS.white80 }}
                      className="break-all"
                    >
                      {depositData.transactionId || 'Pending'}
                    </strong>
                  </span>
                  <span>
                    Expires:{' '}
                    <strong style={{ color: NEU_TOKENS.white80 }}>
                      {formattedExpiry || 'Not provided'}
                    </strong>
                  </span>
                  <span>
                    Network:{' '}
                    <strong style={{ color: NEU_TOKENS.white80 }}>
                      BEP20 (Binance Smart Chain)
                    </strong>
                  </span>
                </div>
              </div>

              {qrCodeUrl && (
                <div
                  className="flex justify-center rounded-2xl p-6"
                  style={insetStyle}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="Deposit Address QR Code"
                    className="h-64 w-64 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  className="text-sm font-medium"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Deposit Address
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={depositData.depositAddress}
                    readOnly
                    className="neu-input border-0 font-mono text-sm focus-visible:ring-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(depositData.depositAddress)}
                    className="shrink-0 border-0"
                    style={raisedStyle}
                  >
                    {copied ? (
                      <CheckCircle2
                        className="size-4"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                    ) : (
                      <Copy
                        className="size-4"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                    )}
                  </Button>
                </div>
              </div>

              {paymentPortalUrl && (
                <div className="space-y-1.5">
                  <Label
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Payment Portal
                  </Label>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-0"
                    style={raisedStyle}
                    onClick={openPaymentPortal}
                  >
                    <span style={{ color: NEU_TOKENS.white80 }}>
                      Open payment instructions
                    </span>
                    <ExternalLink
                      className="size-4"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                  </Button>
                  <p
                    className="text-xs break-all"
                    style={{ color: NEU_TOKENS.white40 }}
                  >
                    {paymentPortalUrl}
                  </p>
                </div>
              )}

              {instructionList.length > 0 && (
                <div className="rounded-xl p-4" style={insetStyle}>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: NEU_TOKENS.white80 }}
                  >
                    Instructions
                  </p>
                  <ol
                    className="mt-2 list-inside list-decimal space-y-1 text-xs"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    {instructionList.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}

              <InfoCallout
                icon={
                  <AlertCircle
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                }
                title="Warning"
                description={
                  <>
                    Only send USDT via{' '}
                    <strong>BEP20 (Binance Smart Chain)</strong> network.
                    Sending other tokens or using wrong network will result in
                    loss of funds.
                  </>
                }
                borderColor="rgba(248, 113, 113, 0.3)"
              />

              <ModalFooter className="pt-2">
                <PrimaryButton onClick={() => setStep('confirming')}>
                  I&apos;ve Sent the Payment
                </PrimaryButton>
                <p
                  className="text-center text-xs"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  ⏱️ Confirmation typically takes 5-15 minutes. We&apos;re
                  monitoring the blockchain automatically.
                </p>
              </ModalFooter>
            </motion.div>
          </ModalBody>
        </>
      )}

      {step === 'confirming' && (
        <>
          <ModalHeader
            title="Deposit USDT"
            subtitle="Waiting for confirmation"
            onClose={handleClose}
            disableClose
          />
          <ModalBody>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 py-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto inline-flex rounded-full p-6"
                style={raisedStyle}
              >
                <NovuntSpinner size="lg" />
              </motion.div>
              <div className="space-y-2 text-center">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: NEU_TOKENS.accent }}
                >
                  Waiting for Confirmation
                </h3>
                <p className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
                  This usually takes 5-15 minutes
                </p>
                <p
                  className="mt-2 text-sm"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  Don&apos;t close this window. We&apos;ll notify you when
                  confirmed.
                </p>
              </div>
              <div className="rounded-2xl p-4 text-sm" style={insetStyle}>
                <p style={{ color: NEU_TOKENS.white80 }}>
                  ✓ Transaction broadcasted to blockchain
                </p>
                <p style={{ color: NEU_TOKENS.white60 }}>
                  ⏳ Waiting for network confirmations...
                </p>
                <p
                  className="text-xs break-all"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  Invoice ID: {depositData?.invoiceId}
                </p>
                <p
                  className="text-xs break-all"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  Transaction ID: {depositData?.transactionId || 'Pending'}
                </p>
              </div>
              {depositData && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      className="text-sm font-medium"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Deposit Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={depositData.depositAddress}
                        readOnly
                        className="neu-input border-0 font-mono text-sm focus-visible:ring-0"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(depositData.depositAddress)
                        }
                        className="shrink-0 border-0"
                        style={raisedStyle}
                      >
                        {copied ? (
                          <CheckCircle2
                            className="size-4"
                            style={{ color: NEU_TOKENS.accent }}
                          />
                        ) : (
                          <Copy
                            className="size-4"
                            style={{ color: NEU_TOKENS.accent }}
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                  {qrCodeUrl && (
                    <div
                      className="flex justify-center rounded-2xl p-4"
                      style={insetStyle}
                    >
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
          </ModalBody>
        </>
      )}

      {step === 'success' && (
        <div className="px-4 py-6 text-center sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto inline-flex rounded-full p-6"
            style={raisedStyle}
          >
            <CheckCircle2
              className="size-12"
              style={{ color: NEU_TOKENS.accent }}
            />
          </motion.div>
          <h3
            className="mb-2 text-2xl font-bold"
            style={{ color: NEU_TOKENS.accent }}
          >
            Deposit Confirmed!
          </h3>
          <p className="text-lg" style={{ color: NEU_TOKENS.white60 }}>
            {successAmount} USDT has been credited to your Funded Wallet
          </p>
          <p className="mt-2 text-sm" style={{ color: NEU_TOKENS.white40 }}>
            Your balance has been updated
          </p>

          {(showSandboxBanner || showMockBanner) && (
            <div
              className="mx-auto mt-4 max-w-xl rounded-xl p-4 text-left"
              style={{ ...insetStyle, borderColor: 'rgba(245, 158, 11, 0.3)' }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                Sandbox Mode
              </p>
              <p className="mt-1 text-xs" style={{ color: NEU_TOKENS.white60 }}>
                {showSandboxBanner
                  ? 'You were testing with sandbox. No real funds were transferred.'
                  : 'Payment auto-confirmed in mock mode. These funds are for testing only.'}
              </p>
            </div>
          )}

          <div
            className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl p-4 text-left text-sm"
            style={insetStyle}
          >
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Amount:</span>
              <span
                className="font-semibold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                {successAmount} USDT
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Network:</span>
              <span
                className="font-semibold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                {successNetwork}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Status:</span>
              <span
                className="font-semibold"
                style={{ color: NEU_TOKENS.accent }}
              >
                {successStatusLabel}
              </span>
            </div>
            {depositData?.transactionId && (
              <div className="flex justify-between text-xs">
                <span style={{ color: NEU_TOKENS.white40 }}>
                  Transaction ID:
                </span>
                <span
                  className="text-right font-mono break-all"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  {depositData.transactionId}
                </span>
              </div>
            )}
            {depositData?.invoiceId && (
              <div className="flex justify-between text-xs">
                <span style={{ color: NEU_TOKENS.white40 }}>Invoice ID:</span>
                <span
                  className="text-right font-mono break-all"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  {depositData.invoiceId}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SecondaryButton onClick={onClose} className="sm:min-w-[120px]">
              Close
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                onClose();
                openModal('create-stake');
              }}
              className="sm:min-w-[160px]"
            >
              Create Stake
            </PrimaryButton>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
