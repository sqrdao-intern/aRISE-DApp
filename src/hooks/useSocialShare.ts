import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { customToast } from '@/components/ui/custom-toast';
import { POINTS_CONTRACT_ADDRESS, POINTS_CONTRACT_ABI } from '@/lib/constants';
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '@/lib/constants';

/**
 * Hook to handle social share flow with actions API
 * 1) Prompt user to sign awardSocialSharePoints
 * 2) Wait for on-chain receipt
 * 3) Show toast and delay opening share window
 */
export function useSocialShare(shareText: string, shareUrl: string) {
  const { address } = useAccount();

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const shareOnTwitter = useCallback(async () => {
    if (!address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }
    try {
      // 1) send transaction using actions API
      const txHash = await writeContract(config,
        {
          address: POINTS_CONTRACT_ADDRESS,
          abi: POINTS_CONTRACT_ABI,
          functionName: 'awardSocialSharePoints',
          args: [address],
        }
      );
      // 2) wait for on-chain receipt
      await waitForTransactionReceipt(config, { hash: txHash });
      // 3) show toast and delayed share
      customToast.success('Points Updated', 'New Balance: +10 Points');
      setTimeout(() => window.open(twitterUrl, '_blank'), 2000);
    } catch (error) {
      console.error('SocialShare (Twitter) failed', error);
      customToast.error('Sharing Failed', 'Could not award share points');
    }
  }, [address, twitterUrl]);

  const shareOnTelegram = useCallback(async () => {
    if (!address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }
    try {
      const txHash = await writeContract(config,
        {
          address: POINTS_CONTRACT_ADDRESS,
          abi: POINTS_CONTRACT_ABI,
          functionName: 'awardSocialSharePoints',
          args: [address],
        }
      );
      await waitForTransactionReceipt(config, { hash: txHash });
      customToast.success('Points Updated', 'New Balance: +10 Points');
      setTimeout(() => window.open(telegramUrl, '_blank'), 2000);
    } catch (error) {
      console.error('SocialShare (Telegram) failed', error);
      customToast.error('Sharing Failed', 'Could not award share points');
    }
  }, [address, telegramUrl]);

  return { shareOnTwitter, shareOnTelegram };
} 