import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { customToast } from '@/components/ui/custom-toast';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function useTransactionStatus(hash?: `0x${string}`) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const publicClient = usePublicClient();

  const { data: receipt, isError, isLoading } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    pollingInterval: 2000, // Poll every 2 seconds
  });

  // Calculate retry delay with exponential backoff
  const getRetryDelay = () => {
    return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  };

  // Fallback mechanism to check transaction status
  const checkTransactionStatus = async () => {
    if (!hash || !publicClient) return;

    try {
      const currentTime = Date.now();
      // Only check if it's been more than 5 seconds since last check
      if (currentTime - lastChecked < 5000) return;

      setLastChecked(currentTime);
      console.log('Checking transaction status for hash:', hash);

      const receipt = await publicClient.getTransactionReceipt({ hash });
      console.log('Transaction receipt:', receipt);

      if (receipt) {
        setStatus('success');
        setRetryCount(0);
        customToast.success('Transaction confirmed!', `Block: ${receipt.blockNumber}`);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      
      if (retryCount < MAX_RETRIES) {
        const delay = getRetryDelay();
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkTransactionStatus();
        }, delay);
      } else {
        setStatus('error');
        setError('Failed to confirm transaction status. Please check the explorer manually.');
        customToast.error(
          'Connection Error',
          'Unable to confirm transaction status. Please check the explorer manually.'
        );
      }
    }
  };

  useEffect(() => {
    if (hash) {
      setStatus('pending');
      setError(null);
      setRetryCount(0);
      console.log('Transaction hash received:', hash);
      
      // Start fallback polling
      const interval = setInterval(checkTransactionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [hash]);

  useEffect(() => {
    if (receipt) {
      console.log('Transaction receipt received:', receipt);
      setStatus('success');
      setRetryCount(0);
      customToast.success('Transaction confirmed!', `Block: ${receipt.blockNumber}`);
    }
  }, [receipt]);

  useEffect(() => {
    if (isError) {
      console.error('Transaction error:', isError);
      setStatus('error');
      setError('Transaction failed');
      customToast.error('Transaction failed', 'Please try again later');
    }
  }, [isError]);

  return {
    status,
    error,
    isLoading,
    receipt,
    hash,
    retryCount,
  };
} 