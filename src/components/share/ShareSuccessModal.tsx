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
import { Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiTiktok } from 'react-icons/si';

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

  // Referral link
  const referralLink = `https://novunt.com/register?ref=${referralCode}`;

  // Compose the persuasive share message with amount if available
  const amountLine =
    data.amount && data.amount > 0
      ? `\n\nI've already made $${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} on here.`
      : '';

  const shareMessage =
    `I'm not here to convince you.\n\n` +
    `I just tried something new recently… and it's been working better than I expected.\n\n` +
    `It doesn't require constant attention, and it's not one of those things that demands your time all day. It simply runs in the background while you focus on your life.\n\n` +
    `That's what made it interesting to me.` +
    amountLine +
    `\n\nIf you're curious, you can take a look here — there's a small welcome bonus when you get started:\n` +
    `👉 ${referralLink}\n\n` +
    `No pressure. Just see if it makes sense for you.`;

  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedLink = encodeURIComponent(referralLink);

  // Platform share URLs
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    x: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodeURIComponent(shareMessage)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support deep-link share; opens app/profile
    tiktok: `https://www.tiktok.com/`, // TikTok has no web share URL; opens app
  };

  type Platform = keyof typeof shareUrls;

  const platforms: {
    key: Platform;
    label: string;
    icon: React.ReactNode;
    bg: string;
    hover: string;
  }[] = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: <FaWhatsapp className="h-5 w-5" />,
      bg: 'bg-[#25D366]',
      hover: 'hover:bg-[#1da851]',
    },
    {
      key: 'x',
      label: 'X (Twitter)',
      icon: <FaXTwitter className="h-5 w-5" />,
      bg: 'bg-black',
      hover: 'hover:bg-neutral-800',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <FaFacebook className="h-5 w-5" />,
      bg: 'bg-[#1877F2]',
      hover: 'hover:bg-[#1465d0]',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: <FaInstagram className="h-5 w-5" />,
      bg: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
      hover: 'hover:opacity-90',
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      icon: <SiTiktok className="h-5 w-5" />,
      bg: 'bg-black',
      hover: 'hover:bg-neutral-800',
    },
  ];

  const handleShare = (platform: Platform) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: type,
        item_id: data.amount,
      });
    }

    // Instagram and TikTok: copy message first, then open app
    if (platform === 'instagram' || platform === 'tiktok') {
      navigator.clipboard.writeText(shareMessage).catch(() => {});
      toast.success(
        `Message copied! Paste it when you open ${platform === 'instagram' ? 'Instagram' : 'TikTok'} 📋`
      );
    } else {
      toast.success(`Opening ${platform}… Spread the word! 🎉`);
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=500');

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    toast.success('Message copied! Share anywhere 🎉');
    setTimeout(() => setCopied(false), 3000);
  };

  const getEmoji = (t: ShareType) => {
    switch (t) {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-2xl">
            <span className="text-3xl">{getEmoji(type)}</span>
            {data.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            Share your success and earn more through referrals!
          </DialogDescription>
        </DialogHeader>

        {/* Amount Display */}
        {data.amount && data.amount > 0 && (
          <div className="from-primary/20 border-primary/30 my-2 rounded-xl border bg-gradient-to-br to-purple-600/20 p-5">
            <div className="text-center">
              <div className="text-primary mb-1 text-4xl font-bold">
                $
                {data.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-muted-foreground text-sm">
                {type === 'profit' && 'Total Earned on Novunt'}
                {type === 'withdrawal' && 'Successfully Withdrawn'}
                {type === 'stake' && 'Stake Earnings'}
                {type === 'bonus' && 'Bonus Received'}
              </div>
            </div>
          </div>
        )}

        {/* Message Preview */}
        <div className="bg-muted rounded-lg p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Your message:
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 gap-1 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {shareMessage}
          </p>
        </div>

        {/* Share Buttons — 2 rows */}
        <div className="space-y-2">
          {/* Row 1: WhatsApp + X */}
          <div className="grid grid-cols-2 gap-2">
            {platforms.slice(0, 2).map(({ key, label, icon, bg, hover }) => (
              <Button
                key={key}
                onClick={() => handleShare(key)}
                className={`w-full text-white ${bg} ${hover}`}
                size="lg"
              >
                {icon}
                <span className="ml-2">{label}</span>
              </Button>
            ))}
          </div>
          {/* Row 2: Facebook + Instagram + TikTok */}
          <div className="grid grid-cols-3 gap-2">
            {platforms.slice(2).map(({ key, label, icon, bg, hover }) => (
              <Button
                key={key}
                onClick={() => handleShare(key)}
                className={`w-full text-white ${bg} ${hover}`}
                size="default"
              >
                {icon}
                <span className="ml-1 text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          For Instagram &amp; TikTok, the message is copied automatically — just
          paste it in your post or bio.
        </p>
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
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-share-modal', {
      detail: { type, data, referralCode },
    });
    window.dispatchEvent(event);
  }
}
