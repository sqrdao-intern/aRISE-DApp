'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseEther } from 'viem';
import { Loader2, Send } from 'lucide-react';
import { customToast } from '@/components/ui/custom-toast';
import { useAccount, useWalletClient } from 'wagmi';
import { cn } from '@/lib/utils';

interface TokenTransferProps {
  onTransferComplete?: () => void;
}

export function TokenTransfer({ onTransferComplete }: TokenTransferProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!walletClient || !address) {
      customToast.error('Error', 'Wallet not connected');
      return;
    }

    // Validate recipient address
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      customToast.error('Invalid Address', 'Please enter a valid recipient address');
      return;
    }

    // Validate amount
    try {
      const value = parseEther(amount);
      if (value <= 0n) throw new Error('Amount must be greater than 0');
    } catch (error) {
      customToast.error('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });

      customToast.info('Transaction Sent', 'Waiting for confirmation...');
      onTransferComplete?.();
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transfer error:', error);
      customToast.error('Transfer Failed', 'An error occurred during the transfer');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="inline-flex px-4 py-1 rounded-full border border-white/20 text-white/60">
            Not Connected
          </div>
          <p className="text-sm text-white/60">Connect your wallet to send ETH</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-6 bg-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Send ETH</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-white mb-1">
            Recipient Address
          </label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white mb-1">
            Amount (ETH)
          </label>
          <Input
            id="amount"
            type="number"
            step="0.000000000000000001"
            min="0"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
          />
        </div>
        <Button
          variant="gradient"
          size="lg"
          className={cn(
            'w-full gap-2 transition-all duration-200',
            isLoading && 'bg-yellow-500 hover:bg-yellow-600 text-white',
            (!isConnected || !recipient || !amount) && 'bg-gray-300 text-gray-800 border border-gray-400 shadow',
            !(isLoading || !isConnected || !recipient || !amount) && 'enabled:animate-pulse-subtle'
          )}
          onClick={handleTransfer}
          disabled={isLoading || !recipient || !amount}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </Card>
  );
} 