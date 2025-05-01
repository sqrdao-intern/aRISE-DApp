"use client";

import { TokenDisplay } from '@/components/token-display';
import { TokenTransfer } from '@/components/token-transfer';
import { TransactionStatus } from '@/components/transaction-status';
import { useRiseChain } from '@/hooks/useRiseChain';
import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';

export default function WalletPage() {
  const { isConnected, address } = useRiseChain();
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const { data: transactionReceipt } = useWaitForTransactionReceipt({
    hash: pendingTx,
  });

  useEffect(() => {
    if (transactionReceipt) {
      setPendingTx(undefined);
      toast.success('Transaction confirmed!');
      
      // Delay refresh by 5 seconds
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 5000);
    }
  }, [transactionReceipt]);

  const onTransferComplete = (hash: `0x${string}`, senderAddress: string) => {
    setPendingTx(hash);
    console.log('Transaction completed by sender:', senderAddress);
    // Confirm point addition based on sender address
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Wallet</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <TokenDisplay
            key={refreshKey}
            address={address}
            isConnected={isConnected}
          />
          {pendingTx && (
            <TransactionStatus
              hash={pendingTx}
              receipt={transactionReceipt}
              status={transactionReceipt ? 'success' : 'pending'}
            />
          )}
        </div>
        <div className="lg:sticky lg:top-8 w-full">
          <TokenTransfer
            onTransferComplete={onTransferComplete}
          />
        </div>
      </div>
    </div>
  );
} 