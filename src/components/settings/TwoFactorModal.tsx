'use client';

import React, { useState } from 'react';
import { Shield, Smartphone, Mail, Key, Check, X, Copy, RefreshCw, Mail as MessageIcon } from 'lucide-react';
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

interface TwoFactorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorModal({ open, onOpenChange }: TwoFactorModalProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'select' | 'setup' | 'verify'>('select');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // Mock secret key
  const [qrCodeUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Novunt:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Novunt');

  const handleEnable2FA = () => {
    if (isEnabled) {
      // Disable 2FA
      setIsEnabled(false);
      setStep('select');
      toast.success('Two-Factor Authentication disabled');
    } else {
      // Start enabling 2FA
      setStep('setup');
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      // TODO: Verify code with backend
      setIsEnabled(true);
      setStep('select');
      toast.success('Two-Factor Authentication enabled successfully!');
      setVerificationCode('');
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success('Secret key copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Two-Factor Authentication is currently {isEnabled ? 'enabled' : 'disabled'}
                </p>
              </div>
              <Badge variant={isEnabled ? 'default' : 'secondary'} className={isEnabled ? 'bg-emerald-500' : ''}>
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

          {/* Method Selection */}
          {step === 'select' && !isEnabled && (
            <div className="space-y-4">
              <h3 className="font-semibold">Choose Authentication Method</h3>
              
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  method === 'app'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setMethod('app')}
              >
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Authenticator App</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use apps like Google Authenticator or Authy (Recommended)
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  method === 'sms'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setMethod('sms')}
              >
                <div className="flex items-start gap-3">
                  <MessageIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive verification codes via text message
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  method === 'email'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setMethod('email')}
              >
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive verification codes via email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Setup Step - Authenticator App */}
          {step === 'setup' && method === 'app' && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-card">
                <h3 className="font-semibold mb-4">Scan QR Code</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card">
                <h3 className="font-semibold mb-2">Or enter this secret key manually</h3>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 bg-muted rounded font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Enter Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleVerify} className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {/* Setup Step - SMS/Email */}
          {step === 'setup' && (method === 'sms' || method === 'email') && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  A verification code will be sent to your {method === 'sms' ? 'phone number' : 'email address'}.
                  Enter the code below to enable Two-Factor Authentication.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Enter Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Didn&apos;t receive the code?
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Resend
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleVerify} className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {/* Enabled Status */}
          {step === 'select' && isEnabled && (
            <div className="p-4 rounded-lg border border-emerald-500 bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Two-Factor Authentication is Active
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                    Your account is protected with {method === 'app' ? 'authenticator app' : method === 'sms' ? 'SMS' : 'email'} verification
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {step === 'select' && (
            <Button
              onClick={handleEnable2FA}
              variant={isEnabled ? 'destructive' : 'default'}
              className={!isEnabled ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}
            >
              {isEnabled ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disable 2FA
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Enable 2FA
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

