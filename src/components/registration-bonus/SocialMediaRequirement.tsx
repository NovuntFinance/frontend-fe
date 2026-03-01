/**
 * Social Media Requirement Component - Gold Design
 * Modern card with platform icons
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  SocialMediaRequirementProps,
  SocialMediaPlatform,
} from '@/types/registrationBonus';
import { PLATFORM_CONFIG } from '@/config/socialMediaIcons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { socialMediaApi } from '@/services/socialMediaApi';
import { SocialMediaConfirmDialog } from './SocialMediaConfirmDialog';

/**
 * Social Media Requirement Component
 * Shows social media platforms with verification status
 */
export function SocialMediaRequirement({
  socialData,
  onComplete,
}: SocialMediaRequirementProps) {
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(
    null
  );
  const [visitTokens, setVisitTokens] = useState<Record<string, string>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPlatform, setPendingPlatform] =
    useState<SocialMediaPlatform | null>(null);
  const [pendingToken, setPendingToken] = useState<string | undefined>(
    undefined
  );

  const handlePlatformClick = async (platform: SocialMediaPlatform) => {
    const config = PLATFORM_CONFIG[platform];
    if (!config) return;

    try {
      setVerifyingPlatform(platform);

      // Step 1: Visit platform (get verification token) - Request JSON response
      const visitResponse = await socialMediaApi.visitPlatform(platform, true);

      console.log(
        '[SocialMediaRequirement] Visit platform response:',
        visitResponse
      );
      console.log('[SocialMediaRequirement] Response structure:', {
        success: visitResponse.success,
        hasData: !!visitResponse.data,
        token: visitResponse.data?.token,
        url: visitResponse.data?.url,
        fullResponse: JSON.stringify(visitResponse, null, 2),
      });

      // Extract token from response (handle different response structures)
      let token: string | undefined;
      if (visitResponse.data?.token) {
        token = visitResponse.data.token;
      } else if ((visitResponse as any).token) {
        token = (visitResponse as any).token;
      }

      // Store token if provided
      if (token) {
        setVisitTokens((prev) => ({ ...prev, [platform]: token! }));
        console.log(
          '[SocialMediaRequirement] Stored token for platform:',
          platform,
          'token:',
          token
        );
      } else {
        console.warn(
          '[SocialMediaRequirement] No token received from visit platform response'
        );
      }

      // Open platform in new tab (use URL from response or fallback to config)
      const platformUrl = visitResponse.data?.url || config.url;
      window.open(platformUrl, '_blank', 'noopener,noreferrer');

      // Show branded confirmation dialog after delay (give user time to follow)
      setTimeout(() => {
        setPendingPlatform(platform);
        setPendingToken(token);
        setShowConfirmDialog(true);
      }, 1500);
    } catch (error: any) {
      console.error(
        '[SocialMediaRequirement] Failed to visit platform:',
        error
      );

      // Extract error message from various possible locations
      let errorMessage = 'Failed to process social media visit';
      let errorDescription = 'Please try again';

      const err = error as {
        code?: string;
        message?: string;
        response?: {
          status?: number;
          statusText?: string;
          data?: any;
        };
        statusCode?: number;
        responseData?: {
          message?: string;
          error?: string;
        };
      };

      // Try to extract message from different locations
      if (err?.response?.data) {
        const responseData = err.response.data;
        if (typeof responseData === 'string') {
          errorDescription = responseData;
        } else if (typeof responseData === 'object' && responseData !== null) {
          errorDescription =
            (responseData as any).message ||
            (responseData as any).error ||
            (responseData as any).detail ||
            errorDescription;
        }
      } else if (err?.responseData?.message) {
        errorDescription = err.responseData.message;
      } else if (err?.message) {
        errorDescription = err.message;
      }

      // Check for network errors
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !err?.statusCode);

      if (isNetworkError) {
        errorMessage = 'Unable to connect to server';
        errorDescription =
          'The backend server might be unavailable. Please check your connection and try again.';
      }

      // Check for specific status codes
      const statusCode = err?.response?.status || err?.statusCode;
      if (statusCode === 400) {
        errorMessage = 'Invalid request';
        errorDescription =
          errorDescription || 'Please check your input and try again';
      } else if (statusCode === 401 || statusCode === 403) {
        errorMessage = 'Authentication required';
        errorDescription =
          'Please log in again to verify social media platforms';
      } else if (statusCode === 429) {
        errorMessage = 'Too many attempts';
        errorDescription = 'Please wait a few minutes before trying again';
      } else if (
        statusCode === 500 ||
        statusCode === 502 ||
        statusCode === 503
      ) {
        errorMessage = 'Server error';
        errorDescription =
          'The server is experiencing issues. Please try again later.';
      }

      console.error('[SocialMediaRequirement] Error details:', {
        status: statusCode,
        statusText: err?.response?.statusText,
        code: err?.code,
        message: err?.message,
        responseData: err?.response?.data,
        errorMessage,
        errorDescription,
      });

      toast.error(errorMessage, {
        description: errorDescription,
      });
      setVerifyingPlatform(null);
    }
  };

  const handleConfirmPlatform = async (
    platform: SocialMediaPlatform,
    token?: string
  ) => {
    try {
      setVerifyingPlatform(platform);

      toast.info(`Verifying ${PLATFORM_CONFIG[platform].name} follow...`, {
        description: 'Please wait while we verify your follow',
      });

      // Step 2: Confirm platform visit
      // Try to get token from parameter, state, or use empty object (backend might handle it)
      const tokenToUse = token || visitTokens[platform];
      console.log('[SocialMediaRequirement] Confirming platform:', platform);
      console.log(
        '[SocialMediaRequirement] Token from parameter:',
        token ? 'yes' : 'no'
      );
      console.log(
        '[SocialMediaRequirement] Token from state:',
        visitTokens[platform] ? 'yes' : 'no'
      );
      console.log(
        '[SocialMediaRequirement] Token to use:',
        tokenToUse || 'none'
      );

      // Always send token in request body, even if undefined (backend might handle it)
      const confirmResponse = await socialMediaApi.confirmPlatform(
        platform,
        tokenToUse
      );

      console.log(
        '[SocialMediaRequirement] Confirm platform response:',
        confirmResponse
      );
      console.log('[SocialMediaRequirement] Response structure:', {
        success: confirmResponse.success,
        message: confirmResponse.message,
        hasData: !!confirmResponse.data,
        fullResponse: JSON.stringify(confirmResponse, null, 2),
      });

      if (confirmResponse.success) {
        toast.success(`${PLATFORM_CONFIG[platform].name} verified!`, {
          description: 'Your follow has been confirmed. Refreshing status...',
        });

        // Clear the token from state after successful verification
        setVisitTokens((prev) => {
          const updated = { ...prev };
          delete updated[platform];
          return updated;
        });

        // Wait a moment before refreshing to ensure backend has processed
        setTimeout(() => {
          // Refresh registration bonus status
          console.log(
            '[SocialMediaRequirement] Refreshing registration bonus status...'
          );
          onComplete();
        }, 1000); // Increased delay to ensure backend processing
      } else {
        throw new Error(confirmResponse.message || 'Verification failed');
      }
    } catch (error: any) {
      console.error(
        '[SocialMediaRequirement] Failed to confirm platform:',
        error
      );
      console.error('[SocialMediaRequirement] Error details:', {
        status: error?.response?.status,
        statusCode: error?.statusCode,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        responseData: error?.responseData,
        message: error?.message,
        fullError: JSON.stringify(error, null, 2),
      });

      // Extract error message from various possible locations
      let errorMessage = 'Verification failed';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.responseData?.message) {
        errorMessage = error.responseData.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Check for specific error codes
      const statusCode = error?.response?.status || error?.statusCode;
      if (statusCode === 400) {
        if (
          errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('missing')
        ) {
          toast.error('Verification failed', {
            description:
              'Please click on the platform icon again to get a new verification token',
          });
        } else {
          toast.error('Verification failed', {
            description:
              errorMessage ||
              'Please visit the platform first and wait a few seconds before confirming',
          });
        }
      } else if (statusCode === 429) {
        toast.error('Too many attempts', {
          description: 'Please wait a minute before trying again',
        });
      } else {
        toast.error('Verification failed', {
          description: errorMessage,
        });
      }
    } finally {
      setVerifyingPlatform(null);
    }
  };

  const handleDialogConfirm = () => {
    if (pendingPlatform) {
      handleConfirmPlatform(pendingPlatform, pendingToken);
    }
    setShowConfirmDialog(false);
    setPendingPlatform(null);
    setPendingToken(undefined);
  };

  const handleDialogCancel = () => {
    setShowConfirmDialog(false);
    setPendingPlatform(null);
    setPendingToken(undefined);
    setVerifyingPlatform(null);
  };

  const isComplete = socialData.completed >= socialData.total;

  // Always display all platforms (all 5 social media accounts)
  const displayedPlatforms =
    socialData.details.length > 0 ? socialData.details : []; // Fallback to empty if no details provided

  return (
    <>
      <SocialMediaConfirmDialog
        isOpen={showConfirmDialog}
        platform={pendingPlatform}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
      <div
        id="social-media-requirement"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderRadius: '12px',
          background: 'var(--neu-bg)',
          boxShadow: 'var(--neu-shadow-inset)',
          border: isComplete ? '2px solid rgba(34, 197, 94, 0.2)' : 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '12px',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  borderRadius: '10px',
                  background: isComplete
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'var(--neu-bg)',
                  boxShadow: isComplete ? 'none' : 'var(--neu-shadow-inset)',
                  border: isComplete
                    ? '1px solid rgba(34, 197, 94, 0.2)'
                    : 'none',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '1.125rem' }}>📱</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    marginBottom: '2px',
                    color: 'var(--neu-text-primary)',
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                  }}
                >
                  Verify {socialData.total} Socials
                </h3>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: isComplete
                      ? 'rgb(34, 197, 94)'
                      : 'var(--neu-text-secondary)',
                    lineHeight: '1.3',
                    fontWeight: isComplete ? 500 : 400,
                    wordBreak: 'break-word',
                  }}
                >
                  {socialData.completed}/{socialData.total} verified
                </p>
              </div>
            </div>
            {isComplete && (
              <CheckCircle2
                className="h-4 w-4"
                style={{ flexShrink: 0, color: 'rgb(34, 197, 94)' }}
              />
            )}
          </div>

          {/* Platform Icons - flex wrap so all 5 fit or wrap cleanly */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: 'auto',
              justifyContent: 'flex-start',
              alignContent: 'center',
            }}
          >
            {displayedPlatforms.map((platform) => {
              const config = PLATFORM_CONFIG[platform.platform];
              const isVerified = platform.isVerified;
              const isVerifying = verifyingPlatform === platform.platform;
              const IconComponent = config.icon;

              return (
                <button
                  key={platform.platform}
                  onClick={() =>
                    !isVerified &&
                    !isVerifying &&
                    handlePlatformClick(platform.platform)
                  }
                  disabled={isVerified || isVerifying}
                  className={cn(
                    'group/btn relative flex items-center justify-center transition-all duration-300',
                    isVerified
                      ? 'cursor-default'
                      : isVerifying
                        ? 'cursor-wait'
                        : 'cursor-pointer hover:scale-110 active:scale-95'
                  )}
                  title={config.name}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <IconComponent
                      className="h-7 w-7 transition-all duration-300"
                      style={{
                        color: isVerified
                          ? 'rgb(34, 197, 94)'
                          : isVerifying
                            ? 'var(--neu-accent)'
                            : 'var(--neu-text-secondary)',
                      }}
                    />
                    {isVerified && (
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        style={{
                          background: 'var(--neu-bg)',
                          position: 'absolute',
                          right: '-3px',
                          bottom: '-3px',
                          borderRadius: '50%',
                          color: 'rgb(34, 197, 94)',
                        }}
                      />
                    )}
                    {isVerifying && (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        style={{
                          background: 'var(--neu-bg)',
                          position: 'absolute',
                          right: '-3px',
                          bottom: '-3px',
                          borderRadius: '50%',
                          color: 'var(--neu-accent)',
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
