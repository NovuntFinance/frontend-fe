/**
 * Share Success Modal Component
 * Allows users to share their achievements with embedded referral links
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { toast } from '@/lib/toast';
import { Copy } from 'lucide-react';
// Social media icons (using react-icons)
import {
  FaWhatsapp,
  FaTelegram,
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
  referralCode,
}: ShareSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate referral link - Always use https://novunt.com
  const referralLink = `https://novunt.com/register?ref=${referralCode}`;

  // Create share message with referral link
  const shareMessage = `${data.message}\n\n🎯 Join me on Novunt and start earning!\n${referralLink}`;

  // Encode for URLs
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedLink = encodeURIComponent(referralLink);

  // Share URLs for different platforms
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(data.message)}`,
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
    toast.success(`Opening ${platform}... Spread the word! 🎉`);

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
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
      case 'profit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'stake':
        return '📈';
      case 'rank':
        return '🏆';
      case 'bonus':
        return '🎁';
      default:
        return '🎉';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-2xl">
            <span className="text-3xl">{getEmoji(type)}</span>
            {data.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            Share your success and earn more through referrals!
          </DialogDescription>
        </DialogHeader>

        {/* Amount Display (if applicable) */}
        {data.amount && (
          <div className="from-primary/20 border-primary/30 my-4 rounded-xl border bg-gradient-to-br to-purple-600/20 p-6">
            <div className="text-center">
              <div className="text-primary mb-1 text-4xl font-bold">
                ${data.amount.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">
                {type === 'profit' && 'Total Profit Earned'}
                {type === 'withdrawal' && 'Successfully Withdrawn'}
                {type === 'stake' && 'Stake Earnings'}
                {type === 'bonus' && 'Bonus Received'}
              </div>
            </div>
          </div>
        )}

        {/* Message Preview */}
        <div className="bg-muted space-y-2 rounded-lg p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium">
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
                <>
                  <Copy className="mr-1 h-3 w-3" /> Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-sm whitespace-pre-line">{shareMessage}</p>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleShare('whatsapp')}
            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            <FaWhatsapp className="mr-2 h-5 w-5" />
            WhatsApp
          </Button>

          <Button
            onClick={() => handleShare('telegram')}
            className="w-full bg-[#0088cc] hover:bg-[#006fa1] text-white"
            size="lg"
          >
            <FaTelegram className="mr-2 h-5 w-5" />
            Telegram
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to show share modal
export function showShareModal(
  type: ShareType,
  data: ShareData,
  referralCode: string
) {
  // This will be called from various components
  // Implementation depends on your modal state management
  // Could use Zustand, Context, or global event system

  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-share-modal', {
      detail: { type, data, referralCode },
    });
    window.dispatchEvent(event);
  }
}
