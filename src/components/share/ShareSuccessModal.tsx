/**
 * Share Success Modal Component
 * Allows users to share their achievements with embedded referral links
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Copy, Share2 } from 'lucide-react';
import Image from 'next/image';

// Social media icons (using react-icons)
import {
    FaWhatsapp,
    FaTwitter,
    FaFacebook,
    FaTelegram,
    FaLinkedin
} from 'react-icons/fa';

export type ShareType = 'profit' | 'withdrawal' | 'stake' | 'rank' | 'bonus';

interface ShareData {
    title: string;
    message: string;
    amount?: number;
    imageUrl?: string;
}

interface ShareSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: ShareType;
    data: ShareData;
    referralCode: string;
}

export function ShareSuccessModal({
    isOpen,
    onClose,
    type,
    data,
    referralCode
}: ShareSuccessModalProps) {
    const [copied, setCopied] = useState(false);

    // Generate referral link
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://novunt.com';
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;

    // Create share message with referral link
    const shareMessage = `${data.message}\n\n🎯 Join me on Novunt and start earning!\n${referralLink}`;

    // Encode for URLs
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedLink = encodeURIComponent(referralLink);

    // Share URLs for different platforms
    const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodedMessage}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodeURIComponent(data.message)}`,
        telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(data.message)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
    };

    // Handle social share
    const handleShare = (platform: keyof typeof shareUrls) => {
        // Track event (integrate with analytics)
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'share', {
                method: platform,
                content_type: type,
                item_id: data.amount,
            });
        }

        // Open share URL
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');

        // Celebration
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        toast.success(`Opening ${platform}... Spread the word! 🎉`);
    };

    // Handle copy
    const handleCopy = () => {
        navigator.clipboard.writeText(shareMessage);
        setCopied(true);

        toast.success('Message copied! Share anywhere!');

        setTimeout(() => setCopied(false), 3000);
    };

    // Get emoji based on type
    const getEmoji = (type: ShareType) => {
        switch (type) {
            case 'profit': return '💰';
            case 'withdrawal': return '💸';
            case 'stake': return '📈';
            case 'rank': return '🏆';
            case 'bonus': return '🎁';
            default: return '🎉';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
                        <span className="text-3xl">{getEmoji(type)}</span>
                        {data.title}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Share your success and earn more through referrals!
                    </DialogDescription>
                </DialogHeader>

                {/* Amount Display (if applicable) */}
                {data.amount && (
                    <div className="my-4 p-6 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl border border-primary/30">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary mb-1">
                                ${data.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {type === 'profit' && 'Total Profit Earned'}
                                {type === 'withdrawal' && 'Successfully Withdrawn'}
                                {type === 'stake' && 'Stake Earnings'}
                                {type === 'bonus' && 'Bonus Received'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Preview */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Your message:
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCopy}
                            className="h-7 text-xs"
                        >
                            {copied ? (
                                <>✓ Copied</>
                            ) : (
                                <><Copy className="h-3 w-3 mr-1" /> Copy</>
                            )}
                        </Button>
                    </div>
                    <p className="text-sm whitespace-pre-line">{shareMessage}</p>
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => handleShare('whatsapp')}
                            className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                        >
                            <FaWhatsapp className="mr-2 h-4 w-4" />
                            WhatsApp
                        </Button>

                        <Button
                            onClick={() => handleShare('twitter')}
                            className="bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white"
                        >
                            <FaTwitter className="mr-2 h-4 w-4" />
                            X/Twitter
                        </Button>

                        <Button
                            onClick={() => handleShare('facebook')}
                            className="bg-[#1877F2] hover:bg-[#1665D8] text-white"
                        >
                            <FaFacebook className="mr-2 h-4 w-4" />
                            Facebook
                        </Button>

                        <Button
                            onClick={() => handleShare('telegram')}
                            className="bg-[#0088cc] hover:bg-[#0077b3] text-white"
                        >
                            <FaTelegram className="mr-2 h-4 w-4" />
                            Telegram
                        </Button>

                        <Button
                            onClick={() => handleShare('linkedin')}
                            className="bg-[#0A66C2] hover:bg-[#084d8f] text-white col-span-2"
                        >
                            <FaLinkedin className="mr-2 h-4 w-4" />
                            LinkedIn
                        </Button>
                    </div>
                </div>

                {/* Referral Incentive */}
                <div className="p-3 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-2">
                        <span className="text-lg">💎</span>
                        <div className="flex-1">
                            <p className="text-xs font-medium mb-1">Referral Bonus</p>
                            <p className="text-xs text-muted-foreground">
                                Earn <strong>$10 bonus</strong> for each friend who joins and makes their first stake!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                >
                    Maybe Later
                </Button>
            </DialogContent>
        </Dialog>
    );
}

// Helper function to show share modal
export function showShareModal(type: ShareType, data: ShareData, referralCode: string) {
    // This will be called from various components
    // Implementation depends on your modal state management
    // Could use Zustand, Context, or global event system

    if (typeof window !== 'undefined') {
        const event = new CustomEvent('show-share-modal', {
            detail: { type, data, referralCode }
        });
        window.dispatchEvent(event);
    }
}
