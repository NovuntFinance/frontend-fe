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
  const [isEnabled, setIsEnabled] = useState(false);
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
        // Check for setupDetails structure (actual API format)
        if ('setupDetails' in responseData && responseData.setupDetails) {
          const setupDetails = responseData.setupDetails as any;
          qrUrl = setupDetails.qrCode || '';
          secret = setupDetails.secret || '';
        }

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

        // Extract verification token
        verificationToken =
          responseData.verificationToken || responseData.token || '';
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
      // Disable 2FA
      setIsEnabled(false);
      setStep('select');
      setShowBackupCodes(false);
      setBackupCodes([]);
      toast.success('Two-Factor Authentication disabled');
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
      // Get user ID from auth store
      const { user } = useAuthStore.getState();
      const userId = user?._id || user?.id || '';

      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const response = await authService.enable2FA({
        userId,
        verificationToken,
        verificationCode,
      });

      toast.success(
        response.message || 'Two-Factor Authentication enabled successfully!'
      );
      setStep('select');
      setIsEnabled(true);
      setVerificationCode('');

      // Clear QR data
      setQrCodeUrl('');
      setSecretKey('');
      setVerificationToken('');

      if (onEnable) onEnable();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('[TwoFactorModal] Failed to verify 2FA code:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid verification code';
      toast.error(errorMessage);
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
              <div className="rounded-lg border border-amber-500 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Key className="mt-0.5 h-5 w-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Save Your Backup Codes
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">
                      Store these codes in a safe place. You can use them to
                      access your account if you lose your device.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border bg-card rounded-lg border p-4">
                <h3 className="mb-3 text-sm font-semibold">Recovery Codes</h3>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="bg-muted rounded p-2 text-center font-mono text-xs"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    toast.success('Backup codes copied to clipboard!');
                  }}
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy All Codes
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setStep('select');
                    setShowBackupCodes(false);
                    if (onEnable) onEnable();
                    onOpenChange(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
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
