'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Lock,
  Check,
  Edit,
  Info,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useDefaultWithdrawalAddress,
  useSetDefaultWithdrawalAddress,
} from '@/hooks/useWallet';
import { MoratoriumCountdown } from './MoratoriumCountdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import {
  validateWalletAddress,
  generateTestWalletAddress,
} from '@/lib/utils/wallet';
import { toast } from '@/components/ui/enhanced-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/accessibility';

/**
 * Withdrawal Address Manager Component
 * Allows users to view and manage their withdrawal address with moratorium status
 */
export function WithdrawalAddressManager() {
  const reducedMotion = prefersReducedMotion();
  const queryClient = useQueryClient();
  const {
    data: addressData,
    isLoading,
    refetch: refetchAddress,
  } = useDefaultWithdrawalAddress();
  const setDefaultAddress = useSetDefaultWithdrawalAddress();

  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  const address = addressData?.address;
  const hasAddress = addressData?.hasDefaultAddress ?? false;
  const canChange = addressData?.canChange ?? true;
  const moratorium = addressData?.moratorium;

  // Determine if we should show address view
  // CRITICAL: If address string exists and is valid, we MUST show it (unless editing)
  const hasAddressValue = Boolean(
    address && typeof address === 'string' && address.trim().length > 0
  );
  // Show address view if: address exists OR (hasDefaultAddress flag is true), AND we're not editing
  const shouldShowAddress = (hasAddressValue || hasAddress) && !isEditing;

  // Debug logging - CRITICAL for diagnosing display issues
  React.useEffect(() => {
    console.log('[WithdrawalAddressManager] 🔍 Address Display State:', {
      addressData,
      address,
      addressType: typeof address,
      addressLength: address?.length,
      hasAddress,
      hasAddressValue,
      shouldShowAddress,
      canChange,
      isEditing,
      moratorium,
      WILL_SHOW_ADDRESS: shouldShowAddress,
    });
  }, [
    addressData,
    address,
    hasAddress,
    hasAddressValue,
    shouldShowAddress,
    canChange,
    isEditing,
    moratorium,
  ]);

  const handleEdit = () => {
    // Auto-expand card when editing
    setIsOpen(true);
    if (!canChange) {
      if (moratorium?.active) {
        toast.error('Address change locked', {
          description: `Please wait ${moratorium.hoursRemaining} hour(s) and ${moratorium.minutesRemaining} minute(s). For security, addresses can only be changed every 48 hours.`,
          duration: 6000,
        });
      } else {
        toast.error('Cannot change address', {
          description:
            'You cannot change your withdrawal address at this time.',
        });
      }
      return;
    }
    setIsEditing(true);
    setNewAddress(address || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewAddress('');
    setTwoFACode('');
  };

  const handleSave = async (codeFromInput?: string) => {
    // Use code from input if provided (from onComplete callback), otherwise use state
    const codeToUse = codeFromInput || twoFACode;

    if (!newAddress.trim()) {
      toast.error('Address required', {
        description: 'Please enter a wallet address',
      });
      return;
    }

    // Validate BEP20 address format
    const validation = validateWalletAddress(newAddress, 'BEP20');
    if (!validation.valid) {
      toast.error('Invalid BEP20 address', {
        description:
          validation.error || 'Please enter a valid BSC wallet address',
      });
      return;
    }

    if (!codeToUse || codeToUse.length !== 6) {
      toast.error('2FA code required', {
        description:
          'Please enter the 6-digit code from your authenticator app',
      });
      return;
    }

    try {
      const response = await setDefaultAddress.mutateAsync({
        address: newAddress,
        network: 'BEP20',
        twoFACode: codeToUse,
      });

      // Backend now returns the address correctly, so we can use the response directly
      if (response?.data) {
        // Update cache immediately with response data (backend now includes address)
        queryClient.setQueryData(
          ['withdrawal', 'default-address'],
          response.data
        );
      }

      // Close edit mode
      setIsEditing(false);
      setNewAddress('');
      setTwoFACode('');

      // Show success message
      const savedAddress = response?.data?.address || newAddress;
      toast.success('Withdrawal address set successfully', {
        description: savedAddress
          ? `Your withdrawal address has been saved: ${savedAddress.substring(0, 10)}...`
          : 'Your withdrawal address has been saved successfully.',
      });

      // Refetch to ensure we have the latest data (including moratorium status)
      await queryClient.invalidateQueries({
        queryKey: ['withdrawal', 'default-address'],
      });
      await refetchAddress();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('[WithdrawalAddressManager] Error setting address:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Withdrawal Address Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap sm:gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="hover:bg-muted/50 focus:ring-ring -ml-2 flex w-full items-start gap-2 rounded-md p-2 text-left transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:gap-3"
              >
                <Shield className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="truncate">
                      Withdrawal Address Security
                    </span>
                    {isOpen ? (
                      <ChevronUp className="text-muted-foreground h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2 text-xs sm:text-sm">
                    {hasAddress && address && typeof address === 'string'
                      ? `Address: ${address.substring(0, 10)}...${address.substring(address.length - 6)}`
                      : 'Manage your withdrawal address - Protected by 48-hour moratorium'}
                  </CardDescription>
                </div>
              </button>
            </CollapsibleTrigger>
            {hasAddress && !isEditing && canChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="mt-2 flex w-full shrink-0 items-center gap-2 sm:mt-0 sm:w-auto"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Change</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6">
            {isEditing ? (
              // Editing mode - show edit form (for both new and existing addresses)
              hasAddressValue ? (
                // Editing existing address
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Alert className="bg-secondary/10 border-secondary/30">
                    <AlertTriangle className="text-secondary h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="text-foreground font-semibold">
                          Change Withdrawal Address
                        </p>
                        <p className="text-muted-foreground text-sm">
                          After changing your address, you&apos;ll need to wait{' '}
                          <strong>48 hours</strong> before you can change it
                          again.
                        </p>
                        <div className="bg-secondary/20 mt-2 rounded-md p-2">
                          <p className="text-foreground text-xs">
                            <Shield className="mr-1 inline h-3 w-3" />
                            <strong>Security Protection:</strong> This 48-hour
                            moratorium protects you from hackers who might gain
                            access to your account and attempt to change your
                            withdrawal address to steal your funds.
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="current-address">Current Address</Label>
                    <Input
                      id="current-address"
                      type="text"
                      value={address || ''}
                      disabled
                      className="mt-2 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-address">
                      New BEP20 (BSC) Wallet Address
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="new-address"
                        type="text"
                        placeholder="0x..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const testAddress =
                            generateTestWalletAddress('BEP20');
                          setNewAddress(testAddress);
                        }}
                      >
                        Generate Test
                      </Button>
                    </div>
                    {newAddress && (
                      <p className="mt-1 text-xs">
                        {validateWalletAddress(newAddress, 'BEP20').valid ? (
                          <span className="text-success">
                            ✓ Valid BEP20 address
                          </span>
                        ) : (
                          <span className="text-destructive">
                            {validateWalletAddress(newAddress, 'BEP20').error}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="2fa-edit">2FA Code (Required)</Label>
                    <div className="mt-2">
                      <TwoFactorInput
                        value={twoFACode}
                        onChange={setTwoFACode}
                        onComplete={handleSave}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSave()}
                      disabled={
                        setDefaultAddress.isPending ||
                        !newAddress ||
                        twoFACode.length !== 6 ||
                        newAddress === address
                      }
                      className="flex-1"
                    >
                      {setDefaultAddress.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Address'
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Setting new address
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={reducedMotion ? false : { opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">
                        Set Your Withdrawal Address
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        This address will be used for all withdrawals. You can
                        change it after a 48-hour waiting period.
                      </p>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="address">BEP20 (BSC) Wallet Address</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="address"
                        type="text"
                        placeholder="0x..."
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const testAddress =
                            generateTestWalletAddress('BEP20');
                          setNewAddress(testAddress);
                        }}
                      >
                        Generate Test
                      </Button>
                    </div>
                    {newAddress && (
                      <p className="mt-1 text-xs">
                        {validateWalletAddress(newAddress, 'BEP20').valid ? (
                          <span className="text-success">
                            ✓ Valid BEP20 address
                          </span>
                        ) : (
                          <span className="text-destructive">
                            {validateWalletAddress(newAddress, 'BEP20').error}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="2fa">2FA Code (Required)</Label>
                    <div className="mt-2">
                      <TwoFactorInput
                        value={twoFACode}
                        onChange={setTwoFACode}
                        onComplete={handleSave}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSave()}
                      disabled={
                        setDefaultAddress.isPending ||
                        !newAddress ||
                        twoFACode.length !== 6
                      }
                      className="flex-1"
                    >
                      {setDefaultAddress.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting...
                        </>
                      ) : (
                        'Set Address'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            ) : shouldShowAddress ? (
              // Address is set, viewing status
              <div className="space-y-4">
                <Alert className="bg-success/10 border-success/20">
                  <Check className="text-success h-4 w-4" />
                  <AlertDescription>
                    <p className="text-success font-semibold">
                      ✓ Withdrawal Address Configured
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Your withdrawal address has been successfully set and will
                      be used for all future withdrawals.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="bg-muted border-primary/20 rounded-lg border-2 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="text-base font-bold">
                      Current Withdrawal Address
                    </Label>
                    <div className="flex items-center gap-2">
                      {canChange ? (
                        <div className="text-success bg-success/20 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Check className="h-3 w-3" />
                          Can Change
                        </div>
                      ) : (
                        <div className="text-secondary bg-secondary/20 flex items-center gap-1 rounded-full px-2 py-1 text-xs">
                          <Lock className="h-3 w-3" />
                          Locked
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-background border-border rounded-md border p-3">
                    <p className="text-foreground font-mono text-base font-semibold break-all">
                      {address}
                    </p>
                  </div>
                </div>

                {/* Moratorium Status */}
                {moratorium?.active && !canChange && (
                  <MoratoriumCountdown
                    moratorium={moratorium}
                    onExpired={() => {
                      queryClient.invalidateQueries({
                        queryKey: ['withdrawal', 'default-address'],
                      });
                    }}
                  />
                )}

                {canChange && (
                  <Alert className="bg-success/10 border-success/20">
                    <Check className="text-success h-4 w-4" />
                    <AlertDescription>
                      <p className="text-sm">
                        You can change this address at any time. After changing,
                        you&apos;ll need to wait 48 hours before changing it
                        again. This security measure protects you from hackers
                        attempting to steal your funds.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Security Explanation */}
                <Alert className="bg-muted border-border">
                  <Shield className="text-primary h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <p className="text-foreground mb-1 font-semibold">
                          🔒 48-Hour Security Protection
                        </p>
                        <p className="text-muted-foreground text-sm">
                          <strong>Why the wait?</strong> The 48-hour moratorium
                          protects you from hackers who might gain unauthorized
                          access to your account and attempt to change your
                          withdrawal address to steal your funds.
                        </p>
                      </div>
                      <div className="bg-muted/50 space-y-1 rounded-md p-3">
                        <p className="text-foreground text-xs font-semibold">
                          How it protects you:
                        </p>
                        <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-xs">
                          <li>
                            Prevents rapid address changes that could indicate
                            account compromise
                          </li>
                          <li>
                            Gives you time to detect and report unauthorized
                            access
                          </li>
                          <li>
                            All address changes require 2FA verification for
                            additional security
                          </li>
                          <li>
                            Withdrawals continue using your current address
                            during the waiting period
                          </li>
                        </ul>
                      </div>
                      <div className="pt-1">
                        <p className="text-muted-foreground text-xs">
                          <AlertTriangle className="mr-1 inline h-3 w-3" />
                          <strong>Important:</strong> Always monitor your
                          account for unexpected address changes. If you notice
                          a change you didn&apos;t make, contact support
                          immediately.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              // No address set - show setup form
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">No withdrawal address set</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      You need to set a withdrawal address before you can make
                      withdrawals.
                    </p>
                  </AlertDescription>
                </Alert>

                {/* Security Explanation for First-Time Setup */}
                <Alert className="bg-primary/10 border-primary/30">
                  <Shield className="text-primary h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="text-foreground mb-1 font-semibold">
                        🔒 Security Notice
                      </p>
                      <p className="text-muted-foreground text-sm">
                        After setting your withdrawal address, any future
                        changes will require a{' '}
                        <strong>48-hour waiting period</strong>. This security
                        measure protects you from hackers who might gain
                        unauthorized access to your account and try to change
                        your withdrawal address to steal your funds.
                      </p>
                      <div className="bg-primary/20 mt-2 rounded-md p-2">
                        <p className="text-foreground text-xs">
                          <strong>Protection:</strong> The 48-hour moratorium
                          gives you time to detect and report any unauthorized
                          address changes, preventing hackers from quickly
                          stealing your funds.
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleEdit} className="w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  Set Withdrawal Address
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
