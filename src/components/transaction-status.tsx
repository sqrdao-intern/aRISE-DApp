'use client';

import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: string | null;
}

export function TransactionStatus({ status, hash, error }: TransactionStatusProps) {
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
        return 'Transaction in progress...';
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
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg border',
          getStatusColor()
        )}
      >
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      {hash && (
        <div className="text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Transaction Hash:</span>
            <Link
              href={`https://explorer.testnet.riselabs.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              {hash.slice(0, 6)}...{hash.slice(-4)}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      {error && (
        <div className="text-sm text-red-500">
          Error: {error}
        </div>
      )}
    </div>
  );
} 