import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, usePublicClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import { customToast } from '@/components/ui/custom-toast';
import { handleBlockchainError } from '@/lib/error-handler';
import { POINTS_CONTRACT_ABI, POINTS_CONTRACT_ADDRESS } from '@/lib/constants';

export function usePoints() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [points, setPoints] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read user's points
  const { data: userPoints, refetch: refetchPoints } = useReadContract({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    functionName: 'getUserPoints',
    args: address ? [address] : undefined,
  });

  // Check if transaction hash is used
  const { data: isTransactionUsed } = useReadContract({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    functionName: 'isTransactionHashUsed',
    args: ['0x0000000000000000000000000000000000000000000000000000000000000000'], // Placeholder hash
    query: {
      enabled: false, // Disable automatic execution
    }
  });

  const { writeContract } = useWriteContract({
    mutation: {
      onMutate: () => {
        console.log('Points Contract: Starting contract write');
      },
      onSuccess: (hash, variables) => {
        console.log('Points Contract: Transaction submitted successfully', { hash });
        setIsLoading(false);
        refetchPoints();
        // Show toast for social share after user signature
        if (variables.functionName === 'awardSocialSharePoints') {
          customToast.success('Points Updated', 'New Balance: +10 Points');
        }
      },
      onError: (error) => {
        console.error('Points Contract: Transaction failed', { error });
        handleBlockchainError(error);
        setIsLoading(false);
        setError(error.message);
      },
    },
  });

  // Configure and watch for PointsAwarded events targeting this user
  useWatchContractEvent({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    eventName: 'PointsAwarded',
    args: { user: address as `0x${string}` },
    onLogs: (logs) => {
      console.log('usePoints: PointsAwarded event received', { logs });
      if (logs.length === 0) return;
      const event = logs[0] as { args: { user: string; points: bigint; action: string } };
      console.log('usePoints: Raw event args', {
        user: event.args.user,
        points: event.args.points.toString(),
        action: event.args.action
      });
      console.log('usePoints: Processing PointsAwarded event', { event });
      if (event.args.user.toLowerCase() === address?.toLowerCase()) {
        console.log('Points Contract: Updating points for user', {
          user: event.args.user,
          newPoints: event.args.points.toString(),
          action: event.args.action
        });
        setPoints(prevPoints => {
          const newPoints = event.args.points;
          const delta = newPoints - prevPoints;
          // Only show toast for non-social-share actions (social share uses separate toast on write success)
          if (event.args.action !== 'socialShare') {
            customToast.success('Points Updated', `New Balance: +${delta.toString()} Points`);
          }
          return newPoints;
        });
      }
    },
  });

  // Update points when userPoints changes
  useEffect(() => {
    if (userPoints !== undefined) {
      setPoints(userPoints);
    }
  }, [userPoints]);

  const sayArise = async () => {
    if (!isConnected || !address) {
      console.log('Points Contract: sayArise called without wallet connection');
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    console.log('Points Contract: Initiating sayArise transaction');
    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'sayArise',
        value: BigInt(1000000000000000), // 0.001 ETH
      });
      console.log('Points Contract: sayArise transaction submitted');
    } catch (error) {
      console.error('Points Contract: sayArise transaction failed', { error });
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  const processTransactionHash = async (transactionHash: `0x${string}`) => {
    if (!isConnected || !address) {
      console.error('Points Contract: processTransactionHash called without wallet connection');
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (!publicClient) {
      console.error('Points Contract: Public client not available');
      customToast.error('Client Error', 'Public client not available');
      return;
    }

    console.log('Points Contract: Processing transaction hash', { transactionHash });
    setIsLoading(true);
    setError(null);

    try {
      console.log('Points Contract: Checking if transaction hash is used');
      const isUsed = await publicClient.readContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'isTransactionHashUsed',
        args: [transactionHash],
      });

      if (isUsed) {
        console.log('Points Contract: Transaction hash already used');
        customToast.error('Transaction Already Processed', 'This transaction has already been used to earn points');
        setIsLoading(false);
        return;
      }

      console.log('Points Contract: Submitting transaction hash for processing');
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'processTransactionHash',
        args: [transactionHash],
      });
    } catch (error) {
      console.error('Points Contract: Error processing transaction hash', {
        error,
        transactionHash
      });
      handleBlockchainError(error);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to process transaction');
      throw error;
    }
  };

  const awardSocialSharePoints = async () => {
    if (!isConnected || !address) {
      console.log('Points Contract: awardSocialSharePoints called without wallet connection');
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    console.log('Points Contract: Initiating social share points award');
    setIsLoading(true);
    setError(null);

    try {
      const tx = await writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'awardSocialSharePoints',
        args: [address],
      });
      console.log('Points Contract: Social share points transaction signed and submitted', tx);
      // Toast will be shown in onSuccess callback
      setIsLoading(false);
      return tx;
    } catch (error) {
      console.error('Points Contract: Social share points transaction failed', { error });
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  const burnPoints = async (amount: bigint) => {
    if (!isConnected || !address) {
      console.log('Points Contract: burnPoints called without wallet connection');
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (amount < BigInt(1000)) {
      console.log('Points Contract: Invalid burn amount', { amount });
      customToast.error('Invalid Amount', 'Minimum burn amount is 1000 points');
      return;
    }

    console.log('Points Contract: Initiating points burn', { amount: amount.toString() });
    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'burnPoints',
        args: [amount],
      });
      console.log('Points Contract: Points burn transaction submitted');
    } catch (error) {
      console.error('Points Contract: Points burn transaction failed', { error });
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  return {
    points,
    isLoading,
    error,
    sayArise,
    processTransactionHash,
    awardSocialSharePoints,
    burnPoints,
    refetchPoints,
  };
} 