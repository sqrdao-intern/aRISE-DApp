import { useState, useEffect, useRef } from 'react';

const COOLDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useCooldown(address?: string) {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Load last transaction time from localStorage
  const getLastTransactionTime = () => {
    if (!address) return 0;
    const stored = localStorage.getItem(`lastTransaction-${address}`);
    return stored ? parseInt(stored, 10) : 0;
  };

  // Save last transaction time to localStorage
  const setLastTransactionTime = (time: number) => {
    if (!address) return;
    localStorage.setItem(`lastTransaction-${address}`, time.toString());
  };

  // Calculate remaining cooldown time
  const calculateRemainingTime = () => {
    const lastTime = getLastTransactionTime();
    const now = Date.now();
    const elapsed = now - lastTime;
    const remaining = Math.max(0, COOLDOWN_DURATION - elapsed);
    return remaining;
  };

  // Start cooldown
  const startCooldown = () => {
    const now = Date.now();
    setLastTransactionTime(now);
    setIsOnCooldown(true);
    setRemainingTime(COOLDOWN_DURATION);
  };

  // Update remaining time
  useEffect(() => {
    if (!address) return;

    const updateRemainingTime = () => {
      const remaining = calculateRemainingTime();
      setRemainingTime(remaining);
      setIsOnCooldown(remaining > 0);
    };

    // Initial check
    updateRemainingTime();

    // Set up interval to update remaining time
    intervalRef.current = setInterval(updateRemainingTime, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [address]);

  // Format time as HH:MM:SS
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isOnCooldown,
    remainingTime,
    formattedTime: formatTime(remainingTime),
    startCooldown,
  };
} 