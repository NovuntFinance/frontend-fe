'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Share2, Plus } from 'lucide-react';

const STORAGE_KEY = 'novunt-pwa-install-prompt-dismissed';
const STORAGE_KEY_PERMANENT = 'novunt-pwa-install-prompt-permanent-dismiss';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if PWA is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (PWA installed)
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandalone);

      // Also check if user has permanently dismissed
      const permanentDismiss = localStorage.getItem(STORAGE_KEY_PERMANENT);
      if (permanentDismiss === 'true' || isStandalone) {
        return;
      }

      // Check if user has dismissed for this session
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed === 'true') {
        return;
      }

      // Detect platform
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS =
        /iphone|ipad|ipod/.test(userAgent) ||
        (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
      const isAndroid = /android/.test(userAgent);

      if (isIOS) {
        setPlatform('ios');
      } else if (isAndroid) {
        setPlatform('android');
      } else {
        setPlatform('other');
      }

      // Only show on mobile devices
      const isMobile = isIOS || isAndroid;
      if (isMobile) {
        // Show after a short delay for better UX
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android Chrome - use native install prompt
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
      }
      
      setDeferredPrompt(null);
    } else {
      // For iOS or other platforms, just close and show instructions
      setShowPrompt(false);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  const handleDismiss = (permanent = false) => {
    setShowPrompt(false);
    if (permanent) {
      localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
    } else {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={(open) => !open && handleDismiss(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Download className="size-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Install Novunt App
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Add Novunt to your home screen for quick access and a better experience!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {platform === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Share2 className="size-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Step 1: Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the Share icon <Share2 className="inline size-4" /> at the bottom of your Safari browser.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Plus className="size-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Step 2: Tap &ldquo;Add to Home Screen&rdquo;</p>
                  <p className="text-sm text-muted-foreground">
                    Scroll down and select &ldquo;Add to Home Screen&rdquo; from the menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <Smartphone className="size-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Step 3: Confirm</p>
                  <p className="text-sm text-muted-foreground">
                    Tap &ldquo;Add&rdquo; in the top right corner. The Novunt app will appear on your home screen!
                  </p>
                </div>
              </div>
            </div>
          )}

          {platform === 'android' && (
            <div className="space-y-3">
              {deferredPrompt ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    Tap the button below to install Novunt on your device.
                  </p>
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="mr-2 size-5" />
                    Install Novunt App
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <Share2 className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Step 1: Tap the Menu</p>
                      <p className="text-sm text-muted-foreground">
                        Tap the three dots <span className="font-mono">⋮</span> in the top right corner of your browser
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <Download className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">Step 2: Tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;</p>
                      <p className="text-sm text-muted-foreground">
                        Look for &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo; in the menu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <Smartphone className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Step 3: Confirm</p>
                  <p className="text-sm text-muted-foreground">
                    Tap &ldquo;Install&rdquo; to add Novunt to your home screen!
                  </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {platform === 'other' && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                To install Novunt, look for the install option in your browser&apos;s menu. On mobile devices, you can add this site to your home screen for quick access.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          {deferredPrompt && platform === 'android' ? (
            <Button onClick={handleInstall} className="flex-1" size="lg">
              <Download className="mr-2 size-5" />
              Install Now
            </Button>
          ) : (
            <Button onClick={() => handleDismiss(false)} variant="outline" className="flex-1">
              Maybe Later
            </Button>
          )}
          <Button
            onClick={() => handleDismiss(true)}
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Don't show again"
          >
            <X className="size-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

