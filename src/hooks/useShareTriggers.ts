/**
 * Share Success Triggers
 * Auto-triggers share modal at key success moments
 */

'use client';

import { useEffect } from 'react';
import { openShareModal } from '@/store/shareModalStore';

// Milestone thresholds
const PROFIT_MILESTONES = [100, 500, 1000, 5000, 10000];

// Track shown milestones to avoid duplicates
const shownMilestones = new Set<string>();

export function useShareTriggers() {
    useEffect(() => {
        // Trigger 1: Profit Milestone Reached
        const handleProfitMilestone = (event: CustomEvent) => {
            const { totalEarnings } = event.detail;

            // Find highest milestone reached
            const milestone = PROFIT_MILESTONES
                .filter(m => totalEarnings >= m)
                .sort((a, b) => b - a)[0];

            if (milestone && !shownMilestones.has(`profit-${milestone}`)) {
                shownMilestones.add(`profit-${milestone}`);

                openShareModal('profit', {
                    title: `You've Earned $${milestone}!`,
                    message: `🎉 I just earned $${totalEarnings.toLocaleString()} on Novunt!\nStart staking and earn up to 200% returns.`,
                    amount: totalEarnings,
                });
            }
        };

        // Trigger 2: Withdrawal Completed
        const handleWithdrawalSuccess = (event: CustomEvent) => {
            const { amount, reference } = event.detail;

            if (!shownMilestones.has(`withdrawal-${reference}`)) {
                shownMilestones.add(`withdrawal-${reference}`);

                openShareModal('withdrawal', {
                    title: 'Withdrawal Successful!',
                    message: `💸 Just withdrew $${amount.toLocaleString()} from Novunt!\nReal earnings, real results.`,
                    amount,
                });
            }
        };

        // Trigger 3: Stake Completed with Profit
        const handleStakeCompleted = (event: CustomEvent) => {
            const { stakeId, principal, earnings, totalReturn } = event.detail;

            if (earnings > 0 && !shownMilestones.has(`stake-${stakeId}`)) {
                shownMilestones.add(`stake-${stakeId}`);

                const roi = ((earnings / principal) * 100).toFixed(1);

                openShareModal('stake', {
                    title: 'Stake Completed!',
                    message: `📈 My $${principal.toLocaleString()} stake just earned $${earnings.toLocaleString()}!\n${roi}% return on Novunt.`,
                    amount: earnings,
                });
            }
        };

        // Trigger 4: Rank Achievement
        const handleRankAchieved = (event: CustomEvent) => {
            const { rank, totalEarnings } = event.detail;

            if (!shownMilestones.has(`rank-${rank}`)) {
                shownMilestones.add(`rank-${rank}`);

                openShareModal('rank', {
                    title: `${rank} Status Achieved!`,
                    message: `🏆 Just achieved ${rank} status on Novunt!\nTotal earnings: $${totalEarnings.toLocaleString()}`,
                    amount: totalEarnings,
                });
            }
        };

        // Trigger 5: Registration Bonus Completed
        const handleBonusCompleted = (event: CustomEvent) => {
            const { bonusAmount } = event.detail;

            if (!shownMilestones.has('bonus-registration')) {
                shownMilestones.add('bonus-registration');

                openShareModal('bonus', {
                    title: 'Welcome Bonus Earned!',
                    message: `🎁 Got my $${bonusAmount} welcome bonus on Novunt!\nEasy money for new users.`,
                    amount: bonusAmount,
                });
            }
        };

        // Subscribe to custom events
        window.addEventListener('profit:milestone', handleProfitMilestone as EventListener);
        window.addEventListener('withdrawal:success', handleWithdrawalSuccess as EventListener);
        window.addEventListener('stake:completed', handleStakeCompleted as EventListener);
        window.addEventListener('rank:achieved', handleRankAchieved as EventListener);
        window.addEventListener('bonus:completed', handleBonusCompleted as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('profit:milestone', handleProfitMilestone as EventListener);
            window.removeEventListener('withdrawal:success', handleWithdrawalSuccess as EventListener);
            window.removeEventListener('stake:completed', handleStakeCompleted as EventListener);
            window.removeEventListener('rank:achieved', handleRankAchieved as EventListener);
            window.removeEventListener('bonus:completed', handleBonusCompleted as EventListener);
        };
    }, []);
}

// Helper functions to trigger events from components

export function triggerProfitMilestone(totalEarnings: number) {
    const event = new CustomEvent('profit:milestone', {
        detail: { totalEarnings }
    });
    window.dispatchEvent(event);
}

export function triggerWithdrawalSuccess(amount: number, reference: string) {
    const event = new CustomEvent('withdrawal:success', {
        detail: { amount, reference }
    });
    window.dispatchEvent(event);
}

export function triggerStakeCompleted(
    stakeId: string,
    principal: number,
    earnings: number,
    totalReturn: number
) {
    const event = new CustomEvent('stake:completed', {
        detail: { stakeId, principal, earnings, totalReturn }
    });
    window.dispatchEvent(event);
}

export function triggerRankAchieved(rank: string, totalEarnings: number) {
    const event = new CustomEvent('rank:achieved', {
        detail: { rank, totalEarnings }
    });
    window.dispatchEvent(event);
}

export function triggerBonusCompleted(bonusAmount: number) {
    const event = new CustomEvent('bonus:completed', {
        detail: { bonusAmount }
    });
    window.dispatchEvent(event);
}
