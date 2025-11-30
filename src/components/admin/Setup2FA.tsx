'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { twoFAService } from '@/services/twoFAService';
import { adminAuthService } from '@/services/adminAuthService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Image from 'next/image';

export function Setup2FA() {
  const router = useRouter();
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [manualEntryKey, setManualEntryKey] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateSecret = async () => {
    try {
      setLoading(true);
      const admin = adminAuthService.getCurrentAdmin();
      if (!admin) {
        toast.error('Please login first');
        return;
      }

      const response = await twoFAService.generateSecret();

      // Handle different response formats
      const responseData = (response as any)?.data || response;

      if (responseData && typeof responseData === 'object') {
        // Handle format: { data: { setupDetails: { qrCode, secret }, verificationToken } }
        if ('setupDetails' in responseData) {
          const setupDetails = (responseData as any).setupDetails;
          setQrCode(setupDetails.qrCode);
          setSecret(setupDetails.secret);
          setManualEntryKey(setupDetails.secret); // Use secret as manual entry key
          setVerificationToken(
            (responseData as any).verificationToken || setupDetails.secret
          );
          setStep('verify');
          toast.success(
            '2FA secret generated. Scan the QR code with your authenticator app.'
          );
          return;
        }

        // Handle format: { setupMethods: { qrCode: { qrImageUrl } }, secret, verificationToken }
        if ('setupMethods' in responseData) {
          const qrCodeData = (responseData as any).setupMethods?.qrCode;
          if (qrCodeData) {
            setQrCode(qrCodeData.qrImageUrl);
            setSecret((responseData as any).secret || '');
            setManualEntryKey((responseData as any).secret || '');
            setVerificationToken(
              (responseData as any).verificationToken ||
                (responseData as any).secret ||
                ''
            );
            setStep('verify');
            toast.success(
              '2FA secret generated. Scan the QR code with your authenticator app.'
            );
            return;
          }
        }

        // Fallback: try to extract from any nested structure
        if ((responseData as any).success !== false) {
          const qr =
            (responseData as any).qrCode ||
            (responseData as any).data?.qrCode ||
            (responseData as any).setupDetails?.qrCode;
          const sec =
            (responseData as any).secret ||
            (responseData as any).data?.secret ||
            (responseData as any).setupDetails?.secret;
          const token =
            (responseData as any).verificationToken ||
            (responseData as any).data?.verificationToken ||
            sec;

          if (qr && sec) {
            setQrCode(qr);
            setSecret(sec);
            setManualEntryKey(sec);
            setVerificationToken(token || sec);
            setStep('verify');
            toast.success(
              '2FA secret generated. Scan the QR code with your authenticator app.'
            );
            return;
          }
        }
      }

      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('[Setup2FA] Failed to generate 2FA secret:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to generate 2FA secret'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    if (!verificationToken) {
      toast.error('Missing verification token. Please generate QR code again.');
      return;
    }

    try {
      setLoading(true);
      const admin = adminAuthService.getCurrentAdmin();
      if (!admin) {
        toast.error('Please login first');
        return;
      }

      const response = await twoFAService.enable2FA(
        verificationToken,
        verificationCode
      );

      const responseData = response as any;

      // Check if response includes updated user object (backend fix)
      const updatedUser = responseData.data?.user;

      if (responseData.success !== false) {
        // Verify that 2FA is actually enabled in the response
        if (updatedUser?.twoFAEnabled) {
          // User object is already updated in twoFAService
          // Just store the secret we used for setup
          const currentAdmin = adminAuthService.getCurrentAdmin();
          if (currentAdmin) {
            adminAuthService.updateUser({
              twoFASecret: secret, // Store the secret from setup
            });
          }

          toast.success(responseData.message || '2FA enabled successfully!', {
            duration: 3000,
          });

          // Immediately redirect to dashboard - no reload needed!
          setTimeout(() => {
            router.push('/admin/overview');
          }, 1000);
        } else {
          // Backend didn't confirm 2FA is enabled - show error
          toast.error('2FA was not enabled. Please try again.');
          console.error(
            '[Setup2FA] Backend response missing twoFAEnabled confirmation:',
            responseData
          );
        }
      } else {
        toast.error(responseData.message || 'Failed to enable 2FA');
      }
    } catch (error: any) {
      console.error('[Setup2FA] Failed to enable 2FA:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Failed to enable 2FA'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Setup Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'generate' ? (
          <>
            <p className="text-muted-foreground text-sm">
              Two-factor authentication is mandatory for all admin accounts.
              Please set it up to access the admin dashboard.
            </p>
            <Button
              onClick={handleGenerateSecret}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </>
        ) : (
          <>
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-lg bg-white p-4">
                  <Image
                    src={qrCode}
                    alt="2FA QR Code"
                    width={200}
                    height={200}
                    unoptimized
                  />
                </div>
                <p className="text-muted-foreground text-center text-sm">
                  Scan this QR code with Google Authenticator, Authy, or similar
                  app
                </p>
                {manualEntryKey && (
                  <div className="text-muted-foreground text-center text-xs">
                    Manual Entry Key:{' '}
                    <code className="bg-muted rounded px-2 py-1">
                      {manualEntryKey}
                    </code>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Enter 6-digit code from your authenticator app
              </label>
              <Input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ''))
                }
                placeholder="000000"
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('generate')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleEnable2FA}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Enabling...' : 'Enable 2FA'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
