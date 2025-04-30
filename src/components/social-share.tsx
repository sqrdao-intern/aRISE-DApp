'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Send } from 'lucide-react';

interface SocialShareProps {
  userAriseCount: bigint;
  totalAriseCount: bigint;
  address?: string;
  isNewTransaction?: boolean;
}

export function SocialShare({ userAriseCount, totalAriseCount, address, isNewTransaction = false }: SocialShareProps) {
  console.log('SocialShare rendered with props', { userAriseCount, totalAriseCount, address, isNewTransaction });
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}?ref=${address}`;

  // Only increment counts if it's a new transaction
  const displayUserCount = isNewTransaction ? BigInt(userAriseCount) + BigInt(1) : userAriseCount;
  const displayTotalCount = isNewTransaction ? BigInt(totalAriseCount) + BigInt(1) : totalAriseCount;

  const shareText = `I just said aRISE ${displayUserCount.toString()} time${displayUserCount > 1 ? 's' : ''} on the @rise_chain Testnet! Join me in this journey to spread aRISEs to the world! 🚀`;

  const handleTwitterShare = () => {
    console.log('Twitter share clicked:', shareText, shareUrl);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleTelegramShare = () => {
    console.log('Telegram share clicked:', shareText, shareUrl);
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
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