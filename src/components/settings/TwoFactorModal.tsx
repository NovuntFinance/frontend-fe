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

import { useUser } from '@/hooks/useUser';

interface TwoFactorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwoFactorModal({ open, onOpenChange, onEnable }: TwoFactorModalProps & { onEnable?: () => void }) {
  const { user } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'select' | 'setup' | 'verify'>('select');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // Mock secret key

  const userEmail = user?.email || 'user@example.com';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Novunt:${userEmail}?secret=JBSWY3DPEHPK3PXP&issuer=Novunt`;

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
      if (onEnable) onEnable();
      onOpenChange(false);
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
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="items-center text-center space-y-1">
          <DialogTitle className="text-lg font-bold flex items-center justify-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-center">
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status - Only show when not in setup mode to save space */}
          {step === 'select' && (
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
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
          )}

          {/* Method Selection */}
          {step === 'select' && !isEnabled && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Choose Authentication Method</h3>

              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${method === 'app'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => setMethod('app')}
              >
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Authenticator App</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Code Column */}
                <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-sm mb-2">Scan QR Code</h3>
                  <div className="p-2 bg-white rounded-lg mb-2">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight">
                    Scan with your authenticator app
                  </p>
                </div>

                {/* Manual Entry & Verify Column */}
                <div className="flex flex-col justify-between space-y-3">
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <h3 className="font-semibold text-xs mb-1.5">Or enter secret key</h3>
                    <div className="flex items-center gap-1">
                      <code className="flex-1 p-1.5 bg-muted rounded font-mono text-[10px] break-all">
                        {secretKey}
                      </code>
                      <Button variant="outline" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopySecret}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="verificationCode" className="text-xs">Enter Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-lg tracking-widest h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setStep('select')} className="flex-1 h-9">
                  Back
                </Button>
                <Button onClick={handleVerify} size="sm" className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 h-9">
                  <Check className="mr-2 h-3 w-3" />
                  Verify & Enable
                </Button>
              </div>
            </div>
          )}

          {/* Enabled Status */}
          {step === 'select' && isEnabled && (
            <div className="p-3 rounded-lg border border-emerald-500 bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">
                    Two-Factor Authentication is Active
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                    Your account is protected with authenticator app verification
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show in select mode */}
        {step === 'select' && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={handleEnable2FA}
              variant={isEnabled ? 'destructive' : 'default'}
              size="sm"
              className={!isEnabled ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}
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

