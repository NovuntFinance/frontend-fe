'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Circle, Mail, Share, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useVisitSocialMedia, useConfirmSocialMedia, type SocialMediaPlatform } from '@/lib/mutations/profileMutations';

interface SocialMediaPlatformData {
  id: SocialMediaPlatform;
  name: string;
  icon: typeof Users;
  color: string;
  verified: boolean;
}

interface SocialMediaVerificationProps {
  verifiedPlatforms?: SocialMediaPlatform[];
  onVerificationComplete?: () => void;
}

export function SocialMediaVerification({ verifiedPlatforms = [], onVerificationComplete }: SocialMediaVerificationProps) {
  const [verifyingPlatform, setVerifyingPlatform] = useState<SocialMediaPlatform | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const visitMutation = useVisitSocialMedia();
  const confirmMutation = useConfirmSocialMedia();

  const platforms: SocialMediaPlatformData[] = [
    {
      id: 'FACEBOOK' as SocialMediaPlatform,
      name: 'Facebook',
      icon: Users,
      color: 'from-blue-500 to-blue-700',
      verified: verifiedPlatforms.includes('FACEBOOK'),
    },
    {
      id: 'INSTAGRAM' as SocialMediaPlatform,
      name: 'Instagram',
      icon: Star,
      color: 'from-pink-500 to-purple-600',
      verified: verifiedPlatforms.includes('INSTAGRAM'),
    },
    {
      id: 'YOUTUBE' as SocialMediaPlatform,
      name: 'YouTube',
      icon: Circle,
      color: 'from-red-500 to-red-700',
      verified: verifiedPlatforms.includes('YOUTUBE'),
    },
    {
      id: 'TELEGRAM' as SocialMediaPlatform,
      name: 'Telegram',
      icon: Mail,
      color: 'from-cyan-400 to-blue-500',
      verified: verifiedPlatforms.includes('TELEGRAM'),
    },
  ];

  const handleVerify = async (platform: SocialMediaPlatform) => {
    try {
      setVerifyingPlatform(platform);

      // Step 1: Get verification token and redirect URL
      const result = await visitMutation.mutateAsync(platform);

      // Step 2: Open platform URL in new tab
      window.open(result.redirectUrl, '_blank');

      // Step 3: Store token for confirmation
      setPendingToken(result.token);

      // Step 4: Show countdown (30 seconds dwell time)
      toast.info(`Please follow Novunt on ${platform} in the new tab`, {
        description: 'Come back here after following to confirm',
      });

      // Start 30-second countdown
      setCountdown(30);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-confirm after 30 seconds
      setTimeout(async () => {
        try {
          await confirmMutation.mutateAsync({ platform, token: result.token });
          toast.success(`${platform} verified!`, {
            description: 'Your registration bonus progress has been updated',
          });
          setVerifyingPlatform(null);
          setPendingToken(null);
          onVerificationComplete?.();
        } catch (error) {
          toast.error('Verification failed', {
            description: error instanceof Error ? error.message : 'Please try again',
          });
          setVerifyingPlatform(null);
          setPendingToken(null);
        }
      }, 30000);
    } catch (error) {
      toast.error('Failed to start verification', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      setVerifyingPlatform(null);
      setPendingToken(null);
    }
  };

  const handleManualConfirm = async () => {
    if (!verifyingPlatform || !pendingToken) return;

    try {
      await confirmMutation.mutateAsync({ platform: verifyingPlatform, token: pendingToken });
      toast.success(`${verifyingPlatform} verified!`, {
        description: 'Your registration bonus progress has been updated',
      });
      setVerifyingPlatform(null);
      setPendingToken(null);
      setCountdown(0);
      onVerificationComplete?.();
    } catch (error) {
      toast.error('Verification failed', {
        description: error instanceof Error ? error.message : 'Please wait a bit longer or try again',
      });
    }
  };

  const verifiedCount = platforms.filter((p) => p.verified).length;
  const totalRequired = 5;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              Social Media Verification
            </CardTitle>
            <CardDescription className="mt-2">
              Follow Novunt on 5 platforms to qualify for the registration bonus
            </CardDescription>
          </div>
          <Badge variant={verifiedCount === totalRequired ? 'default' : 'secondary'} className="text-lg px-4 py-2">
            {verifiedCount}/{totalRequired}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-novunt.blue to-novunt.gold"
              initial={{ width: 0 }}
              animate={{ width: `${(verifiedCount / totalRequired) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {platforms.map((platform, index) => {
          const Icon = platform.icon;
          const isVerifying = verifyingPlatform === platform.id;
          const isDisabled = platform.verified || isVerifying || (verifyingPlatform !== null && verifyingPlatform !== platform.id);

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`
                  relative overflow-hidden rounded-lg border p-4
                  ${platform.verified ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'}
                  ${isVerifying ? 'ring-2 ring-primary/50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${platform.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Platform Info */}
                    <div>
                      <p className="font-semibold">{platform.name}</p>
                      {platform.verified && (
                        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </p>
                      )}
                      {isVerifying && countdown > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Auto-confirm in {countdown}s
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {platform.verified ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : isVerifying && countdown > 0 ? (
                      <Button
                        size="sm"
                        onClick={handleManualConfirm}
                        disabled={confirmMutation.isPending}
                      >
                        {confirmMutation.isPending ? 'Confirming...' : 'Confirm Now'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(platform.id)}
                        disabled={isDisabled || visitMutation.isPending}
                        className="group"
                      >
                        {visitMutation.isPending && verifyingPlatform === platform.id ? (
                          'Opening...'
                        ) : (
                          <>
                            Follow
                            <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Verification Instructions */}
                {isVerifying && countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-primary/20"
                  >
                    <p className="text-xs text-muted-foreground">
                      ✅ Follow Novunt on {platform.name}
                      <br />
                      ⏱️ Wait for {countdown} seconds (or click &quot;Confirm Now&quot; after following)
                      <br />
                      🎉 Verification will complete automatically
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Completion Message */}
        {verifiedCount === totalRequired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">Social Media Verified!</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  You&apos;ve completed the social media requirement for the registration bonus
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

