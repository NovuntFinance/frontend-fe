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
import { Copy, Share2, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// Social media icons (using react-icons)
import {
  FaWhatsapp,
  FaFacebook,
  FaTelegram,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';

// TikTok icon - using a simple SVG component since react-icons may not have it
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

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
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

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
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodeURIComponent(data.message)}`,
    telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodeURIComponent(data.message)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing, will copy to clipboard
    tiktok: `https://www.tiktok.com/upload?lang=en`, // TikTok doesn't support direct sharing, will copy to clipboard
    youtube: `https://www.youtube.com/`, // YouTube doesn't support direct sharing, will copy to clipboard
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

    // For platforms that don't support direct sharing (Instagram, TikTok, YouTube)
    // Copy the message to clipboard and open the platform
    if (
      platform === 'instagram' ||
      platform === 'tiktok' ||
      platform === 'youtube'
    ) {
      navigator.clipboard.writeText(shareMessage);
      toast.success(
        `Message copied! Paste it on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`
      );
      window.open(shareUrls[platform], '_blank');
    } else {
      // Open share URL for platforms that support direct sharing
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform}... Spread the word! 🎉`);
    }

    // Close popover
    setShareMenuOpen(false);

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

        {/* Share Button with Popover Menu */}
        <div className="space-y-3">
          <Popover open={shareMenuOpen} onOpenChange={setShareMenuOpen}>
            <PopoverTrigger asChild>
              <Button className="w-full" size="lg">
                <Share2 className="mr-2 h-4 w-4" />
                Share
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleShare('whatsapp')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <FaWhatsapp className="h-5 w-5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  onClick={() => handleShare('facebook')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <FaFacebook className="h-5 w-5 text-[#1877F2]" />
                  <span>Facebook</span>
                </Button>

                <Button
                  onClick={() => handleShare('telegram')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <FaTelegram className="h-5 w-5 text-[#0088cc]" />
                  <span>Telegram</span>
                </Button>

                <Button
                  onClick={() => handleShare('instagram')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <FaInstagram className="h-5 w-5 text-[#E4405F]" />
                  <span>Instagram</span>
                </Button>

                <Button
                  onClick={() => handleShare('tiktok')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <TiktokIcon className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
                  <span>TikTok</span>
                </Button>

                <Button
                  onClick={() => handleShare('youtube')}
                  variant="ghost"
                  className="h-auto justify-start gap-2 py-2"
                >
                  <FaYoutube className="h-5 w-5 text-[#FF0000]" />
                  <span>YouTube</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Referral Incentive */}
        <div className="from-primary/10 border-primary/20 rounded-lg border bg-gradient-to-r to-purple-600/10 p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💎</span>
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium">Referral Bonus</p>
              <p className="text-muted-foreground text-xs">
                Earn <strong>$10 bonus</strong> for each friend who joins and
                makes their first stake!
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <Button variant="outline" onClick={onClose} className="w-full">
          Maybe Later
        </Button>
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
