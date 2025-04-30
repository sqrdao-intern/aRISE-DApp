import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { customToast } from '@/components/ui/custom-toast';
import { handleBlockchainError } from '@/lib/error-handler';

// Points contract ABI
const POINTS_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'sayArise',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
    ],
    name: 'awardEthTransferPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'awardSocialSharePoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserPoints',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'burnPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Replace with actual contract address
const POINTS_CONTRACT_ADDRESS = '0x...';

export function usePoints() {
  const { address, isConnected } = useAccount();
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

  // Watch for points updates
  useWatchContractEvent({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    eventName: 'PointsUpdated',
    onLogs: (logs) => {
      if (logs.length === 0) return;
      const event = logs[0] as { args: { user: string; newPoints: bigint } };
      if (event.args.user.toLowerCase() === address?.toLowerCase()) {
        setPoints(event.args.newPoints);
        customToast.success('Points Updated', `New balance: ${event.args.newPoints.toString()}`);
      }
    },
  });

  // Update points when userPoints changes
  useEffect(() => {
    if (userPoints !== undefined) {
      setPoints(userPoints);
    }
  }, [userPoints]);

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        setIsLoading(false);
        refetchPoints();
      },
      onError: (error) => {
        handleBlockchainError(error);
        setIsLoading(false);
        setError(error.message);
      },
    },
  });

  const sayArise = async () => {
    if (!isConnected || !address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'sayArise',
        value: BigInt(1000000000000000), // 0.001 ETH
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  const awardEthTransferPoints = async (recipient: `0x${string}`) => {
    if (!isConnected || !address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'awardEthTransferPoints',
        args: [recipient],
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  const awardSocialSharePoints = async () => {
    if (!isConnected || !address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'awardSocialSharePoints',
        args: [address],
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  const burnPoints = async (amount: bigint) => {
    if (!isConnected || !address) {
      customToast.error('Wallet Not Connected', 'Please connect your wallet first');
      return;
    }

    if (amount < BigInt(1000)) {
      customToast.error('Invalid Amount', 'Minimum burn amount is 1000 points');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      writeContract({
        address: POINTS_CONTRACT_ADDRESS,
        abi: POINTS_CONTRACT_ABI,
        functionName: 'burnPoints',
        args: [amount],
      });
    } catch (error) {
      handleBlockchainError(error);
      setIsLoading(false);
    }
  };

  return {
    points,
    isLoading,
    error,
    sayArise,
    awardEthTransferPoints,
    awardSocialSharePoints,
    burnPoints,
    refetchPoints,
  };
} 