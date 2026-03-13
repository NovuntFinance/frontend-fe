'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  Shield,
  Loader2,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { transferApi } from '@/services/transferApi';
import type { TransferResponse } from '@/types/transfer';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';
import { useTransferLimits } from '@/hooks/useTransferLimits';
import { fmt4 } from '@/utils/formatters';
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

  const debouncedSearch = useDebounce(searchQuery, 500);
  // Transfers should only use Earnings Wallet, not total balance
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
    <BaseModal isOpen={isOpen} onClose={onClose}>
      {step === 'search' && (
        <>
          <ModalHeader
            title="Send USDT"
            subtitle="Instant P2P transfer • FREE"
            onClose={onClose}
          />
          <ModalBody>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              <div className="rounded-xl p-4" style={insetStyle}>
                <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                  Available to Send
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: NEU_TOKENS.accent }}
                >
                  $
                  {availableBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className="mt-1 text-xs"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  From Earnings Wallet
                </p>
              </div>

              <InfoCallout
                icon={
                  <CheckCircle2
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                }
                title="Instant & FREE"
                description="No fees, instant delivery, available 24/7"
              />

              <div className="space-y-1.5">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Find Recipient
                </Label>
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 size-5 -translate-y-1/2"
                    style={{ color: NEU_TOKENS.white40 }}
                  />
                  <Input
                    id="search"
                    type={searchQuery.includes('@') ? 'email' : 'text'}
                    placeholder="Enter email, username, or user ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="neu-input border-0 pl-10 focus-visible:ring-0"
                  />
                  {searchLoading && (
                    <NovuntSpinner
                      size="sm"
                      className="absolute top-1/2 right-3 -translate-y-1/2"
                    />
                  )}
                </div>
                <p className="text-xs" style={{ color: NEU_TOKENS.white40 }}>
                  You can send to a user by entering their email address,
                  username, or user ID
                </p>
              </div>

              {searchQuery.length >= 2 && (
                <div className="space-y-2">
                  {searchQuery.trim().length >= 3 && !searchLoading && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        const trimmedQuery = searchQuery.trim();
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
                      className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-colors"
                      style={{ ...raisedStyle, borderColor: NEU_TOKENS.border }}
                    >
                      <div className="rounded-full p-3" style={insetStyle}>
                        <User
                          className="size-5"
                          style={{ color: NEU_TOKENS.accent }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate font-semibold"
                          style={{ color: NEU_TOKENS.white80 }}
                        >
                          {searchQuery.trim().includes('@')
                            ? searchQuery.trim()
                            : `@${searchQuery.trim()}`}
                        </p>
                        <p
                          className="truncate text-sm"
                          style={{ color: NEU_TOKENS.white60 }}
                        >
                          {searchQuery.trim().includes('@')
                            ? 'Send to email address'
                            : /^[0-9a-fA-F]{24}$/.test(searchQuery.trim())
                              ? 'Send to user ID'
                              : 'Send to new recipient'}
                        </p>
                      </div>
                      <Send
                        className="size-4"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                    </motion.button>
                  )}
                  {searchQuery.trim().length < 3 && !searchLoading && (
                    <div
                      className="rounded-xl p-6 text-center"
                      style={insetStyle}
                    >
                      <p
                        className="text-sm"
                        style={{ color: NEU_TOKENS.white60 }}
                      >
                        Type at least 3 characters, an email address, or a user
                        ID to add a new recipient
                      </p>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p
                        className="px-2 text-xs font-semibold tracking-wide uppercase"
                        style={{ color: NEU_TOKENS.white60 }}
                      >
                        Past Recipients
                      </p>
                      {searchResults.map((user) => (
                        <motion.button
                          key={user.userId || user.username}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleSelectUser(user)}
                          className="flex w-full items-center gap-4 rounded-xl p-4 text-left transition-colors"
                          style={raisedStyle}
                        >
                          <div className="rounded-full p-3" style={insetStyle}>
                            <User
                              className="size-5"
                              style={{ color: NEU_TOKENS.accent }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate font-semibold"
                              style={{ color: NEU_TOKENS.white80 }}
                            >
                              @{user.username}
                            </p>
                            <p
                              className="truncate text-sm"
                              style={{ color: NEU_TOKENS.white60 }}
                            >
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
                <div
                  className="p-12 text-center"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  <Search className="mx-auto mb-4 size-12 opacity-30" />
                  <p className="text-sm">Start typing to search for users</p>
                </div>
              )}
            </motion.div>
          </ModalBody>
        </>
      )}

      {step === 'amount' && selectedUser && (
        <>
          <ModalHeader
            title="Send USDT"
            subtitle="Enter amount and note"
            onClose={onClose}
          />
          <ModalBody>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              <div className="rounded-xl p-4" style={insetStyle}>
                <p
                  className="mb-2 text-xs"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Sending to:
                </p>
                <div className="flex items-center gap-3">
                  <div className="rounded-full p-2" style={insetStyle}>
                    <User
                      className="size-5"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {selectedUser.email && selectedUser.email.includes('@')
                        ? selectedUser.email
                        : `@${selectedUser.username}`}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      {selectedUser.email && selectedUser.email.includes('@')
                        ? 'Email address'
                        : selectedUser.displayName}
                    </p>
                  </div>
                </div>
                <SecondaryButton
                  onClick={() => setStep('search')}
                  className="mt-2 text-xs"
                >
                  Change recipient
                </SecondaryButton>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label
                    htmlFor="amount"
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Amount (USDT)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toString())}
                    className="text-xs font-semibold"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    Send max
                  </button>
                </div>
                <Input
                  id="amount"
                  type="number"
                  min={MIN_TRANSFER}
                  max={availableBalance}
                  step="0.01"
                  placeholder={`Enter amount (min ${MIN_TRANSFER} USDT)`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="neu-input h-12 w-full border-0 text-lg focus-visible:ring-0"
                  autoFocus
                />
                <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                  Available: ${fmt4(availableBalance)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="memo"
                  className="text-sm font-medium"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Note (Optional)
                </Label>
                <Input
                  id="memo"
                  type="text"
                  maxLength={200}
                  placeholder="Add a note for this transfer..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="neu-input w-full border-0 focus-visible:ring-0"
                />
                <p className="text-xs" style={{ color: NEU_TOKENS.white40 }}>
                  {memo.length}/200 characters
                </p>
              </div>

              {parseFloat(amount) >= MIN_TRANSFER && (
                <div className="rounded-xl p-4" style={insetStyle}>
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2
                      className="size-4"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: NEU_TOKENS.accent }}
                    >
                      FREE Transfer
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: NEU_TOKENS.white60 }}>Amount:</span>
                      <span
                        className="font-semibold"
                        style={{ color: NEU_TOKENS.white80 }}
                      >
                        ${fmt4(parseFloat(amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: NEU_TOKENS.white60 }}>Fee:</span>
                      <span
                        className="font-semibold"
                        style={{ color: NEU_TOKENS.accent }}
                      >
                        $0.00 (FREE)
                      </span>
                    </div>
                    <div
                      className="my-2 h-px"
                      style={{ background: NEU_TOKENS.border }}
                    />
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={{ color: NEU_TOKENS.white80 }}
                      >
                        Recipient receives:
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: NEU_TOKENS.accent }}
                      >
                        ${fmt4(parseFloat(amount))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="neu-error text-xs font-medium">{error}</p>
              )}

              <ModalFooter className="flex flex-row gap-3 pt-2">
                <Button
                  onClick={() => setStep('search')}
                  variant="outline"
                  className="h-11 flex-1 border-0"
                  style={raisedStyle}
                >
                  <span style={{ color: NEU_TOKENS.white60 }}>Back</span>
                </Button>
                <PrimaryButton
                  onClick={handleProceedTo2FA}
                  disabled={!amount || parseFloat(amount) < MIN_TRANSFER}
                  className="h-11 flex-1"
                >
                  Continue
                </PrimaryButton>
              </ModalFooter>
            </motion.div>
          </ModalBody>
        </>
      )}

      {step === '2fa' && selectedUser && (
        <>
          <ModalHeader
            title="Send USDT"
            subtitle="Confirm with 2FA"
            onClose={onClose}
          />
          <ModalBody className="!max-h-none !overflow-visible">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="space-y-2 rounded-xl p-4" style={insetStyle}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="shrink-0 rounded-full p-2"
                      style={raisedStyle}
                    >
                      <Send
                        className="size-4"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-xs"
                        style={{ color: NEU_TOKENS.white60 }}
                      >
                        Sending
                      </p>
                      <p
                        className="truncate text-xl font-bold"
                        style={{ color: NEU_TOKENS.accent }}
                      >
                        ${fmt4(parseFloat(amount))} USDT
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      To
                    </p>
                    <p
                      className="max-w-[140px] truncate text-sm font-medium"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {selectedUser.email && selectedUser.email.includes('@')
                        ? selectedUser.email
                        : `@${selectedUser.username}`}
                    </p>
                  </div>
                </div>
                <div
                  className="flex justify-between pt-1 text-xs"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  <span>Fee: FREE</span>
                  <span>Delivery: Instant</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="twoFACode"
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  <Shield
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                  Two-Factor Authentication
                </Label>
                <Input
                  id="twoFACode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => {
                    setTwoFACode(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  className="neu-input h-12 border-0 text-center font-mono text-2xl tracking-[0.4em] focus-visible:ring-0"
                  autoFocus
                />
                <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <p className="neu-error text-xs font-medium">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  onClick={() => setStep('amount')}
                  variant="outline"
                  className="h-10 flex-1 border-0"
                  style={raisedStyle}
                >
                  <span style={{ color: NEU_TOKENS.white60 }}>Back</span>
                </Button>
                <PrimaryButton
                  onClick={handleSubmitTransfer}
                  disabled={loading || twoFACode.length !== 6}
                  loading={loading}
                  className="h-10 flex-1"
                >
                  {loading ? 'Processing...' : 'Confirm Transfer'}
                </PrimaryButton>
              </div>
            </motion.div>
          </ModalBody>
        </>
      )}

      {step === 'success' && selectedUser && (
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
            Transfer Successful!
          </h3>
          <p className="text-lg" style={{ color: NEU_TOKENS.white60 }}>
            ${fmt4(parseFloat(amount))} sent to{' '}
            {selectedUser.email && selectedUser.email.includes('@')
              ? selectedUser.email
              : `@${selectedUser.username}`}
          </p>
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
                ${fmt4(parseFloat(amount))}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Recipient:</span>
              <span
                className="font-semibold"
                style={{ color: NEU_TOKENS.white80 }}
              >
                {selectedUser.email && selectedUser.email.includes('@')
                  ? selectedUser.email
                  : `@${selectedUser.username}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Fee:</span>
              <span
                className="font-semibold"
                style={{ color: NEU_TOKENS.accent }}
              >
                FREE
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: NEU_TOKENS.white60 }}>Transaction ID:</span>
              <span
                className="font-mono text-xs"
                style={{ color: NEU_TOKENS.white80 }}
              >
                {transferResponse?.txId}
              </span>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SecondaryButton onClick={onClose} className="sm:min-w-[120px]">
              Close
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                setStep('search');
                setSearchQuery('');
                setSelectedUser(null);
                setAmount('');
              }}
              className="sm:min-w-[140px]"
            >
              Send Again
            </PrimaryButton>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
