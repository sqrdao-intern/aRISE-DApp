"use client";

import { AriseButton } from '@/components/arise-button';
import { TokenDisplay } from '@/components/token-display';
import { TokenTransfer } from '@/components/token-transfer';
import { TransactionStatus } from '@/components/transaction-status';
import { useRiseChain } from '@/hooks/useRiseChain';
import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';
import { type TransactionReceipt } from 'viem';

export default function Home() {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-12 pt-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Say aRISE!</h1>
        <AriseButton />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
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
          <div>
            <TokenTransfer
              onTransferComplete={(hash) => {
                // Store the transaction hash and wait for confirmation
                setPendingTx(hash);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
