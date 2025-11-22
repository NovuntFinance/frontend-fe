/**
 * Test Share Modal Button
 * Add this to any page to test the share modal
 * Remove after testing
 */

'use client';

import { Button } from '@/components/ui/button';
import { openShareModal } from '@/store/shareModalStore';
import { celebrateWithdrawal, celebrateProfitMilestone, celebrateBonus } from '@/lib/celebrations';

export function TestShareButton() {
    const testWithdrawal = () => {
        celebrateWithdrawal();
        openShareModal('withdrawal', {
            title: 'Withdrawal Successful!',
            message: '💸 Just withdrew $500 from Novunt!\nReal earnings, real results.',
            amount: 500,
        });
    };

    const testProfit = () => {
        celebrateProfitMilestone();
        openShareModal('profit', {
            title: "You've Earned $1,000!",
            message: '🎉 I just earned $1,000 on Novunt!\nStart staking and earn up to 200% returns.',
            amount: 1000,
        });
    };

    const testBonus = () => {
        celebrateBonus();
        openShareModal('bonus', {
            title: 'Welcome Bonus Earned!',
            message: '🎁 Got my $50 welcome bonus on Novunt!\nEasy money for new users.',
            amount: 50,
        });
    };

    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
            <Button onClick={testWithdrawal} className="bg-green-600 hover:bg-green-700">
                💸 Test Withdrawal Share
            </Button>
            <Button onClick={testProfit} className="bg-blue-600 hover:bg-blue-700">
                💰 Test Profit Share
            </Button>
            <Button onClick={testBonus} className="bg-purple-600 hover:bg-purple-700">
                🎁 Test Bonus Share
            </Button>
        </div>
    );
}
