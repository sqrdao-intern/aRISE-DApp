'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseEther } from 'viem';
import { Loader2, Send } from 'lucide-react';
import { customToast } from '@/components/ui/custom-toast';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoints } from '@/hooks/usePoints';

interface TokenTransferProps {
  onTransferComplete?: (hash: `0x${string}`, senderAddress: string) => void;
}

export function TokenTransfer({ onTransferComplete }: TokenTransferProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { processTransactionHash } = usePoints();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!isConnected || !address || !walletClient) {
      console.log('TokenTransfer: Transfer attempted without wallet connection');
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      console.log('TokenTransfer: Invalid input', { recipient, amount });
      customToast.error('Invalid Input', 'Please enter both recipient address and amount');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Send ETH
      console.log('TokenTransfer: Initiating ETH transfer', {
        to: recipient,
        value: amount,
        from: address
      });
      
      const hash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
      console.log('TokenTransfer: ETH transaction sent', { hash });

      // Wait for transaction confirmation
      if (!publicClient) {
        console.error('TokenTransfer: Public client not available');
        throw new Error('Public client not available');
      }
      
      console.log('TokenTransfer: Waiting for transaction confirmation');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('TokenTransfer: Transaction confirmed', { receipt });

      // Process the transaction hash for points
      console.log('TokenTransfer: Processing transaction hash for points');
      await processTransactionHash(hash);
      console.log('TokenTransfer: Points processing completed');

      // Notify parent component
      if (onTransferComplete) {
        console.log('TokenTransfer: Notifying parent of completion', { hash, sender: address });
        onTransferComplete(hash, address);
      }

      // Clear form
      setRecipient('');
      setAmount('');
      customToast.success('Transfer Complete', 'ETH sent and points processed successfully');
    } catch (error) {
      console.error('TokenTransfer: Transfer failed', {
        error,
        state: {
          isConnected,
          address,
          recipient,
          amount,
          isLoading
        }
      });
      const errorMessage = error instanceof Error ? error.message : 'Failed to send ETH';
      setError(errorMessage);
      customToast.error('Transfer Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 bg-white/10 backdrop-blur-lg">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Recipient Address
          </label>
          <Input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={cn(
              'bg-white/5 border-white/20',
              error && 'border-red-500'
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Amount (ETH)
          </label>
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={cn(
              'bg-white/5 border-white/20',
              error && 'border-red-500'
            )}
          />
        </div>
        <Button
          onClick={handleTransfer}
          disabled={isLoading || !recipient || !amount}
          variant="gradient"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send ETH
        </Button>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </Card>
  );
}