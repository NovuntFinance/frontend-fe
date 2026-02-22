'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
  Clock,
  Mail,
  Loader2,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { transferApi } from '@/services/transferApi';
import type { TransferResponse } from '@/types/transfer';
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { useTransferLimits } from '@/hooks/useTransferLimits';
import { useOtpCooldown } from '@/hooks/useOtpCooldown';
import { fmt4 } from '@/utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Display user interface for search results
interface DisplayUser {
  userId: string;
  username: string;
  displayName: string;
  email?: string;
}

type TransferStep = 'search' | 'amount' | '2fa' | 'success';

/**
 * Transfer Modal - P2P Transfer Flow
 * Step 1: Search for recipient
 * Step 2: Enter amount
 * Step 3: Confirm transfer
 * Step 4: Success!
 */
export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const queryClient = useQueryClient();
  const { data: wallet, refetch } = useWalletBalance();
  const [step, setStep] = useState<TransferStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DisplayUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const turnstileConfirmRef = useRef<TurnstileWidgetHandle | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const { cooldownSeconds, isOnCooldown, triggerCooldown, resetCooldown } =
    useOtpCooldown();
  const [transferResponse, setTransferResponse] =
    useState<TransferResponse | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  // Transfers should only use Earning Wallet, not total balance
  // Use earnings.availableBalance (or earnings.balance) for transfers
  const availableBalance =
    wallet?.earnings?.availableBalance || wallet?.earnings?.balance || 0;

  // Get transfer limits from dynamic config
  const transferLimits = useTransferLimits();
  const MIN_TRANSFER = transferLimits.minAmount;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setAmount('');
      setMemo('');
      setTwoFACode('');
      setEmailOtp('');
      setOtpSent(false);
      setOtpExpiresIn(null);
      setError('');
      resetCooldown();
      refetch();
    }
  }, [isOpen, refetch, resetCooldown]);

  // Search users with debounce
  // Only shows past recipients from transfer history
  // For new recipients, user must type complete username
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const searchUsers = async () => {
      setSearchLoading(true);
      try {
        const results = await transferApi.searchUsers(debouncedSearch);

        // Convert API results to display format
        const displayUsers: DisplayUser[] = results.map((user) => ({
          userId: user.userId,
          username: user.username,
          displayName: user.fullName || user.username,
          email: user.email,
        }));

        setSearchResults(displayUsers);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const handleSelectUser = (user: DisplayUser) => {
    setSelectedUser(user);
    setStep('amount');
    setError('');
  };

  const handleSendVerificationCode = async () => {
    const validation = transferApi.validateTransferAmount(
      parseFloat(amount),
      availableBalance
    );

    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    const turnstileToken = turnstileRef.current?.getToken() || undefined;
    if (!turnstileToken) {
      setError('Please complete the security verification');
      return;
    }

    setError('');
    setRequestingOtp(true);

    try {
      const identifier = selectedUser
        ? selectedUser.email && selectedUser.email.includes('@')
          ? { recipientEmail: selectedUser.email }
          : selectedUser.userId && /^[0-9a-fA-F]{24}$/.test(selectedUser.userId)
            ? { recipientId: selectedUser.userId }
            : { recipientUsername: selectedUser.username }
        : {};

      const response = await transferApi.requestTransferOtp({
        ...identifier,
        amount: parseFloat(amount),
        'cf-turnstile-response': turnstileToken,
      });

      setOtpSent(true);
      setOtpExpiresIn(response.expiresIn ?? 600);
      setStep('2fa');
      turnstileRef.current?.reset();
      toast.success('Verification code sent', {
        description: 'Check your email for the 6-digit code',
      });
    } catch (err: any) {
      const errorData = err?.response?.data || err?.responseData || err;
      if (triggerCooldown(err)) {
        setError(
          errorData?.message || 'Please wait before requesting a new code'
        );
      } else if (errorData?.code === 'TURNSTILE_FAILED') {
        turnstileRef.current?.reset();
        setError('Security check failed. Please try again.');
      } else if (errorData?.code === 'SUPPORT_REQUIRED') {
        setError(
          'Too many failed attempts. Please contact support or try again later.'
        );
      } else {
        setError(
          errorData?.message ||
            transferApi.formatErrorMessage(err) ||
            'Could not send verification code'
        );
      }
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSubmitTransfer = async () => {
    if (!selectedUser) return;

    // Validate email OTP
    if (!emailOtp || emailOtp.length !== 6 || !/^\d{6}$/.test(emailOtp)) {
      setError('Please enter the 6-digit verification code from your email');
      return;
    }

    // Validate 2FA code
    const twoFAValidation = transferApi.validate2FACode(twoFACode);
    if (!twoFAValidation.isValid) {
      setError(twoFAValidation.error || 'Invalid 2FA code');
      return;
    }

    const turnstileToken = turnstileConfirmRef.current?.getToken() || undefined;
    if (!turnstileToken) {
      setError('Please complete the security verification');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Build transfer request with appropriate identifier
      // Priority: email > username > ID (as per backend guide)
      const transferRequest: any = {
        amount: parseFloat(amount),
        memo: memo || undefined,
        twoFACode: twoFACode,
        emailOtp: emailOtp,
        'cf-turnstile-response': turnstileToken,
      };

      // If selectedUser has an email and it looks like one, use email
      if (selectedUser.email && selectedUser.email.includes('@')) {
        transferRequest.recipientEmail = selectedUser.email
          .toLowerCase()
          .trim();
      } else if (
        selectedUser.userId &&
        /^[0-9a-fA-F]{24}$/.test(selectedUser.userId)
      ) {
        // If it's a MongoDB ObjectId, use ID
        transferRequest.recipientId = selectedUser.userId;
      } else {
        // Otherwise use username
        transferRequest.recipientUsername = selectedUser.username.toLowerCase();
      }

      const response = await transferApi.transferFunds(transferRequest);

      setTransferResponse(response);
      setStep('success');

      const recipientDisplay =
        selectedUser.email && selectedUser.email.includes('@')
          ? selectedUser.email
          : `@${selectedUser.username}`;

      toast.success('Transfer successful!', {
        description: `${amount} USDT sent to ${recipientDisplay}`,
        duration: 5000,
      });

      // Refresh wallet balance and transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
      refetch();
    } catch (err: any) {
      const errorData = err?.response?.data || err?.responseData || err;
      if (errorData?.code === 'TURNSTILE_FAILED') {
        turnstileConfirmRef.current?.reset();
      }
      const errorMessage = transferApi.formatErrorMessage(err);
      setError(errorMessage);

      toast.error('Transfer failed', {
        description: errorMessage,
        duration: 5000,
      });

      // Clear codes on error to allow retry
      setTwoFACode('');
      setEmailOtp('');
    } finally {
      setLoading(false);
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
            onClick={onClose}
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
              <div className="from-accent via-accent to-accent/90 relative bg-gradient-to-br p-4 shadow-lg sm:p-6">
                <div className="from-accent/20 via-accent/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 rounded-xl border border-white/30 bg-white/20 p-2.5 shadow-lg backdrop-blur-sm sm:p-3 dark:bg-white/10">
                      <Send className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-white sm:text-2xl">
                        Send USDT
                      </h2>
                      <p className="truncate text-xs text-white/90 sm:text-sm">
                        Instant P2P transfer &bull; FREE
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 flex-shrink-0 rounded-xl text-white/90 hover:bg-white/20 hover:text-white sm:h-10 sm:w-10"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>

              {/* Content - Scrollable with custom scrollbar */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-6 sm:p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:hover:bg-gray-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-700/70 [&::-webkit-scrollbar-track]:bg-transparent">
                {/* Step 1: Search User */}
                {step === 'search' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Available Balance */}
                    <div className="from-accent/10 to-accent/5 border-accent/20 rounded-xl border bg-gradient-to-br p-4">
                      <p className="text-muted-foreground mb-1 text-sm">
                        Available to Send
                      </p>
                      <p className="text-foreground text-3xl font-bold">
                        $
                        {availableBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        From Earnings Wallet
                      </p>
                    </div>

                    {/* Info Alert */}
                    <Alert className="bg-success/10 border-success">
                      <CheckCircle2 className="text-success h-4 w-4" />
                      <AlertDescription>
                        <strong>Instant & FREE</strong> - No fees, instant
                        delivery, available 24/7
                      </AlertDescription>
                    </Alert>

                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Find Recipient</Label>
                      <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                        <Input
                          id="search"
                          type={searchQuery.includes('@') ? 'email' : 'text'}
                          placeholder="Enter email, username, or user ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        {searchLoading && (
                          <NovuntSpinner
                            size="sm"
                            className="absolute top-1/2 right-3 -translate-y-1/2"
                          />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        You can send to a user by entering their email address,
                        username, or user ID
                      </p>
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="space-y-2">
                        {/* Always show option to continue with typed username */}
                        {searchQuery.trim().length >= 3 && !searchLoading && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                              const trimmedQuery = searchQuery.trim();
                              // Detect identifier type (email, ID, or username)
                              const identifier =
                                transferApi.detectIdentifierType(trimmedQuery);

                              const newUser: DisplayUser = {
                                userId: identifier.recipientId || '',
                                username:
                                  identifier.recipientUsername ||
                                  trimmedQuery.toLowerCase(),
                                displayName:
                                  identifier.recipientEmail || trimmedQuery,
                                email: identifier.recipientEmail,
                              };
                              handleSelectUser(newUser);
                            }}
                            className="border-primary/30 bg-primary/5 hover:bg-primary/10 flex w-full items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-colors"
                          >
                            <div className="bg-primary/20 rounded-full p-3">
                              <User className="text-primary h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">
                                {searchQuery.trim().includes('@')
                                  ? searchQuery.trim()
                                  : `@${searchQuery.trim()}`}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {searchQuery.trim().includes('@')
                                  ? 'Send to email address'
                                  : /^[0-9a-fA-F]{24}$/.test(searchQuery.trim())
                                    ? 'Send to user ID'
                                    : 'Send to new recipient'}
                              </p>
                            </div>
                            <Send className="text-primary h-4 w-4" />
                          </motion.button>
                        )}

                        {/* Show message if less than 3 characters */}
                        {searchQuery.trim().length < 3 && !searchLoading && (
                          <div className="text-muted-foreground bg-muted/50 rounded-xl p-6 text-center">
                            <p className="text-sm">
                              Type at least 3 characters, an email address, or a
                              user ID to add a new recipient
                            </p>
                          </div>
                        )}

                        {/* Past Recipients Section */}
                        {searchResults.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
                              Past Recipients
                            </p>
                            {searchResults.map((user) => (
                              <motion.button
                                key={user.userId || user.username}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleSelectUser(user)}
                                className="hover:bg-muted flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors"
                              >
                                <div className="bg-primary/10 rounded-full p-3">
                                  <User className="text-primary h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">
                                    @{user.username}
                                  </p>
                                  <p className="text-muted-foreground truncate text-sm">
                                    {user.displayName}
                                  </p>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {searchQuery.length < 2 && (
                      <div className="text-muted-foreground p-12 text-center">
                        <Search className="mx-auto mb-4 h-12 w-12 opacity-30" />
                        <p className="text-sm">
                          Start typing to search for users
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Enter Amount */}
                {step === 'amount' && selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Selected User */}
                    <div className="bg-muted rounded-xl p-4">
                      <p className="text-muted-foreground mb-2 text-xs">
                        Sending to:
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {selectedUser.email &&
                            selectedUser.email.includes('@')
                              ? selectedUser.email
                              : `@${selectedUser.username}`}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {selectedUser.email &&
                            selectedUser.email.includes('@')
                              ? 'Email address'
                              : selectedUser.displayName}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setStep('search')}
                        className="mt-2 text-xs"
                      >
                        Change recipient
                      </Button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USDT)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min={MIN_TRANSFER}
                        max={availableBalance}
                        step="0.01"
                        placeholder={`Enter amount (min ${MIN_TRANSFER} USDT)`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg"
                        autoFocus
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Available: ${fmt4(availableBalance)}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setAmount(availableBalance.toString())}
                          className="h-auto p-0 text-xs"
                        >
                          Send max
                        </Button>
                      </div>
                    </div>

                    {/* Memo Input (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="memo">Note (Optional)</Label>
                      <Input
                        id="memo"
                        type="text"
                        maxLength={200}
                        placeholder="Add a note for this transfer..."
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                      <p className="text-muted-foreground text-xs">
                        {memo.length}/200 characters
                      </p>
                    </div>

                    {/* Fee Info */}
                    {parseFloat(amount) >= MIN_TRANSFER && (
                      <div className="bg-success/10 border-success/20 rounded-xl border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-success h-4 w-4" />
                          <p className="text-success font-semibold">
                            FREE Transfer
                          </p>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount:
                            </span>
                            <span className="font-semibold">
                              ${fmt4(parseFloat(amount))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="text-success font-semibold">
                              $0.00 (FREE)
                            </span>
                          </div>
                          <div className="bg-border my-2 h-px" />
                          <div className="flex justify-between">
                            <span className="font-semibold">
                              Recipient receives:
                            </span>
                            <span className="text-success text-lg font-bold">
                              ${fmt4(parseFloat(amount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cloudflare Turnstile */}
                    <TurnstileWidget widgetRef={turnstileRef} size="compact" />

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={() => setStep('search')}
                        variant="outline"
                        className="w-full flex-1 sm:w-auto"
                        size="lg"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSendVerificationCode}
                        disabled={
                          !amount ||
                          parseFloat(amount) < MIN_TRANSFER ||
                          requestingOtp ||
                          isOnCooldown
                        }
                        className="bg-accent hover:bg-accent/90 w-full flex-1 sm:w-auto"
                        size="lg"
                      >
                        {requestingOtp ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : isOnCooldown ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Resend in {cooldownSeconds}s
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send verification code
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: 2FA Confirmation */}
                {step === '2fa' && selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex h-full flex-col"
                  >
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                      {/* Confirmation Card - Redesigned */}
                      <div className="from-accent/5 via-accent/10 to-accent/5 border-accent/20 space-y-6 rounded-2xl border bg-gradient-to-br p-8">
                        {/* Amount Display */}
                        <div className="text-center">
                          <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase">
                            You&apos;re sending
                          </p>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-muted-foreground text-2xl">
                              $
                            </span>
                            <p className="text-foreground text-5xl font-bold">
                              {fmt4(parseFloat(amount))}
                            </p>
                          </div>
                          <p className="text-muted-foreground mt-2 text-lg font-medium">
                            USDT
                          </p>
                        </div>

                        {/* Arrow Animation */}
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="bg-accent/20 rounded-full p-4"
                          >
                            <Send className="text-accent h-6 w-6" />
                          </motion.div>
                        </div>

                        {/* Recipient Display */}
                        <div className="text-center">
                          <p className="text-muted-foreground mb-3 text-sm font-medium">
                            To
                          </p>
                          <div className="bg-background/50 hover:bg-background/70 border-border/50 inline-flex items-center gap-4 rounded-2xl border p-4 transition-colors">
                            <div className="bg-primary/10 rounded-full p-3">
                              <User className="text-primary h-6 w-6" />
                            </div>
                            <div className="text-left">
                              <p className="text-lg font-semibold">
                                {selectedUser.email &&
                                selectedUser.email.includes('@')
                                  ? selectedUser.email
                                  : `@${selectedUser.username}`}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {selectedUser.email &&
                                selectedUser.email.includes('@')
                                  ? 'Email address'
                                  : selectedUser.displayName}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Transfer Details */}
                        <div className="bg-background/30 border-border/50 space-y-3 rounded-xl border p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">
                              Transfer fee
                            </span>
                            <span className="text-success font-bold">FREE</span>
                          </div>
                          <div className="bg-border h-px" />
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">
                              Delivery time
                            </span>
                            <span className="text-success font-bold">
                              Instant
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Email OTP Input */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="text-accent h-5 w-5" />
                          <Label
                            htmlFor="emailOtp"
                            className="text-base font-semibold"
                          >
                            Email verification code
                          </Label>
                        </div>
                        <div className="relative">
                          <Input
                            id="emailOtp"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={emailOtp}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setEmailOtp(value);
                              setError('');
                            }}
                            className="bg-background/50 focus:border-accent focus:ring-accent/20 h-14 border-2 text-center font-mono text-2xl tracking-[0.4em] focus:ring-2"
                            autoFocus
                          />
                        </div>
                        <p className="text-muted-foreground text-center text-xs">
                          Enter the 6-digit code sent to your email
                        </p>
                      </div>

                      {/* 2FA Code Input - Redesigned */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="text-accent h-5 w-5" />
                          <Label
                            htmlFor="twoFACode"
                            className="text-base font-semibold"
                          >
                            Two-Factor Authentication
                          </Label>
                        </div>

                        <div className="relative">
                          <Input
                            id="twoFACode"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={twoFACode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setTwoFACode(value);
                              setError('');
                            }}
                            className="bg-background/50 focus:border-accent focus:ring-accent/20 h-16 border-2 text-center font-mono text-3xl tracking-[0.5em] focus:ring-2"
                          />
                          {twoFACode.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-1/2 right-4 -translate-y-1/2"
                            >
                              <CheckCircle2 className="text-success h-5 w-5" />
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs">
                          <Clock className="text-muted-foreground h-3 w-3" />
                          <p className="text-muted-foreground text-center">
                            Enter the 6-digit code from your authenticator app
                          </p>
                        </div>
                      </div>

                      {/* Cloudflare Turnstile for submit */}
                      <TurnstileWidget
                        widgetRef={turnstileConfirmRef}
                        size="compact"
                      />

                      {error && (
                        <Alert
                          variant="destructive"
                          className="border-red-500/50"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="font-medium">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Sticky Footer with Buttons */}
                    <div className="bg-card sticky bottom-0 mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:pt-6">
                      <Button
                        onClick={() => setStep('amount')}
                        variant="outline"
                        className="w-full flex-1 border-2 sm:w-auto"
                        size="lg"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitTransfer}
                        disabled={
                          loading ||
                          emailOtp.length !== 6 ||
                          twoFACode.length !== 6
                        }
                        className="bg-accent hover:bg-accent/90 shadow-accent/20 w-full flex-1 border-2 border-transparent shadow-lg sm:w-auto"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <NovuntSpinner size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Confirm Transfer
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && selectedUser && (
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
                        Transfer Successful!
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        ${fmt4(parseFloat(amount))} sent to{' '}
                        {selectedUser.email && selectedUser.email.includes('@')
                          ? selectedUser.email
                          : `@${selectedUser.username}`}
                      </p>
                    </div>

                    <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">
                          ${fmt4(parseFloat(amount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Recipient:
                        </span>
                        <span className="font-semibold">
                          {selectedUser.email &&
                          selectedUser.email.includes('@')
                            ? selectedUser.email
                            : `@${selectedUser.username}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="text-success font-semibold">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Transaction ID:
                        </span>
                        <span className="font-mono text-xs">
                          {transferResponse?.txId}
                        </span>
                      </div>
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
                          setStep('search');
                          setSearchQuery('');
                          setSelectedUser(null);
                          setAmount('');
                        }}
                        className="bg-accent hover:bg-accent/90 w-full flex-1 sm:w-auto"
                        size="lg"
                      >
                        Send Again
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
