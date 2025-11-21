'use client';

import React, { useState } from 'react';
import { Fingerprint, QrCode, Check, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface BiometricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BiometricModal({ open, onOpenChange, onEnable }: BiometricModalProps & { onEnable?: () => void }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(true); // Mock availability

  const handleEnableBiometric = async () => {
    setIsRegistering(true);

    // Simulate biometric registration
    setTimeout(() => {
      setIsRegistering(false);
      setIsEnabled(true);
      toast.success('Biometric authentication enabled successfully!');
      if (onEnable) onEnable();
      onOpenChange(false);
    }, 2000);
  };

  const handleDisableBiometric = () => {
    setIsEnabled(false);
    toast.success('Biometric authentication disabled');
  };

  const handleTestBiometric = async () => {
    // Simulate biometric verification
    toast.info('Biometric verification test initiated...');
    setTimeout(() => {
      toast.success('Biometric verification successful!');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader className="items-center text-center space-y-1">
          <DialogTitle className="text-lg font-bold flex items-center justify-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-center">
            Use your fingerprint or face recognition to access your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status - Only show when enabled or if unavailable */}
          {(isEnabled || !biometricAvailable) && (
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Biometric Authentication is currently {isEnabled ? 'enabled' : 'disabled'}
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

          {/* Device Compatibility - Compact */}
          {biometricAvailable && !isEnabled && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs">
              <Check className="h-3 w-3 shrink-0" />
              <span className="font-medium">Device supports fingerprint & face recognition</span>
            </div>
          )}

          {!biometricAvailable && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your device does not support biometric authentication.
              </AlertDescription>
            </Alert>
          )}

          {/* Registration/Test Area */}
          {isEnabled && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Fingerprint className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Biometric Active</p>
                    <p className="text-xs text-muted-foreground">
                      You can use your fingerprint or face to log in
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestBiometric}
                    className="mt-1 h-8"
                  >
                    <QrCode className="mr-2 h-3 w-3" />
                    Test Login
                  </Button>
                </div>
              </div>

              <Alert className="py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Keep your password safe as a backup.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Setup Instructions - Compact */}
          {!isEnabled && biometricAvailable && !isRegistering && (
            <div className="p-3 rounded-lg border border-border bg-card">
              <h3 className="font-semibold text-sm mb-2">Setup Instructions</h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Click "Enable Biometric Authentication"
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Follow your device's prompts to verify identity
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Biometric login will be active for this device
                </li>
              </ol>
            </div>
          )}

          {/* Registration in progress */}
          {isRegistering && (
            <div className="p-6 rounded-lg border-2 border-dashed border-primary bg-primary/5 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Fingerprint className="h-12 w-12 text-primary animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Fingerprint className="h-12 w-12 text-primary opacity-20" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-base">Registering...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Please follow your device's prompts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {biometricAvailable && !isRegistering && (
            <Button
              onClick={isEnabled ? handleDisableBiometric : handleEnableBiometric}
              variant={isEnabled ? 'destructive' : 'default'}
              size="sm"
              className={!isEnabled ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}
            >
              {isEnabled ? (
                <>
                  <X className="mr-2 h-3 w-3" />
                  Disable
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-3 w-3" />
                  Enable Biometric Authentication
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
