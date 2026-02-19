'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  Check,
  X,
  Copy,
  RefreshCw,
  Mail as MessageIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/lib/authService';
import { useDisable2FA } from '@/lib/mutations';
import type { Generate2FASecretResponse } from '@/types/auth';

interface TwoFactorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorModal({
  open,
  onOpenChange,
  onEnable,
}: TwoFactorModalProps & { onEnable?: () => void }) {
  const { user } = useUser();
  const { updateUser } = useAuthStore();
  const disable2FAMutation = useDisable2FA();

  // Initialize isEnabled from user's actual 2FA status
  const [isEnabled, setIsEnabled] = useState(() => user?.twoFAEnabled || false);
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<
    'select' | 'setup' | 'verify' | 'backupCodes'
  >('select');

  // Real 2FA data from backend
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = user?.email || 'user@example.com';

  // Sync isEnabled with user's actual 2FA status from backend
  useEffect(() => {
    setIsEnabled(user?.twoFAEnabled || false);
  }, [user?.twoFAEnabled]);

  // Fetch 2FA setup data when entering setup mode
  useEffect(() => {
    if (step === 'setup' && method === 'app' && !qrCodeUrl) {
      handleFetch2FASetup();
    }
  }, [step, method]);

  const handleFetch2FASetup = async () => {
    setIsLoading(true);
    try {
      const response = await authService.generate2FASecret();

      // Debug: Log the actual response structure
      console.log('[TwoFactorModal] 2FA Setup Response:', response);
      console.log('[TwoFactorModal] Response type:', typeof response);
      console.log(
        '[TwoFactorModal] Response keys:',
        response ? Object.keys(response) : 'null'
      );

      // Handle different response structures
      // The API client might return the data directly or wrapped
      let responseData: any = response;

      // The API might return the response wrapped in various ways
      // Try to extract the actual data from the response

      // Check if response has a 'data' property (common axios/ApiResponse wrapper)
      if (response && typeof response === 'object') {
        // If response has hasData: true, check for data in common locations
        if ('hasData' in response && (response as any).hasData === true) {
          if ('data' in response && response.data) {
            responseData = response.data;
          } else if ('result' in response) {
            responseData = (response as any).result;
          } else if ('response' in response) {
            responseData = (response as any).response;
          } else if ('setupMethods' in response || 'secret' in response) {
            // Data might be at root level
            responseData = response;
          }
        }
        // If it's an ApiResponse structure: { success: true, data: {...} }
        else if ('data' in response && response.data) {
          responseData = response.data;
        }
        // If it has nested data
        else if (
          'data' in response &&
          typeof (response as any).data === 'object' &&
          'data' in (response as any).data
        ) {
          responseData = (response as any).data.data;
        }
        // Check if the response itself has the expected fields
        else if ('setupMethods' in response || 'secret' in response) {
          responseData = response;
        }
        // If response has success:true but no data, it might be the data itself
        else if ('success' in response && (response as any).success === true) {
          // The data might be at the root level
          responseData = response;
        }
      }

      // Now try to extract setupDetails, setupMethods, or other expected fields
      let qrUrl = '';
      let secret = '';
      let verificationToken = '';

      // Try various paths to find the QR code URL, secret, and verification token
      if (responseData && typeof responseData === 'object') {
        // PRIORITY 1: Check for setupDetails structure (backend guide format)
        if ('setupDetails' in responseData && responseData.setupDetails) {
          const setupDetails = responseData.setupDetails as any;
          qrUrl = setupDetails.qrCode || '';
          secret = setupDetails.secret || '';
        }

        // Extract verification token (may be at data level or setupDetails level)
        verificationToken =
          responseData.verificationToken ||
          (responseData.setupDetails as any)?.verificationToken ||
          responseData.token ||
          '';

        // Also check for setupMethods structure (expected format from types)
        if (!qrUrl || !secret) {
          qrUrl =
            qrUrl ||
            responseData.setupMethods?.qrCode?.qrImageUrl ||
            responseData.qrCode?.qrImageUrl ||
            responseData.qrImageUrl ||
            responseData.qrCode ||
            responseData.setupMethods?.qrCode ||
            (typeof responseData.setupMethods?.qrCode === 'string'
              ? responseData.setupMethods.qrCode
              : '') ||
            '';

          secret =
            secret ||
            responseData.secret ||
            responseData.setupMethods?.manualEntry?.secretKey ||
            responseData.manualEntry?.secretKey ||
            responseData.secretKey ||
            '';
        }
      }

      // If we found QR code and secret, we can proceed
      if (qrUrl && secret) {
        setQrCodeUrl(qrUrl);
        setSecretKey(secret);
        if (verificationToken) {
          setVerificationToken(verificationToken);
        }
        toast.success('QR code generated successfully!');
      } else {
        // Log the actual structure for debugging
        console.error(
          '[TwoFactorModal] Response structure:',
          JSON.stringify(response, null, 2)
        );
        console.error(
          '[TwoFactorModal] Extracted responseData:',
          JSON.stringify(responseData, null, 2)
        );
        throw new Error(
          `Invalid response format: missing QR code or secret. QR: ${!!qrUrl}, Secret: ${!!secret}. Check console for details.`
        );
      }
    } catch (error: unknown) {
      console.error('[TwoFactorModal] Failed to generate 2FA secret:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate QR code';
      toast.error(errorMessage);
      setStep('select'); // Go back to selection
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    if (isEnabled) {
      // Disable 2FA via API
      disable2FAMutation.mutate(undefined, {
        onSuccess: () => {
          setIsEnabled(false);
          setStep('select');
          setShowBackupCodes(false);
          setBackupCodes([]);
          if (onEnable) onEnable();
        },
        onError: () => {
          // Keep enabled state on error
        },
      });
    } else {
      // Start enabling 2FA
      setStep('setup');
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (!verificationToken) {
      toast.error(
        'Verification token is missing. Please restart the setup process.'
      );
      setStep('select');
      return;
    }

    setIsLoading(true);
    try {
      // Backend guide: userId is NOT required - backend extracts from auth token
      const response = await authService.enable2FA({
        verificationToken,
        verificationCode,
      });

      // DEBUG: Log the full response to see what backend is returning
      console.log(
        '[TwoFactorModal] 🔍 Full API Response:',
        JSON.stringify(response, null, 2)
      );
      console.log('[TwoFactorModal] 🔍 Response Type:', typeof response);
      console.log(
        '[TwoFactorModal] 🔍 Response Keys:',
        response ? Object.keys(response) : 'null'
      );

      // Extract backup codes from response (backend guide format)
      let codes: string[] = [];
      if (response && typeof response === 'object') {
        // Check for backupCodes in various response structures
        const responseData = response as any;
        console.log('[TwoFactorModal] 🔍 Checking backupCodes in:', {
          'responseData.backupCodes': responseData.backupCodes,
          'responseData.data?.backupCodes': responseData.data?.backupCodes,
          'responseData.data?.data?.backupCodes':
            responseData.data?.data?.backupCodes,
          'Full responseData': responseData,
        });

        codes =
          responseData.backupCodes ||
          responseData.data?.backupCodes ||
          responseData.data?.data?.backupCodes ||
          [];

        console.log('[TwoFactorModal] 🔍 Extracted codes:', codes);
      }

      // Update the user in auth store to reflect 2FA is now enabled
      updateUser({ twoFAEnabled: true });

      setVerificationCode('');
      setIsEnabled(true);

      // If backup codes are provided, show them prominently
      if (codes && codes.length > 0) {
        setBackupCodes(codes);
        setStep('backupCodes');
        toast.success(
          '2FA enabled successfully! Please save your backup codes.'
        );
      } else {
        // No backup codes (shouldn't happen per backend guide, but handle gracefully)
        toast.success(
          response.message || 'Two-Factor Authentication enabled successfully!'
        );
        setStep('select');
        setQrCodeUrl('');
        setSecretKey('');
        setVerificationToken('');
        if (onEnable) onEnable();
        onOpenChange(false);
      }
    } catch (error: unknown) {
      console.error('[TwoFactorModal] Failed to verify 2FA code:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid verification code';
      toast.error(errorMessage);
      setVerificationCode(''); // Clear on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success('Secret key copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto p-4 sm:max-w-lg">
        <DialogHeader className="items-center space-y-1 text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg font-bold">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm">
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Status - Only show when not in setup mode to save space */}
          {step === 'select' && (
            <div className="border-border bg-card rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Two-Factor Authentication is currently{' '}
                    {isEnabled ? 'enabled' : 'disabled'}
                  </p>
                </div>
                <Badge
                  variant={isEnabled ? 'default' : 'secondary'}
                  className={isEnabled ? 'bg-emerald-500' : ''}
                >
                  {isEnabled ? (
                    <>
                      <Check className="mr-1 h-3 w-3" /> Enabled
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3 w-3" /> Disabled
                    </>
                  )}
                </Badge>
              </div>
            </div>
          )}

          {/* Method Selection */}
          {step === 'select' && !isEnabled && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Choose Authentication Method
              </h3>

              <div
                className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                  method === 'app'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setMethod('app')}
              >
                <div className="flex items-start gap-3">
                  <Smartphone className="text-primary mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Authenticator App</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Use apps like Google Authenticator or Authy (Recommended)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Setup Step - Compact Layout */}
          {step === 'setup' && method === 'app' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center space-y-3 p-8">
                  <RefreshCw className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    Generating QR code...
                  </p>
                </div>
              ) : qrCodeUrl && secretKey ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* QR Code Column */}
                    <div className="border-border bg-card flex flex-col items-center justify-center rounded-lg border p-3">
                      <h3 className="mb-2 text-sm font-semibold">
                        Scan QR Code
                      </h3>
                      <div className="mb-2 rounded-lg bg-white p-2">
                        <img
                          src={qrCodeUrl}
                          alt="2FA QR Code"
                          className="h-32 w-32"
                        />
                      </div>
                      <p className="text-muted-foreground text-center text-[10px] leading-tight">
                        Scan with your authenticator app
                      </p>
                    </div>

                    {/* Manual Entry & Verify Column */}
                    <div className="flex flex-col justify-between space-y-3">
                      <div className="border-border bg-card rounded-lg border p-3">
                        <h3 className="mb-1.5 text-xs font-semibold">
                          Or enter secret key
                        </h3>
                        <div className="flex items-center gap-1">
                          <code className="bg-muted flex-1 rounded p-1.5 font-mono text-[10px] break-all">
                            {secretKey}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={handleCopySecret}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="verificationCode" className="text-xs">
                          Enter Verification Code
                        </Label>
                        <Input
                          id="verificationCode"
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/\D/g, '')
                            )
                          }
                          className="h-9 text-center text-lg tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('select')}
                      className="h-9 flex-1"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerify}
                      size="sm"
                      className="h-9 flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
                      disabled={isLoading}
                    >
                      <Check className="mr-2 h-3 w-3" />
                      {isLoading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 p-8">
                  <X className="text-destructive h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Failed to load QR code
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('select')}
                  >
                    Go Back
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Enabled Status */}
          {step === 'select' && isEnabled && (
            <div className="rounded-lg border border-emerald-500 bg-emerald-500/10 p-3">
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Two-Factor Authentication is Active
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">
                    Your account is protected with authenticator app
                    verification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes Display */}
          {step === 'backupCodes' && backupCodes.length > 0 && (
            <div className="space-y-4">
              {/* Success Header */}
              <div className="rounded-lg border border-emerald-500 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      ✅ 2FA Enabled Successfully!
                    </p>
                  </div>
                </div>
              </div>

              {/* Critical Warning */}
              <div className="rounded-lg border-2 border-amber-500 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Key className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                      ⚠️ IMPORTANT: Save Your Backup Codes
                    </p>
                    <p className="space-y-1 text-xs text-amber-600 dark:text-amber-500">
                      <span className="block">
                        These codes can be used if you lose access to your
                        authenticator app.
                      </span>
                      <span className="block font-medium">
                        Each code can only be used once.
                      </span>
                      <span className="block">
                        Store them in a safe place - you won&apos;t be able to
                        see them again!
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border bg-card rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold">
                  Your Backup Codes
                </h3>
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="bg-muted border-border rounded border p-2 text-center font-mono text-xs font-medium"
                    >
                      {code.toUpperCase()}
                    </code>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join('\n'));
                      toast.success('All backup codes copied to clipboard!');
                    }}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copy All Codes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const blob = new Blob(
                        [
                          `Novunt Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.map((c, i) => `${i + 1}. ${c.toUpperCase()}`).join('\n')}\n\n⚠️ IMPORTANT:\n- Each code can only be used once\n- Store these codes securely\n- Use them if you lose access to your authenticator app`,
                        ],
                        { type: 'text/plain' }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `novunt-backup-codes-${Date.now()}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('Backup codes downloaded!');
                    }}
                  >
                    Download as Text
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setStep('select');
                    setShowBackupCodes(false);
                    setBackupCodes([]);
                    setQrCodeUrl('');
                    setSecretKey('');
                    setVerificationToken('');
                    if (onEnable) onEnable();
                    onOpenChange(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
                  size="lg"
                >
                  <Check className="mr-2 h-4 w-4" />
                  I’ve Saved My Codes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show in select mode */}
        {step === 'select' && (
          <div className="mt-4 flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              onClick={handleEnable2FA}
              variant={isEnabled ? 'destructive' : 'default'}
              size="sm"
              disabled={isEnabled && disable2FAMutation.isPending}
              className={
                !isEnabled
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : ''
              }
            >
              {isEnabled ? (
                <>
                  <X className="mr-2 h-3 w-3" />
                  Disable 2FA
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-3 w-3" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
