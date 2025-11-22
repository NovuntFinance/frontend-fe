'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Search, User, AlertCircle, CheckCircle2, Shield, Clock } from 'lucide-react';
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
  const [transferResponse, setTransferResponse] = useState<TransferResponse | null>(null);
  const [fetchingTestCode, setFetchingTestCode] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const availableBalance = (wallet?.funded?.balance || 0) + (wallet?.earnings?.balance || 0);
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
        const displayUsers: DisplayUser[] = results.map(user => ({
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
    const validation = transferApi.validateTransferAmount(parseFloat(amount), availableBalance);
    
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
      const response = await transferApi.transferFunds({
        recipientUsername: selectedUser.username,
        amount: parseFloat(amount),
        memo: memo || undefined,
        twoFACode: twoFACode,
      });

      setTransferResponse(response);
      setStep('success');
      
      toast.success('Transfer successful!', {
        description: `${amount} USDT sent to @${selectedUser.username}`,
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-accent via-accent to-accent/80 p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/10">
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
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Step 1: Search User */}
                {step === 'search' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Available Balance */}
                    <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Available to Send
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        ${availableBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From Earnings Wallet
                      </p>
                    </div>

                    {/* Info Alert */}
                    <Alert className="bg-success/10 border-success">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <AlertDescription>
                        <strong>Instant & FREE</strong> - No fees, instant delivery, available 24/7
                      </AlertDescription>
                    </Alert>

                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Find Recipient</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Type username to add new recipient..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      {searchLoading && (
                        <NovuntSpinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shows past recipients first, or type a username to send to someone new
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
                              // Allow selecting the typed username directly (new recipient)
                              const newUser: DisplayUser = {
                                userId: '', // Will be resolved by backend using username
                                username: searchQuery.trim().toLowerCase(),
                                displayName: searchQuery.trim(),
                              };
                              handleSelectUser(newUser);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                          >
                            <div className="p-3 rounded-full bg-primary/20">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">
                                @{searchQuery.trim()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Send to new recipient
                              </p>
                            </div>
                            <Send className="h-4 w-4 text-primary" />
                          </motion.button>
                        )}

                        {/* Show message if less than 3 characters */}
                        {searchQuery.trim().length < 3 && !searchLoading && (
                          <div className="p-6 text-center text-muted-foreground bg-muted/50 rounded-xl">
                            <p className="text-sm">Type at least 3 characters to add a new recipient</p>
                          </div>
                        )}

                        {/* Past Recipients Section */}
                        {searchResults.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                              Past Recipients
                            </p>
                            {searchResults.map((user) => (
                              <motion.button
                                key={user.userId || user.username}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleSelectUser(user)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border hover:bg-muted transition-colors text-left"
                              >
                                <div className="p-3 rounded-full bg-primary/10">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">
                                    @{user.username}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
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
                      <div className="p-12 text-center text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
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
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-xs text-muted-foreground mb-2">
                        Sending to:
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">@{selectedUser.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.displayName}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setStep('search')}
                        className="text-xs mt-2"
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
                          className="text-xs h-auto p-0"
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
                      <p className="text-xs text-muted-foreground">
                        {memo.length}/200 characters
                      </p>
                    </div>

                    {/* Fee Info */}
                    {parseFloat(amount) >= MIN_TRANSFER && (
                      <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <p className="font-semibold text-success">FREE Transfer</p>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fee:</span>
                            <span className="font-semibold text-success">$0.00 (FREE)</span>
                          </div>
                          <div className="h-px bg-border my-2" />
                          <div className="flex justify-between">
                            <span className="font-semibold">Recipient receives:</span>
                            <span className="font-bold text-lg text-success">
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
                        className="flex-1 bg-accent hover:bg-accent/90"
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
                    className="flex flex-col h-full"
                  >
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                    <Alert className="bg-accent/10 border-accent">
                      <Shield className="h-4 w-4 text-accent" />
                      <AlertDescription>
                        Enter your 2FA code to confirm this transfer
                      </AlertDescription>
                    </Alert>

                    {/* Confirmation Card */}
                    <div className="p-6 bg-muted rounded-xl space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          You&apos;re sending
                        </p>
                        <p className="text-4xl font-bold text-foreground">
                          ${parseFloat(amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          USDT
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Send className="h-6 w-6 text-accent" />
                        </motion.div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          To
                        </p>
                        <div className="inline-flex items-center gap-3 p-3 bg-background rounded-xl">
                          <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold">@{selectedUser.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedUser.displayName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transfer fee:</span>
                          <span className="font-semibold text-success">FREE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery time:</span>
                          <span className="font-semibold text-success">Instant</span>
                        </div>
                      </div>
                    </div>

                    {/* 2FA Code Input */}
                    <div className="space-y-2">
                      <Label htmlFor="twoFACode" className="flex items-center gap-2">
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
                        className="text-center text-2xl tracking-widest font-mono"
                        autoFocus
                      />
                      <div className="flex items-center justify-between text-xs">
                        <p className="text-muted-foreground">
                          Enter the 6-digit code from your authenticator app
                        </p>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Test Code Button (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                      <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        <AlertTitle className="text-amber-800 dark:text-amber-400">Testing Mode</AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-500">
                          <p className="mb-2">For development testing, you can get a test 2FA code:</p>
                          <Button
                            onClick={handleGetTestCode}
                            disabled={fetchingTestCode}
                            variant="outline"
                            size="sm"
                            className="w-full border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                          >
                            {fetchingTestCode ? (
                              <>
                                <NovuntSpinner size="sm" className="mr-2" />
                                Getting code...
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
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
                    <div className="flex gap-3 pt-4 mt-4 border-t bg-card sticky bottom-0">
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
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        {loading && <NovuntSpinner size="sm" className="mr-2" />}
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
                    className="py-12 text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="inline-flex p-6 rounded-full bg-success/10"
                    >
                      <CheckCircle2 className="h-12 w-12 text-success" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Transfer Successful!
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        ${parseFloat(amount).toFixed(2)} sent to @{selectedUser.username}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-semibold">@{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-semibold text-success">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs">{transferResponse?.transactionId}</span>
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
                        className="flex-1 bg-accent hover:bg-accent/90"
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

