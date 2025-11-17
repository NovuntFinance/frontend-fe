'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Search, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { useInitiateP2PTransfer, useSearchUsers } from '@/lib/mutations/transactionMutations';
import type { P2PTransferResponse } from '@/lib/mutations/transactionMutations';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Using the API type, but keeping a local display interface
interface DisplayUser {
  userId: string;
  username: string;
  displayName: string;
}

type TransferStep = 'search' | 'amount' | 'confirm' | 'success';

/**
 * Transfer Modal - P2P Transfer Flow
 * Step 1: Search for recipient
 * Step 2: Enter amount
 * Step 3: Confirm transfer
 * Step 4: Success!
 */
export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { data: wallet, refetch } = useWalletBalance();
  const [step, setStep] = useState<TransferStep>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DisplayUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<DisplayUser | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [transferResponse, setTransferResponse] = useState<P2PTransferResponse | null>(null);

  // Mutation hooks
  const searchMutation = useSearchUsers();
  const transferMutation = useInitiateP2PTransfer();

  const debouncedSearch = useDebounce(searchQuery, 500);
  const availableBalance = wallet?.earnings?.availableBalance || 0;
  const MIN_TRANSFER = 1;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setAmount('');
      setError('');
      refetch();
    }
  }, [isOpen, refetch]);

  // Search users
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const results = await searchMutation.mutateAsync(debouncedSearch);
        
        // Convert API results to display format
        const displayUsers: DisplayUser[] = results.map(user => ({
          userId: user.userId,
          username: user.username,
          displayName: `${user.firstName} ${user.lastName}`.trim() || user.username,
        }));
        
        setSearchResults(displayUsers);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
    };

    searchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Only depend on debouncedSearch, not searchMutation

  const handleSelectUser = (user: DisplayUser) => {
    setSelectedUser(user);
    setStep('amount');
  };

  const validateTransfer = () => {
    const transferAmount = parseFloat(amount);

    if (transferAmount < MIN_TRANSFER) {
      setError(`Minimum transfer is ${MIN_TRANSFER} USDT`);
      return false;
    }
    if (transferAmount > availableBalance) {
      setError('Insufficient balance in Earnings Wallet');
      return false;
    }
    return true;
  };

  const handleSubmitTransfer = async () => {
    if (!validateTransfer() || !selectedUser) return;

    setError('');

    try {
      const response = await transferMutation.mutateAsync({
        recipientUserId: selectedUser.userId,
        amount: parseFloat(amount),
        note: undefined, // Optional memo field
        // No currency field needed - backend always uses USDT
      });

      setTransferResponse(response);
      setStep('success');
      
      toast.success('Transfer successful!', {
        description: `Sent ${amount} USDT to @${selectedUser.username} instantly`,
      });
      
      // Refresh wallet balance
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
      setError(errorMessage);
      toast.error('Transfer failed', {
        description: errorMessage,
      });
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
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
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
              <div className="p-6">
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
                          placeholder="Search by username or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        {searchMutation.isPending && (
                          <NovuntSpinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <div className="space-y-2">
                        {searchResults.length === 0 && !searchMutation.isPending && (
                          <div className="p-8 text-center text-muted-foreground">
                            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No users found</p>
                          </div>
                        )}

                        {searchResults.map((user) => (
                          <motion.button
                            key={user.userId}
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
                        onClick={() => {
                          if (validateTransfer()) {
                            setStep('confirm');
                          }
                        }}
                        disabled={!amount || parseFloat(amount) < MIN_TRANSFER}
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirmation */}
                {step === 'confirm' && selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <Alert className="bg-accent/10 border-accent">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <AlertDescription>
                        Review your transfer details
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

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setStep('amount')}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmitTransfer}
                        disabled={transferMutation.isPending}
                        className="flex-1 bg-accent hover:bg-accent/90"
                      >
                        {transferMutation.isPending && <NovuntSpinner size="sm" className="mr-2" />}
                        Send Now
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

