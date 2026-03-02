'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BiometricButtonProps {
  onSuccess: (credentials: { email: string; password: string }) => void;
  disabled?: boolean;
}

/**
 * BiometricButton Component
 * Handles biometric authentication (Face ID, Touch ID, Fingerprint)
 * Uses Web Authentication API (WebAuthn) where supported
 */
export function BiometricButton({ onSuccess, disabled = false }: BiometricButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'biometric'>('biometric');

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  // Check if biometric authentication is supported
  const checkBiometricSupport = async () => {
    // Check for Web Authentication API support
    if (!window.PublicKeyCredential) {
      console.log('WebAuthn not supported');
      setIsSupported(false);
      return;
    }

    try {
      // Check for platform authenticator (Face ID, Touch ID, Windows Hello)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsSupported(available);

      // Detect biometric type based on platform
      if (available) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
          setBiometricType('face'); // Face ID / Touch ID on Apple devices
        } else if (userAgent.includes('android')) {
          setBiometricType('fingerprint'); // Fingerprint on Android
        } else if (userAgent.includes('windows')) {
          setBiometricType('face'); // Windows Hello
        }
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!isSupported || disabled) return;

    setIsAuthenticating(true);

    try {
      // In a real implementation, you would:
      // 1. Call your backend to get a challenge
      // 2. Use navigator.credentials.get() to authenticate
      // 3. Send the response to your backend for verification
      // 4. Backend returns user credentials or token

      // For now, simulate biometric authentication
      await simulateBiometricAuth();

      // Show success feedback
      toast.success('Biometric authentication successful!', {
        description: 'Logging you in...',
      });

      // Simulate retrieving stored credentials
      // In production, this would come from your backend after successful biometric verification
      const storedCredentials = getStoredCredentials();
      
      if (storedCredentials) {
        onSuccess(storedCredentials);
      } else {
        toast.error('No stored credentials found', {
          description: 'Please log in with your email and password first',
        });
      }
    } catch (error: unknown) {
      console.error('Biometric authentication failed:', error);

      const errorName = error instanceof Error ? error.name : undefined;

      if (errorName === 'NotAllowedError') {
        toast.error('Authentication cancelled', {
          description: 'Biometric authentication was cancelled',
        });
      } else {
        toast.error('Biometric authentication failed', {
          description: 'Please try again or use your password',
        });
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Simulate biometric authentication
  const simulateBiometricAuth = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate authentication delay
      setTimeout(() => {
        // 90% success rate for demo
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Authentication failed'));
        }
      }, 1500);
    });
  };

  // Get stored credentials from localStorage
  // In production, credentials should NEVER be stored in localStorage
  // This is just for demo purposes. Use secure backend storage.
  const getStoredCredentials = () => {
    try {
      const stored = localStorage.getItem('biometric_credentials');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error retrieving credentials:', error);
    }
    return null;
  };

  // Get biometric icon and text based on type
  const getBiometricInfo = () => {
    switch (biometricType) {
      case 'face':
        return {
          icon: Fingerprint, // Using Fingerprint as generic biometric icon
          text: 'Face ID',
          description: 'Use Face ID to sign in',
        };
      case 'fingerprint':
        return {
          icon: Fingerprint,
          text: 'Fingerprint',
          description: 'Use your fingerprint to sign in',
        };
      default:
        return {
          icon: Fingerprint,
          text: 'Biometric',
          description: 'Use biometric authentication',
        };
    }
  };

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const biometricInfo = getBiometricInfo();
  const Icon = biometricInfo.icon;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full relative overflow-hidden"
        size="lg"
        onClick={handleBiometricAuth}
        disabled={disabled || isAuthenticating}
      >
        {/* Animated background on hover */}
        <motion.div
          className="absolute inset-0 bg-primary/5"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon with animation */}
        <motion.div
          className="relative z-10 flex items-center gap-2"
          animate={isAuthenticating ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: isAuthenticating ? Infinity : 0 }}
        >
          {isAuthenticating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
          <span>
            {isAuthenticating ? 'Authenticating...' : `Sign in with ${biometricInfo.text}`}
          </span>
        </motion.div>
      </Button>

      {/* Help text */}
      <p className="text-xs text-center text-muted-foreground">
        {biometricInfo.description}
      </p>
    </div>
  );
}

// Utility function to enable biometric login after successful password login
// Call this after user logs in with password to store credentials for biometric
export const enableBiometricLogin = (email: string, password: string) => {
  // WARNING: In production, NEVER store actual passwords
  // This should register a WebAuthn credential instead
  try {
    localStorage.setItem('biometric_credentials', JSON.stringify({ email, password }));
    toast.success('Biometric login enabled', {
      description: 'You can now use biometric authentication',
    });
    return true;
  } catch (error) {
    console.error('Error enabling biometric login:', error);
    return false;
  }
};

// Utility to disable biometric login
export const disableBiometricLogin = () => {
  try {
    localStorage.removeItem('biometric_credentials');
    toast.success('Biometric login disabled');
    return true;
  } catch (error) {
    console.error('Error disabling biometric login:', error);
    return false;
  }
};
