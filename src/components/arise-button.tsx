'use client';

import { Button } from '@/components/ui/button';
import { useRiseChain } from '@/hooks/useRiseChain';
import { useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState, useEffect } from 'react';
import { ARISE_CONTRACT_ADDRESS, ARISE_CONTRACT_ABI } from '@/lib/constants';
import { formatEther } from 'viem';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { TransactionStatus } from '@/components/transaction-status';
import { customToast } from '@/components/ui/custom-toast';
import { handleBlockchainError } from '@/lib/error-handler';
import { BlockchainError } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

export function AriseButton() {
  const { isConnected, isOnRiseChain, address } = useRiseChain();
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [userAriseCount, setUserAriseCount] = useState<bigint>(BigInt(0));
  const [totalAriseCount, setTotalAriseCount] = useState<bigint>(BigInt(0));
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  
  const { status, error, isLoading: isTransactionLoading } = useTransactionStatus(transactionHash);

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        setTransactionHash(hash);
        customToast.success('Transaction Sent', `Hash: ${hash}`);
        setIsLoading(false);
      },
      onError: (error) => {
        handleBlockchainError(error);
        setIsLoading(false);
      },
    },
  });

  // Read user's arise count
  const { data: userCount, error: userCountError } = useReadContract({
    address: ARISE_CONTRACT_ADDRESS,
    abi: ARISE_CONTRACT_ABI,
    functionName: 'getUserAriseCount',
    args: address ? [address] : undefined,
  });

  // Read total arise count
  const { data: totalCount, error: totalCountError } = useReadContract({
    address: ARISE_CONTRACT_ADDRESS,
    abi: ARISE_CONTRACT_ABI,
    functionName: 'getTotalAriseCount',
  });

  // Watch for new arise events
  useWatchContractEvent({
    address: ARISE_CONTRACT_ADDRESS,
    abi: ARISE_CONTRACT_ABI,
    eventName: 'AriseSaid',
    onLogs: (logs) => {
      const event = logs[0] as { args: { user: string } };
      customToast.info('New aRISE!', `User: ${event.args.user}`);
    },
  });

  useEffect(() => {
    if (userCountError) {
      handleBlockchainError(userCountError);
    }
    if (totalCountError) {
      handleBlockchainError(totalCountError);
    }
  }, [userCountError, totalCountError]);

  useEffect(() => {
    if (userCount !== undefined) {
      setUserAriseCount(userCount);
    }
    if (totalCount !== undefined) {
      setTotalAriseCount(totalCount);
    }
  }, [userCount, totalCount]);

  const handleSayArise = async () => {
    if (!isConnected) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (!isOnRiseChain) {
      customToast.error('Wrong Network', 'Please switch to RISE Chain testnet');
      return;
    }

    if (!address) {
      customToast.error('Invalid Address', 'Please ensure your wallet is properly connected');
      return;
    }

    setIsLoading(true);

    try {
      writeContract({
        address: ARISE_CONTRACT_ADDRESS,
        abi: ARISE_CONTRACT_ABI,
        functionName: 'sayArise',
        value: BigInt(1000000000000000), // 0.001 RISE
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium">Your aRISE Count</h3>
          <p className="text-2xl font-bold">{userAriseCount.toString()}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium">Total aRISE Count</h3>
          <p className="text-2xl font-bold">{totalAriseCount.toString()}</p>
        </div>
      </div>
      
      <TransactionStatus 
        status={status} 
        hash={transactionHash} 
        error={error} 
      />

      <Button
        onClick={handleSayArise}
        disabled={!isConnected || !isOnRiseChain || isLoading || isTransactionLoading}
        className={cn(
          'w-full',
          status === 'success' && 'bg-green-500 hover:bg-green-600',
          status === 'error' && 'bg-red-500 hover:bg-red-600',
          status === 'pending' && 'bg-yellow-500 hover:bg-yellow-600'
        )}
      >
        {isLoading || isTransactionLoading ? 'Processing...' : 'Say aRISE'}
      </Button>
    </div>
  );
} 