'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Lock,
  Check,
  Shield,
  AlertTriangle,
  ChevronRight,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Loader2,
  Info,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useDefaultWithdrawalAddress,
  useSetDefaultWithdrawalAddress,
} from '@/hooks/useWallet';
import { toast } from '@/components/ui/enhanced-toast';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';

/**
 * Hardened Withdrawal Address Manager
 * Enforces BEP20 network and 72-hour security moratorium
 */
export function WithdrawalAddressManager() {
  const { data: addressData, isLoading } = useDefaultWithdrawalAddress();
  const { mutate: setAddress, isPending } = useSetDefaultWithdrawalAddress();

  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (addressData?.address) {
      setNewAddress(addressData.address);
    }
  }, [addressData]);

  const handleCopy = () => {
    if (addressData?.address) {
      copyToClipboard(addressData.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddress.startsWith('0x') || newAddress.length < 42) {
      toast.error('Invalid BEP20 Address', {
        description:
          'Please enter a valid Binance Smart Chain (BEP20) address starting with 0x.',
      });
      return;
    }

    setAddress(
      {
        address: newAddress,
        network: 'BEP20',
        twoFACode: twoFACode || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setTwoFACode('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </CardContent>
      </Card>
    );
  }

  // Show read-only when we have an address (even if hasDefaultAddress flag is missing)
  const hasAddress = addressData?.hasDefaultAddress || !!addressData?.address;
  const moratorium = addressData?.moratorium;
  const canChange = addressData?.canChange && !moratorium?.active;

  return (
    <Card className="group relative overflow-hidden border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition-all group-hover:bg-cyan-500/20" />

      <CardHeader className="relative border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                Withdrawal Whitelist
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Secure BEP20 withdrawal destination
              </CardDescription>
            </div>
          </div>
          {hasAddress && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              disabled={!canChange}
              onClick={() => setIsEditing(true)}
              className={cn(
                'rounded-lg border border-white/10 hover:bg-white/10',
                !canChange && 'cursor-not-allowed opacity-50'
              )}
            >
              <Edit className="mr-2 h-3 w-3" />
              Modify
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative py-6">
        {/* Moratorium Alert */}
        {moratorium?.active && (
          <Alert className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock className="h-4 w-4" />
            <AlertTitle className="text-sm font-bold">
              Security Hold Active
            </AlertTitle>
            <AlertDescription className="text-xs opacity-80">
              Address changed recently. For security, withdrawals are locked for
              72 hours. Remaining:{' '}
              <span className="font-bold">
                {moratorium.hoursRemaining}h {moratorium.minutesRemaining}m
              </span>
            </AlertDescription>
          </Alert>
        )}

        {isEditing || !hasAddress ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                BEP20 (BSC) Address
              </label>
              <Input
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                2FA Verification Code
              </label>
              <Input
                placeholder="Enter 6-digit code"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                maxLength={6}
                className="h-12 border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isPending || !newAddress}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 font-bold hover:from-cyan-500 hover:to-blue-500"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hasAddress ? 'Update Address' : 'Whitelist Address'}
              </Button>
              {hasAddress && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setNewAddress(addressData.address || '');
                  }}
                  className="rounded-xl border border-white/10 hover:bg-white/10"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                  Saved Address
                </span>
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  VERIFIED BEP20
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <code className="flex-1 font-mono text-sm break-all text-cyan-300">
                  {addressData.address}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-8 w-8 rounded-lg hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-500/5 p-3 text-[10px] text-blue-400/70">
              <Info className="h-3 w-3 shrink-0" />
              Security Note: Changing your withdrawal address triggers a 72-hour
              moratorium where withdrawals are disabled for your protection.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
