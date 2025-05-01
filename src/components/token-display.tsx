'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUpRight, ArrowDownLeft, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { customToast } from '@/components/ui/custom-toast';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import type { Transaction as ViemTransaction } from 'viem';

type BlockTransaction = {
  blockHash: `0x${string}`;
  blockNumber: bigint;
  from: `0x${string}`;
  gas: bigint;
  hash: `0x${string}`;
  input: `0x${string}`;
  nonce: number;
  to: `0x${string}` | null;
  transactionIndex: number;
  value: bigint;
  type: "legacy" | "eip1559" | "eip2930";
  chainId: number;
  v: bigint;
  r: `0x${string}`;
  s: `0x${string}`;
};

interface Transaction {
  hash: `0x${string}`;
  type: 'sent' | 'received';
  value: bigint;
  from: `0x${string}`;
  to: `0x${string}` | null;
  blockNumber: bigint;
  timestamp: number;
}

interface ExplorerTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  isError: string;
  txreceipt_status: string;
}

type RequiredTransactionFields = {
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  blockNumber: bigint;
};

interface TokenDisplayProps {
  address: `0x${string}` | undefined;
  isConnected: boolean;
}

export function TokenDisplay({ address, isConnected }: TokenDisplayProps) {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address || !publicClient) return;
    setIsLoadingBalance(true);
    setError(null);
    try {
      const balance = await publicClient.getBalance({ address });
      setBalance(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    if (!address) return;
    setIsLoadingTransactions(true);
    setError(null);
    try {
      const apiUrl = `https://explorer.testnet.riselabs.xyz/api?module=account&action=txlist&address=${address}&sort=desc`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Full API Response:', JSON.stringify(data, null, 2));
      
      if (data.status !== '1') {
        console.log('API returned non-success status:', data.status, data.message);
        setError(data.message || 'Failed to fetch transactions');
        setTransactions([]);
        return;
      }

      if (!Array.isArray(data.result)) {
        console.log('API result is not an array:', typeof data.result);
        setError('Invalid transaction data received');
        setTransactions([]);
        return;
      }

      const parsedTransactions: Transaction[] = data.result
        .filter((tx: ExplorerTransaction) => {
          const isValid = tx.isError === '0' && tx.txreceipt_status === '1';
          return isValid;
        })
        .map((tx: ExplorerTransaction) => {
          return {
            hash: tx.hash as `0x${string}`,
            type: tx.from.toLowerCase() === address.toLowerCase() ? 'sent' : 'received',
            value: BigInt(tx.value),
            from: tx.from as `0x${string}`,
            to: tx.to as `0x${string}`,
            blockNumber: BigInt(tx.blockNumber),
            timestamp: parseInt(tx.timeStamp) * 1000
          };
        });

      console.log('Final parsed transactions:', parsedTransactions);
      setTransactions(parsedTransactions.slice(0, 5));
    } catch (err) {
      console.error('Detailed error:', err);
      if (err instanceof Error) {
        setError(`Failed to fetch transactions: ${err.message}`);
      } else {
        setError('Failed to fetch transactions');
      }
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      console.log('Connected with address:', address);
      fetchBalance();
      fetchTransactions();
    }
  }, [isConnected, address]);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format timestamp to relative time
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isConnected || !address) {
    return (
      <Card className="p-4 bg-black/20 backdrop-blur-sm border-white/10">
        <p className="text-white/60">Connect your wallet to view token information</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 bg-black/20 backdrop-blur-sm border-white/10">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Token Information</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchBalance();
            fetchTransactions();
          }}
          disabled={isLoadingBalance || isLoadingTransactions}
          className="text-white hover:text-white/80"
        >
          {(isLoadingBalance || isLoadingTransactions) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <div>
          <p className="text-sm text-white/60">Current Balance</p>
          <p className="text-lg font-medium text-white">
            {isLoadingBalance ? (
              <Loader2 className="h-4 w-4 animate-spin inline text-white" />
            ) : (
              balance ? `${formatEther(balance)} ETH` : '0 ETH'
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-white/60">Recent Transactions</p>
          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2 mt-2">
              {transactions.map((tx, index) => (
                <div key={`${tx.hash}-${index}`} className="bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className={tx.type === 'sent' ? 'text-red-400' : 'text-green-400'}>
                      {tx.type === 'sent' ? '→ Sent' : '← Received'}
                    </span>
                    <span className="text-white font-medium">{formatEther(tx.value)} ETH</span>
                  </div>
                  <div className="text-sm text-white/60 truncate mt-1">
                    {tx.type === 'sent' ? 
                      `To: ${tx.to ? formatAddress(tx.to) : 'Contract Creation'}` : 
                      `From: ${formatAddress(tx.from)}`}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {formatTime(tx.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-white/40">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 