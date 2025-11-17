'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';
import { useInitiateDeposit, pollDepositStatus } from '@/lib/mutations/transactionMutations';
import type { DepositResponse } from '@/lib/mutations/transactionMutations';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DepositStep = 'amount' | 'payment' | 'confirming' | 'success';

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
  const [network, setNetwork] = useState<'BEP20' | 'TRC20'>('BEP20');
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const pollCancelRef = useRef<(() => void) | null>(null);

  const MIN_DEPOSIT = 1; // Production mode: Real crypto testing with small amounts

  // Mutation hooks and query client for refreshing wallet balance
  const queryClient = useQueryClient();
  const initiateMutation = useInitiateDeposit();

  // Reset on open and cleanup on close
  useEffect(() => {
    if (isOpen) {
      setStep('amount');
      setAmount('');
      setNetwork('BEP20');
      setDepositData(null);
      setError('');
      setQrCodeUrl('');
    } else {
      // Cancel polling when modal closes
      if (pollCancelRef.current) {
        pollCancelRef.current();
        pollCancelRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (pollCancelRef.current) {
        pollCancelRef.current();
        pollCancelRef.current = null;
      }
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

  // Poll for deposit confirmation
  useEffect(() => {
    if (step === 'confirming' && depositData?.invoiceId) {
      // Start polling for deposit status using invoiceId
      const cancel = pollDepositStatus(
        depositData.invoiceId,
        // On update
        () => {
          // Status update callback (reserved for future use)
        },
        // On complete
        (status) => {
          if (status.status === 'confirmed' || status.status === 'completed') {
            // Refresh wallet balance when deposit is confirmed
            queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
            
            setStep('success');
            toast.success('Deposit confirmed!', {
              description: `${status.amount} USDT credited to your Funded Wallet`,
            });
          } else if (status.status === 'failed' || status.status === 'expired') {
            setError(`Deposit ${status.status}. Please try again.`);
            setStep('amount');
          }
        },
        // On error
        (error) => {
          console.error('Status check error:', error);
          toast.error('Failed to check deposit status');
        },
        30000 // Poll every 30 seconds (real mode)
      );
      
      // Stop polling after 1 hour
      const timeoutId = setTimeout(() => {
        cancel();
        if (step === 'confirming') {
          setError('Deposit timeout. Please check transaction status manually.');
          toast.error('Payment window expired', {
            description: 'Transaction may still complete. Check your wallet balance.',
          });
        }
      }, 3600000); // 1 hour
      
      pollCancelRef.current = () => {
        cancel();
        clearTimeout(timeoutId);
      };

      return () => {
        cancel();
        clearTimeout(timeoutId);
      };
    }
  }, [step, depositData, queryClient]);

  const handleInitiateDeposit = async () => {
    const amountNum = parseFloat(amount);
    
    if (amountNum < MIN_DEPOSIT) {
      setError(`Minimum deposit is ${MIN_DEPOSIT} USDT`);
      return;
    }

    setError('');

    try {
      console.log('[DepositModal] 🔄 Initiating deposit with amount:', amountNum, 'network:', network);
      
      const response = await initiateMutation.mutateAsync({
        amount: amountNum,
        currency: 'USDT',
        network: network,
      });

      console.log('[DepositModal] ✅ Deposit initiated successfully:', response);
      console.log('[DepositModal] 📊 Response status:', response?.status);
      console.log('[DepositModal] 📦 Full response object:', JSON.stringify(response, null, 2));
      
      // Extract deposit address from various possible field names
      // NowPayments API uses 'pay_address', some backends might use 'address' or 'paymentAddress'
      const depositAddress = response.depositAddress 
        || response.pay_address 
        || response.payAddress 
        || response.address 
        || response.paymentAddress;
      
      console.log('[DepositModal] 🔍 Extracted address:', depositAddress);
      console.log('[DepositModal] 🔍 Available fields:', Object.keys(response));
      
      if (!depositAddress || depositAddress === '') {
        console.error('[DepositModal] ❌ CRITICAL: No deposit address in backend response!');
        console.error('[DepositModal] ❌ Backend must return one of: depositAddress, pay_address, payAddress, address');
        console.error('[DepositModal] ❌ Response fields:', Object.keys(response));
        throw new Error('Backend did not return a deposit address. Backend is not calling NowPayments API correctly.');
      }
      
      // Normalize the response to use depositAddress
      const finalDepositData = {
        ...response,
        depositAddress: depositAddress,
      };
      
      setDepositData(finalDepositData);
      
      // Show payment screen with QR code and address
      console.log('[DepositModal] 📄 Showing payment step (status:', response?.status, ')');
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border/50 overflow-y-auto my-8"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary-foreground/10">
                      <Download className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-primary-foreground">
                        Deposit USDT
                      </h2>
                      <p className="text-sm text-primary-foreground/80">
                        Add funds to your wallet
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Step 1: Amount Input */}
                {step === 'amount' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Minimum deposit: <strong>{MIN_DEPOSIT} USDT</strong>
                        <br />
                        Supported networks: <strong>BEP20, TRC20</strong>
                        <br />
                        Confirmation time: <strong>5-15 minutes</strong>
                        <br />
                        <span className="text-amber-600 font-semibold">⚠️ Real cryptocurrency - verify address before sending!</span>
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

                    <div className="space-y-2">
                      <Label htmlFor="network">Network</Label>
                      <select
                        id="network"
                        value={network}
                        onChange={(e) => setNetwork(e.target.value as 'BEP20' | 'TRC20')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="BEP20">BEP20 (Binance Smart Chain)</option>
                        <option value="TRC20">TRC20 (TRON)</option>
                      </select>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="bg-muted p-4 rounded-xl space-y-2 text-sm">
                      <p className="font-semibold">How it works:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Enter deposit amount</li>
                        <li>Send USDT to the provided address</li>
                        <li>Wait for blockchain confirmation</li>
                        <li>Funds credited to your Deposit Wallet</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleInitiateDeposit}
                      disabled={initiateMutation.isPending || parseFloat(amount) < MIN_DEPOSIT}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {initiateMutation.isPending && <NovuntSpinner size="sm" className="mr-2" />}
                      Generate Payment Address
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Payment Address */}
                {step === 'payment' && depositData && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <Alert className="bg-secondary/10 border-secondary">
                      <AlertCircle className="h-4 w-4 text-secondary" />
                      <AlertDescription className="text-secondary-foreground">
                        Send <strong>{depositData.amount} USDT</strong> to the address below using <strong>{depositData.network}</strong> network
                      </AlertDescription>
                    </Alert>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div className="flex justify-center p-6 bg-muted rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeUrl}
                          alt="Deposit Address QR Code"
                          className="w-64 h-64 rounded-xl"
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
                          onClick={() => copyToClipboard(depositData.depositAddress)}
                        >
                          {copied ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Instructions from backend */}
                    {depositData.instructions && (
                      <div className="bg-muted p-4 rounded-xl space-y-2 text-sm">
                        <p className="font-semibold">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>{depositData.instructions.step1}</li>
                          <li>{depositData.instructions.step2}</li>
                          <li>{depositData.instructions.step3}</li>
                          <li>{depositData.instructions.step4}</li>
                        </ol>
                      </div>
                    )}

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Warning:</strong> Only send USDT via {depositData.network} network. Sending other tokens or using wrong network will result in loss of funds.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Button
                        onClick={() => setStep('confirming')}
                        className="w-full bg-secondary hover:bg-secondary/90"
                        size="lg"
                      >
                        I&apos;ve Sent the Payment
                      </Button>
                      
                      <p className="text-xs text-center text-muted-foreground">
                        ⏱️ Confirmation takes 5-15 minutes. Your balance will update automatically.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirming */}
                {step === 'confirming' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-6"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="inline-flex p-6 rounded-full bg-primary/10"
                    >
                      <NovuntSpinner size="lg" />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Waiting for Confirmation
                      </h3>
                      <p className="text-muted-foreground">
                        This usually takes 5-15 minutes
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Don&apos;t close this window. We&apos;ll notify you when confirmed.
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>✓ Transaction broadcasted to blockchain</p>
                      <p>⏳ Waiting for network confirmations...</p>
                      <p className="text-xs">Invoice ID: {depositData?.invoiceId}</p>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
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
                        Deposit Confirmed!
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {amount} USDT has been credited to your Funded Wallet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your balance has been updated
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">{amount} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-semibold">{network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-success font-semibold">✓ Completed</span>
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
                          onClose();
                          // Navigate to stakes page
                          window.location.href = '/dashboard/stakes';
                        }}
                        className="flex-1 bg-primary hover:bg-primary/90"
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

