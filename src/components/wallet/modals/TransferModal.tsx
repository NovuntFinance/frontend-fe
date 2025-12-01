'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { transferApi } from '@/services/transferApi';
import type { TransferResponse, UserSearchResult } from '@/types/transfer';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [transferResponse, setTransferResponse] =
    useState<TransferResponse | null>(null);
  const [fetchingTestCode, setFetchingTestCode] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  // Transfers should only use Earning Wallet, not total balance
  // Use earnings.availableBalance (or earnings.balance) for transfers
  const availableBalance =
    wallet?.earnings?.availableBalance || wallet?.earnings?.balance || 0;
  const MIN_TRANSFER = 1;

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
      setError('');
      refetch();
    }
  }, [isOpen, refetch]);

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

  const handleProceedTo2FA = () => {
    const validation = transferApi.validateTransferAmount(
      parseFloat(amount),
      availableBalance
    );

    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount');
      return;
    }

    setError('');
    setStep('2fa');
  };

  const handleGetTestCode = async () => {
    setFetchingTestCode(true);
    setError('');

    try {
      const response = await transferApi.get2FACode();
      const testCode = response.data.codes.current;

      setTwoFACode(testCode);

      toast.success('Test code retrieved!', {
        description: `Code: ${testCode} (Valid for ${response.data.validFor})`,
        duration: 5000,
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get test code';
      setError(errorMessage);

      toast.error('Could not get test code', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setFetchingTestCode(false);
    }
  };

  const handleSubmitTransfer = async () => {
    if (!selectedUser) return;

    // Validate 2FA code
    const twoFAValidation = transferApi.validate2FACode(twoFACode);
    if (!twoFAValidation.isValid) {
      setError(twoFAValidation.error || 'Invalid 2FA code');
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
      const errorMessage = transferApi.formatErrorMessage(err);
      setError(errorMessage);

      toast.error('Transfer failed', {
        description: errorMessage,
        duration: 5000,
      });

      // Clear 2FA code on error to allow retry
      setTwoFACode('');
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border-border/50 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border shadow-2xl"
            >
              {/* Header */}
              <div className="from-accent via-accent to-accent/80 relative bg-gradient-to-br p-6">
                <div className="from-accent/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/10 p-3">
                      <Send className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Send USDT
                      </h2>
                      <p className="text-sm text-white/80">
                        Instant P2P transfer &bull; FREE
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 1: Search User */}
                {step === 'search' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
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
                    className="space-y-6"
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
                          Available: ${availableBalance.toFixed(2)}
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
                              ${parseFloat(amount).toFixed(2)}
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
                              ${parseFloat(amount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setStep('search')}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleProceedTo2FA}
                        disabled={!amount || parseFloat(amount) < MIN_TRANSFER}
                        className="bg-accent hover:bg-accent/90 flex-1"
                      >
                        Continue
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
                      <Alert className="bg-accent/10 border-accent">
                        <Shield className="text-accent h-4 w-4" />
                        <AlertDescription>
                          Enter your 2FA code to confirm this transfer
                        </AlertDescription>
                      </Alert>

                      {/* Confirmation Card */}
                      <div className="bg-muted space-y-4 rounded-xl p-6">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2 text-sm">
                            You&apos;re sending
                          </p>
                          <p className="text-foreground text-4xl font-bold">
                            ${parseFloat(amount).toFixed(2)}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            USDT
                          </p>
                        </div>

                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Send className="text-accent h-6 w-6" />
                          </motion.div>
                        </div>

                        <div className="text-center">
                          <p className="text-muted-foreground mb-2 text-sm">
                            To
                          </p>
                          <div className="bg-background inline-flex items-center gap-3 rounded-xl p-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <User className="text-primary h-5 w-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold">
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

                        <div className="space-y-2 border-t pt-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Transfer fee:
                            </span>
                            <span className="text-success font-semibold">
                              FREE
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Delivery time:
                            </span>
                            <span className="text-success font-semibold">
                              Instant
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2FA Code Input */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="twoFACode"
                          className="flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          2FA Authentication Code
                        </Label>
                        <Input
                          id="twoFACode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="Enter 6-digit code"
                          value={twoFACode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setTwoFACode(value);
                            setError('');
                          }}
                          className="text-center font-mono text-2xl tracking-widest"
                          autoFocus
                        />
                        <div className="flex items-center justify-between text-xs">
                          <p className="text-muted-foreground">
                            Enter the 6-digit code from your authenticator app
                          </p>
                          <Clock className="text-muted-foreground h-3 w-3" />
                        </div>
                      </div>

                      {/* Test Code Button (Development Only) */}
                      {process.env.NODE_ENV === 'development' && (
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          <AlertTitle className="text-amber-800 dark:text-amber-400">
                            Testing Mode
                          </AlertTitle>
                          <AlertDescription className="text-amber-700 dark:text-amber-500">
                            <p className="mb-2">
                              For development testing, you can get a test 2FA
                              code:
                            </p>
                            <Button
                              onClick={handleGetTestCode}
                              disabled={fetchingTestCode}
                              variant="outline"
                              size="sm"
                              className="w-full border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                            >
                              {fetchingTestCode ? (
                                <>
                                  <NovuntSpinner size="sm" className="mr-2" />
                                  Getting code...
                                </>
                              ) : (
                                <>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Get Test 2FA Code
                                </>
                              )}
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Sticky Footer with Buttons */}
                    <div className="bg-card sticky bottom-0 mt-4 flex gap-3 border-t pt-4">
                      <Button
                        onClick={() => setStep('amount')}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitTransfer}
                        disabled={loading || twoFACode.length !== 6}
                        className="bg-accent hover:bg-accent/90 flex-1"
                      >
                        {loading && (
                          <NovuntSpinner size="sm" className="mr-2" />
                        )}
                        Confirm Transfer
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 py-12 text-center"
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
                        ${parseFloat(amount).toFixed(2)} sent to{' '}
                        {selectedUser.email && selectedUser.email.includes('@')
                          ? selectedUser.email
                          : `@${selectedUser.username}`}
                      </p>
                    </div>

                    <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">
                          ${parseFloat(amount).toFixed(2)}
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

                    <div className="flex gap-3">
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
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
                        className="bg-accent hover:bg-accent/90 flex-1"
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
