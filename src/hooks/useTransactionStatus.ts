import { useState, useEffect, useRef } from 'react';
import { useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { customToast } from '@/components/ui/custom-toast';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const NOTIFICATION_COOLDOWN = 10000; // 10 seconds

export function useTransactionStatus(hash?: `0x${string}`, onSuccess?: () => void) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const lastNotificationTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const hasCalledSuccessRef = useRef(false);
  const publicClient = usePublicClient();

  // Update success callback ref when it changes
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const { data: receipt, isError, isLoading } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    pollingInterval: 2000, // Poll every 2 seconds
  });

  // Calculate retry delay with exponential backoff
  const getRetryDelay = () => {
    return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  };

  // Centralized notification function
  const showNotification = (type: 'success' | 'error' | 'warning', title: string, description?: string) => {
    const now = Date.now();
    if (now - lastNotificationTime.current < NOTIFICATION_COOLDOWN) {
      console.log('Skipping notification due to cooldown');
      return;
    }
    lastNotificationTime.current = now;
    
    switch (type) {
      case 'success':
        customToast.success(title, description);
        break;
      case 'error':
        customToast.error(title, description);
        break;
      case 'warning':
        customToast.warning(title, description);
        break;
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset state when hash changes
  useEffect(() => {
    if (hash) {
      setStatus('pending');
      setError(null);
      setRetryCount(0);
      hasCalledSuccessRef.current = false;
      console.log('Transaction hash received:', hash);
    }
    return () => {
      cleanup();
      hasCalledSuccessRef.current = false;
    };
  }, [hash]);

  // Fallback mechanism to check transaction status
  const checkTransactionStatus = async () => {
    if (!hash || !publicClient || status === 'success' || hasCalledSuccessRef.current) return;

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
        cleanup(); // Stop the fallback mechanism
        showNotification('success', 'Transaction confirmed!', `Block: ${receipt.blockNumber}`);
        if (!hasCalledSuccessRef.current && onSuccessRef.current) {
          hasCalledSuccessRef.current = true;
          onSuccessRef.current();
        }
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
        cleanup(); // Stop the fallback mechanism
        showNotification('error', 'Connection Error', 'Unable to confirm transaction status. Please check the explorer manually.');
      }
    }
  };

  useEffect(() => {
    if (hash && !hasCalledSuccessRef.current) {
      // Start fallback polling
      cleanup(); // Clear any existing interval
      intervalRef.current = setInterval(checkTransactionStatus, 5000);
      return cleanup;
    }
  }, [hash]);

  useEffect(() => {
    if (receipt && !hasCalledSuccessRef.current) {
      console.log('Transaction receipt received:', receipt);
      setStatus('success');
      setRetryCount(0);
      cleanup(); // Stop the fallback mechanism
      showNotification('success', 'Transaction confirmed!', `Block: ${receipt.blockNumber}`);
      if (onSuccessRef.current) {
        hasCalledSuccessRef.current = true;
        onSuccessRef.current();
      }
    }
  }, [receipt]);

  useEffect(() => {
    if (isError) {
      console.error('Transaction error:', isError);
      setStatus('error');
      setError('Transaction failed');
      cleanup(); // Stop the fallback mechanism
      showNotification('error', 'Transaction failed', 'Please try again later');
    }
  }, [isError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      hasCalledSuccessRef.current = false;
    };
  }, []);

  return {
    status,
    error,
    isLoading,
    receipt,
    hash,
    retryCount,
  };
} 