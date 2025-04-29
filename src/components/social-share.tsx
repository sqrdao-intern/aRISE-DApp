'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Send } from 'lucide-react';

interface SocialShareProps {
  userAriseCount: bigint;
  totalAriseCount: bigint;
  address?: string;
}

export function SocialShare({ userAriseCount, totalAriseCount, address }: SocialShareProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}?ref=${address}`;

  // Calculate the new count (current count + 1 for the just completed transaction)
  const newUserCount = BigInt(userAriseCount) + BigInt(1);
  const newTotalCount = BigInt(totalAriseCount) + BigInt(1);

  const shareText = `I just said aRISE ${newUserCount.toString()} time${newUserCount > 1 ? 's' : ''}! Join me in this journey to ${newTotalCount.toString()} total aRISEs! 🚀`;

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={handleTwitterShare}
        className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
      >
        <Twitter className="w-4 h-4 mr-2" />
        Share on X
      </Button>
      <Button
        onClick={handleTelegramShare}
        className="flex-1 bg-[#0088cc] hover:bg-[#0077b3] text-white"
      >
        <Send className="w-4 h-4 mr-2" />
        Share on Telegram
      </Button>
    </div>
  );
} 