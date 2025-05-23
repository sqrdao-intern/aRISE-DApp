'use client';

import { Button } from '@/components/ui/button';
import { useRiseChain } from '@/hooks/useRiseChain';
import { useWriteContract, useReadContract, useWatchContractEvent } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { ARISE_CONTRACT_ADDRESS, ARISE_CONTRACT_ABI, POINTS_CONTRACT_ADDRESS, POINTS_CONTRACT_ABI } from '@/lib/constants';
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
import { usePoints } from '@/hooks/usePoints';

export function AriseButton() {
  const { isConnected, isOnRiseChain, address } = useRiseChain();
  const { refetchPoints } = usePoints();
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<string>('0');
  const [userAriseCount, setUserAriseCount] = useState<bigint>(BigInt(0));
  const [totalAriseCount, setTotalAriseCount] = useState<bigint>(BigInt(0));
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNewTransaction, setIsNewTransaction] = useState(false);
  const lastEventRef = useRef<string>('');
  
  const { isOnCooldown, formattedTime, startCooldown } = useCooldown(address);

  const timerIds = useRef<number[]>([]);
  
  const { status, error, isLoading: isTransactionLoading } = useTransactionStatus(transactionHash, () => {
    // Show toast on transaction confirmation
    customToast.success('Points Updated', `New Balance: +20 Points`);
    // Refresh counts when transaction is confirmed
    setIsUpdating(true);
    timerIds.current.push(window.setTimeout(() => setIsUpdating(false), 1000));
    // Start cooldown when transaction is confirmed
    startCooldown();
    // Mark as new transaction for sharing
    setIsNewTransaction(true);
    // Reset new transaction flag after a delay
    timerIds.current.push(
      window.setTimeout(() => setIsNewTransaction(false), 5000)
    );
    // Refresh points and arise counts after a short delay to ensure blockchain state is updated
    timerIds.current.push(window.setTimeout(() => {
        refetchPoints();
        refetchUserCount();
        refetchTotalCount();
      }, 2000)
    );
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

  // Watch for points updates
  useWatchContractEvent({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    eventName: 'PointsAwarded',
    onLogs: (logs) => {
      if (logs.length === 0) return;
      const event = logs[0] as { args: { user: string; points: bigint; action: string } };
      if (event.args.user.toLowerCase() === address?.toLowerCase()) {
        // Refresh all counts when points are updated
        refetchPoints();
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

  // Reset aRISE counts when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setUserAriseCount(BigInt(0));
    }
  }, [isConnected]);

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
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div 
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-white/80">Your aRISE Count</h3>
          <p className="text-4xl font-bold text-white mt-2">{userAriseCount.toString()}</p>
        </motion.div>
        <motion.div 
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-medium text-white/80">Total aRISE Count</h3>
          <p className="text-4xl font-bold text-white mt-2">{totalAriseCount.toString()}</p>
        </motion.div>
      </div>
      
      {isOnCooldown && (
        <div className="flex items-center justify-center gap-2 p-4 bg-white/95 text-black/80 rounded-2xl border border-white/20 backdrop-blur-sm">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Cooldown: {formattedTime}</span>
        </div>
      )}

      {!isOnCooldown && status && (
        <TransactionStatus 
          status={status} 
          hash={transactionHash} 
          error={error} 
        />
      )}

      <Button
        onClick={handleSayArise}
        disabled={!isConnected || !isOnRiseChain || isLoading || isTransactionLoading || isOnCooldown}
        variant="gradient"
        size="lg"
        className={cn(
          'w-full h-14 text-lg font-medium rounded-2xl transition-all duration-200',
          'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
          'enabled:bg-gradient-to-r enabled:from-white enabled:to-white/20 enabled:text-black',
          status === 'success' && 'bg-green-500/80 hover:bg-green-600/80 border-green-400/30',
          status === 'error' && 'bg-red-500/80 hover:bg-red-600/80 border-red-400/30',
          status === 'pending' && 'bg-yellow-500/80 hover:bg-yellow-600/80 border-yellow-400/30',
          isOnCooldown && 'bg-white/5 text-white/40 border-white/10',
          (!isConnected || !isOnRiseChain) && 'bg-white/5 text-white/40 border-white/10',
          !(isOnCooldown || status) && 'enabled:animate-pulse-subtle'
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