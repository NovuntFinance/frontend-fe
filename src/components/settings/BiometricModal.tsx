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

export function BiometricModal({ open, onOpenChange }: BiometricModalProps) {
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
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Fingerprint className="h-5 w-5 sm:h-6 sm:w-6" />
            Biometric Authentication
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Use your fingerprint or face recognition to quickly and securely access your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground mt-1">
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

          {/* Device Compatibility */}
          {biometricAvailable ? (
            <div className="p-4 rounded-lg border border-emerald-500 bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    Your device supports biometric authentication
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
                    Fingerprint and face recognition are available on this device
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your device or browser does not support biometric authentication. Please use a compatible device.
              </AlertDescription>
            </Alert>
          )}

          {/* Features */}
          {!isEnabled && biometricAvailable && (
            <div className="space-y-4">
              <h3 className="font-semibold">Benefits of Biometric Authentication</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Quick & Convenient</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Log in instantly with your fingerprint or face
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Enhanced Security</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your biometric data never leaves your device
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">No Passwords Needed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Forget about remembering complex passwords
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration/Test Area */}
          {isEnabled && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Fingerprint className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Biometric Authentication Active</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can now use your fingerprint or face to log in
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleTestBiometric}
                    className="mt-2"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Test Biometric Login
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure to keep your password safe. You can still use it as a backup if biometric authentication fails.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Setup Instructions */}
          {!isEnabled && biometricAvailable && !isRegistering && (
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-3">How to Set Up</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Click the &quot;Enable Biometric Authentication&quot; button below
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Follow your device&apos;s prompts to verify your identity
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Once registered, you can use biometric login on this device
                </li>
              </ol>
            </div>
          )}

          {/* Registration in progress */}
          {isRegistering && (
            <div className="p-8 rounded-lg border-2 border-dashed border-primary bg-primary/5 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Fingerprint className="h-16 w-16 text-primary animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Fingerprint className="h-16 w-16 text-primary opacity-20" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-lg">Registering Biometric Data</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please follow your device&apos;s prompts to complete registration
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
          {biometricAvailable && !isRegistering && (
            <Button
              onClick={isEnabled ? handleDisableBiometric : handleEnableBiometric}
              variant={isEnabled ? 'destructive' : 'default'}
              className={!isEnabled ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}
            >
              {isEnabled ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disable Biometric
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
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

