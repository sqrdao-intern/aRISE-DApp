'use client';

import { Button } from '@/components/ui/button';
import { useRiseChain } from '@/hooks/useRiseChain';
import { useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { ARISE_CONTRACT_ADDRESS, ARISE_CONTRACT_ABI } from '@/lib/constants';
import { formatEther } from 'viem';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { TransactionStatus } from '@/components/transaction-status';
import { customToast } from '@/components/ui/custom-toast';
import { handleBlockchainError } from '@/lib/error-handler';
import { BlockchainError } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCooldown } from '@/hooks/useCooldown';
import { Clock } from 'lucide-react';
import { SocialShare } from '@/components/social-share';

export function AriseButton() {
  const { isConnected, isOnRiseChain, address } = useRiseChain();
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [userAriseCount, setUserAriseCount] = useState<bigint>(BigInt(0));
  const [totalAriseCount, setTotalAriseCount] = useState<bigint>(BigInt(0));
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNewTransaction, setIsNewTransaction] = useState(false);
  const lastEventRef = useRef<string>('');
  
  const { isOnCooldown, formattedTime, startCooldown } = useCooldown(address);
  
  const { status, error, isLoading: isTransactionLoading } = useTransactionStatus(transactionHash, () => {
    // Refresh counts when transaction is confirmed
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 1000); // Animation duration
    // Start cooldown when transaction is confirmed
    startCooldown();
    // Mark as new transaction for sharing
    setIsNewTransaction(true);
    // Reset new transaction flag after a delay
    setTimeout(() => setIsNewTransaction(false), 5000);
  });

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        setTransactionHash(hash);
        setIsLoading(false);
      },
      onError: (error) => {
        handleBlockchainError(error);
        setIsLoading(false);
      },
    },
  });

  // Read user's arise count
  const { data: userCount, error: userCountError, refetch: refetchUserCount } = useReadContract({
    address: ARISE_CONTRACT_ADDRESS,
    abi: ARISE_CONTRACT_ABI,
    functionName: 'getUserAriseCount',
    args: address ? [address] : undefined,
  });

  // Read total arise count
  const { data: totalCount, error: totalCountError, refetch: refetchTotalCount } = useReadContract({
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
      if (logs.length === 0) return;
      
      const event = logs[0] as { args: { user: string } };
      const eventKey = `${event.args.user}-${Date.now()}`;
      
      // Only show toast if this is a new event
      if (eventKey !== lastEventRef.current) {
        lastEventRef.current = eventKey;
        customToast.info('New aRISE!', `User: ${event.args.user}`);
        // Refresh counts when new event is detected
        refetchUserCount();
        refetchTotalCount();
      }
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

    if (isOnCooldown) {
      customToast.warning('On Cooldown', `Please wait ${formattedTime} before saying aRISE again`);
      return;
    }

    setIsLoading(true);

    try {
      writeContract({
        address: ARISE_CONTRACT_ADDRESS,
        abi: ARISE_CONTRACT_ABI,
        functionName: 'sayArise',
        value: BigInt(1000000000000000), // 0.001 ETH
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <motion.div 
          className="p-2 sm:p-4 border rounded-lg"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-sm font-medium">Your aRISE Count</h3>
          <p className="text-xl sm:text-2xl font-bold">{userAriseCount.toString()}</p>
        </motion.div>
        <motion.div 
          className="p-2 sm:p-4 border rounded-lg"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-sm font-medium">Total aRISE Count</h3>
          <p className="text-xl sm:text-2xl font-bold">{totalAriseCount.toString()}</p>
        </motion.div>
      </div>
      
      {!isOnCooldown && (
        <TransactionStatus 
          status={status} 
          hash={transactionHash} 
          error={error} 
        />
      )}

      {isOnCooldown && (
        <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Cooldown: {formattedTime}</span>
        </div>
      )}

      <Button
        onClick={handleSayArise}
        disabled={!isConnected || !isOnRiseChain || isLoading || isTransactionLoading || isOnCooldown}
        className={cn(
          'w-full',
          status === 'success' && 'bg-green-500 hover:bg-green-600',
          status === 'error' && 'bg-red-500 hover:bg-red-600',
          status === 'pending' && 'bg-yellow-500 hover:bg-yellow-600',
          isOnCooldown && 'bg-gray-500 hover:bg-gray-600'
        )}
      >
        {isLoading || isTransactionLoading ? 'Processing...' : 'Say aRISE'}
      </Button>

      <SocialShare
        userAriseCount={userAriseCount}
        totalAriseCount={totalAriseCount}
        address={address}
        isNewTransaction={isNewTransaction}
      />
    </div>
  );
} 