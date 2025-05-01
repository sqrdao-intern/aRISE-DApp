'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Send, Loader2 } from 'lucide-react';
import { useSocialShare } from '@/hooks/useSocialShare';
import { customToast } from '@/components/ui/custom-toast';

interface SocialShareProps {
  userAriseCount: bigint;
  totalAriseCount: bigint;
  address?: string;
  isNewTransaction?: boolean;
}

export function SocialShare({ userAriseCount, totalAriseCount, address, isNewTransaction = false }: SocialShareProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}?ref=${address}`;
  const shareText = `I just said aRISE ${((isNewTransaction ? BigInt(userAriseCount) + BigInt(1) : userAriseCount).toString())} time${(isNewTransaction ? BigInt(userAriseCount) + BigInt(1) : userAriseCount) > 1n ? 's' : ''} on the @rise_chain Testnet! Join me in this journey to spread aRISEs to the world! 🚀`;
  const { shareOnTwitter, shareOnTelegram } = useSocialShare(shareText, shareUrl);

  const handleTwitterShare = async () => {
    try {
      await shareOnTwitter();
    } catch (error) {
      console.error('SocialShare: Twitter share toast failed', error);
    }
  };
  const handleTelegramShare = async () => {
    try {
      await shareOnTelegram();
    } catch (error) {
      console.error('SocialShare: Telegram share toast failed', error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button
        onClick={handleTwitterShare}
        className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
      >
        Share on X
      </Button>
      <Button
        onClick={handleTelegramShare}
        className="flex-1 bg-[#0088cc] hover:bg-[#0077b3] text-white"
      >
        Share on Telegram
      </Button>
    </div>
  );
} 