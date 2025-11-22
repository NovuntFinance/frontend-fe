/**
 * Share and Social Proof Provider
 * Integrates share modal and social proof components globally
 */

'use client';

import { ShareSuccessModal } from '@/components/share/ShareSuccessModal';
import { LiveActivityFeed } from '@/components/social-proof/LiveActivityFeed';
import { useShareModalStore } from '@/store/shareModalStore';
import { useShareTriggers } from '@/hooks/useShareTriggers';
import { useAuthStore } from '@/store/authStore';

export function ShareAndSocialProofProvider() {
    // Initialize share triggers
    useShareTriggers();

    // Get share modal state
    const { isOpen, type, data, closeShareModal } = useShareModalStore();

    // Get user's referral code
    const user = useAuthStore(state => state.user);
    const referralCode = user?.referralCode || '';

    return (
        <>
            {/* Share Success Modal */}
            {isOpen && type && data && (
                <ShareSuccessModal
                    isOpen={isOpen}
                    onClose={closeShareModal}
                    type={type}
                    data={data}
                    referralCode={referralCode}
                />
            )}

            {/* Live Activity Feed */}
            <LiveActivityFeed />
        </>
    );
}
