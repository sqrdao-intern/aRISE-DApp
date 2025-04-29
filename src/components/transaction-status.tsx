'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatEther } from 'viem';
import { usePublicClient } from 'wagmi';
import { Progress } from '@/components/ui/progress';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: `0x${string}`;
  error?: string | null;
  receipt?: any;
  retryCount?: number;
}

export function TransactionStatus({ status, hash, error, receipt, retryCount }: TransactionStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const publicClient = usePublicClient();
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [confirmations, setConfirmations] = useState(0);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<bigint | null>(null);
  const REQUIRED_CONFIRMATIONS = 12; // Number of confirmations required for "finality"

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        if (confirmations > 0) {
          return `Confirming (${confirmations}/${REQUIRED_CONFIRMATIONS})${retryCount ? ` (Attempt ${retryCount})` : ''}...`;
        }
        return `Transaction in progress${retryCount ? ` (Attempt ${retryCount})` : ''}...`;
      case 'success':
        return 'Transaction successful!';
      case 'error':
        return 'Transaction failed';
      default:
        return 'Ready to transact';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-white/10 text-white border-white/20';
      case 'success':
        return 'bg-green-500/20 text-white border-green-400/30';
      case 'error':
        return 'bg-red-500/20 text-white border-red-400/30';
      default:
        return 'bg-white/10 text-white/90 border-white/20';
    }
  };

  const fetchTransactionDetails = async () => {
    if (!hash || !publicClient) return;
    try {
      const [tx, receipt, blockNumber] = await Promise.all([
        publicClient.getTransaction({ hash }),
        publicClient.getTransactionReceipt({ hash }),
        publicClient.getBlockNumber()
      ]);
      
      setTransactionDetails({ ...tx, ...receipt });
      setCurrentBlockNumber(blockNumber);
      
      if (receipt && receipt.blockNumber) {
        const confirmationBlocks = blockNumber - receipt.blockNumber;
        setConfirmations(Number(confirmationBlocks));
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && !transactionDetails) {
      fetchTransactionDetails();
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (status === 'success') return 100;
    if (status === 'error') return 0;
    if (confirmations >= REQUIRED_CONFIRMATIONS) return 100;
    return Math.min(Math.round((confirmations / REQUIRED_CONFIRMATIONS) * 100), 99);
  };

  return (
    <div className="space-y-2">
      <motion.div
        className={cn(
          'rounded-2xl border backdrop-blur-sm transition-colors duration-200',
          getStatusColor()
        )}
      >
        <button
          onClick={handleExpand}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className="font-medium text-lg">{getStatusText()}</span>
          </div>
          {hash && (
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-white/60" />
              ) : (
                <ChevronDown className="h-5 w-5 text-white/60" />
              )}
            </div>
          )}
        </button>

        {status === 'pending' && confirmations > 0 && (
          <div className="px-4 pb-4">
            <Progress 
              value={getProgressPercentage()} 
              className="h-2 bg-white/10"
            />
            <p className="text-sm mt-2 text-center text-white/60">
              {REQUIRED_CONFIRMATIONS - confirmations} more confirmations needed
            </p>
          </div>
        )}

        <AnimatePresence>
          {isExpanded && hash && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-white/60">Transaction Hash:</span>
                  <Link
                    href={`https://explorer.testnet.riselabs.xyz/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
                  >
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                {transactionDetails && (
                  <>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-white/60">Block Number:</span>
                      <span className="text-white">{transactionDetails.blockNumber?.toString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-white/60">Confirmations:</span>
                      <span className="text-white">{confirmations} blocks</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-white/60">Gas Used:</span>
                      <span className="text-white">{transactionDetails.gasUsed?.toString()} units</span>
                    </div>
                    {transactionDetails.value && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-white/60">Value:</span>
                        <span className="text-white">{formatEther(transactionDetails.value)} ETH</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-white/60">Status:</span>
                      <span className="text-white">{transactionDetails.status === 1 ? 'Success' : 'Failed'}</span>
                    </div>
                  </>
                )}

                {error && (
                  <div className="mt-2 text-sm text-red-200 bg-red-500/20 p-3 rounded-xl border border-red-400/30">
                    {error}
                  </div>
                )}

                {status === 'pending' && (
                  <div className="flex items-center justify-center gap-2 text-sm mt-2 text-white/80">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>
                      {confirmations > 0
                        ? `Waiting for ${REQUIRED_CONFIRMATIONS - confirmations} more confirmations...`
                        : 'Waiting for first confirmation...'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 