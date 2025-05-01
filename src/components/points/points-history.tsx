"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, Send, Share2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePoints } from "@/hooks/usePoints"
import { useRiseChain } from "@/hooks/useRiseChain"
import { useReadContract, useWatchContractEvent, usePublicClient } from "wagmi"
import { POINTS_CONTRACT_ADDRESS, POINTS_CONTRACT_ABI } from "@/lib/constants"
import { SkeletonTransactionCard } from './SkeletonTransactionCard'

interface PointTransaction {
  id: string
  type: "say-arise" | "send-eth" | "share" | "burn"
  points: number
  timestamp: Date
  transactionHash?: string
  details?: string
}

const transactionIcons = {
  "say-arise": MessageSquare,
  "send-eth": Send,
  "share": Share2,
  "burn": ChevronRight,
}

const transactionLabels = {
  "say-arise": "Said aRISE",
  "send-eth": "Sent ETH",
  "share": "Shared on Social Media",
  "burn": "Burned Points",
}

type SortOption = "newest" | "oldest" | "points-high" | "points-low"

const ITEMS_PER_PAGE = 5

interface PointsHistoryProps {
  onHistoryChange?: (hasHistory: boolean) => void;
}

export function PointsHistory({ onHistoryChange }: PointsHistoryProps) {
  // Block range caching for incremental loading
  const [minFetchedBlock, setMinFetchedBlock] = useState<bigint>(0n);
  const [maxFetchedBlock, setMaxFetchedBlock] = useState<bigint>(0n);

  const { address, isConnected } = useRiseChain()
  const publicClient = usePublicClient()
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add debug logging for component state changes
  useEffect(() => {
    console.log('PointsHistory: Transactions state changed', {
      transactionCount: transactions.length,
      transactions
    });
  }, [transactions]);

  useEffect(() => {
    console.log('PointsHistory: Component mounted/updated', {
      isConnected,
      address,
      isLoading,
      transactionCount: transactions.length
    });
  }, [isConnected, address, isLoading, transactions.length]);

  // Notify parent of history changes
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(transactions.length > 0)
    }
  }, [transactions.length, onHistoryChange])

  // Fetch past events when component mounts
  useEffect(() => {
    const fetchPastEvents = async () => {
      if (!address || !isConnected || !publicClient) return;

      setIsLoading(true);
      setIsLoadingInitial(true);
      console.log('PointsHistory: Fetching past events', { address });
      try {
        // Get current block number
        const latestBlock = await publicClient.getBlockNumber();
        // Initial load: fetch only the latest block window
        const CHUNK_SIZE = 90000n;
        const startBlock = latestBlock > CHUNK_SIZE ? latestBlock - CHUNK_SIZE : 0n;
        // Cache block boundaries
        setMaxFetchedBlock(latestBlock);
        setMinFetchedBlock(startBlock);
        console.log('PointsHistory: Initial fetch from recent blocks', { startBlock, toBlock: latestBlock });
        const allLogs = await publicClient.getLogs({
          address: POINTS_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'PointsAwarded',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'uint256', name: 'points', indexed: false },
              { type: 'string', name: 'action', indexed: false }
            ]
          },
          args: { user: ((address as `0x${string}`).toLowerCase() as `0x${string}`) },
          fromBlock: startBlock,
          toBlock: latestBlock
        });
        console.log('PointsHistory: Fetched recent logs', { count: allLogs.length });

        console.log('PointsHistory: Fetched all past events', { totalLogs: allLogs.length });

        // Process past events into transactions with accurate timestamps and unique IDs
        const pastTxPromises = allLogs.map(async (log) => {
          const event = log as unknown as {
            args: { user: `0x${string}`; points: bigint; action: string };
            transactionHash: `0x${string}`;
          };
          console.log('PointsHistory: Raw past event action', event.args.action);
          const type = event.args.action === "sayArise" ? "say-arise" :
                      event.args.action === "ethTransfer" ? "send-eth" :
                      event.args.action === "socialShare" ? "share" :
                      event.args.action === "burn" ? "burn" :
                      "say-arise";
          // Fetch block timestamp for the event
          let timestamp = new Date();
          try {
            const block = await publicClient.getBlock({ blockNumber: (log as any).blockNumber });
            timestamp = new Date(Number(block.timestamp) * 1000);
          } catch (blockError) {
            console.error('PointsHistory: Error fetching block timestamp', blockError);
          }
          return {
            id: `${(log as any).transactionHash}-${(log as any).logIndex}`,
            type,
            points: Number(event.args.points),
            timestamp,
            transactionHash: (log as any).transactionHash,
            details: (type === "send-eth" || type === "burn") ?
              `Transaction: ${(log as any).transactionHash.slice(0, 8)}...${(log as any).transactionHash.slice(-6)}` :
              undefined
          } as PointTransaction;
        });
        const pastTransactions = (await Promise.all(pastTxPromises))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        console.log('PointsHistory: Processed past events with timestamps', { transactionCount: pastTransactions.length });
        
        setTransactions(pastTransactions);
      } catch (error) {
        console.error('PointsHistory: Error fetching past events', error);
      } finally {
        setIsLoading(false);
        setIsLoadingInitial(false);
      }
    };

    fetchPastEvents();
  }, [address, isConnected, publicClient]);

  // Helper to load older pages on pagination
  const loadMore = useCallback(async () => {
    if (!publicClient || minFetchedBlock === null) return;
    setIsLoadingMore(true);
    try {
      const CHUNK_SIZE = 90000n;
      const toBlock = minFetchedBlock - 1n;
      const fromBlock = toBlock > CHUNK_SIZE ? toBlock - CHUNK_SIZE : 0n;
      console.log('PointsHistory: Loading older logs', { fromBlock, toBlock });
      const moreLogs = await publicClient.getLogs({
        address: POINTS_CONTRACT_ADDRESS,
        event: {
          type: 'event', name: 'PointsAwarded', inputs: [
            { type: 'address', name: 'user', indexed: true },
            { type: 'uint256', name: 'points', indexed: false },
            { type: 'string', name: 'action', indexed: false }
          ]
        },
        args: { user: ((address as `0x${string}`).toLowerCase() as `0x${string}`) },
        fromBlock, toBlock
      });
      console.log('PointsHistory: Fetched older logs', { count: moreLogs.length });
      const moreTx: PointTransaction[] = await Promise.all(moreLogs.map(async (log): Promise<PointTransaction> => {
        const event = log as any;
        let timestamp = new Date();
        try { const block = await publicClient.getBlock({ blockNumber: (log as any).blockNumber }); timestamp = new Date(Number(block.timestamp) * 1000); } catch {}
        const actionType: PointTransaction['type'] =
          event.args.action === 'sayArise' ? 'say-arise' :
          event.args.action === 'ethTransfer' ? 'send-eth' :
          event.args.action === 'socialShare' ? 'share' :
          event.args.action === 'burn' ? 'burn' :
          'say-arise';
        return {
          id: `${(log as any).transactionHash}-${(log as any).logIndex}`,
          type: actionType,
          points: Number(event.args.points),
          timestamp,
          transactionHash: (log as any).transactionHash,
          details: (actionType === 'send-eth' || actionType === 'burn')
            ? `Transaction: ${(log as any).transactionHash.slice(0, 8)}...${(log as any).transactionHash.slice(-6)}`
            : undefined
        };
      }));
      setTransactions(prev => {
        const updated: PointTransaction[] = [...prev, ...moreTx];
        return updated;
      });
      setMinFetchedBlock(fromBlock);
    } catch(err) {
      console.error('PointsHistory: Error loading more events', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [address, publicClient, minFetchedBlock]);

  // Watch for points awarded events
  useWatchContractEvent({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    eventName: "PointsAwarded",
    args: { user: address as `0x${string}` },
    onLogs: (logs) => {
      console.log('PointsHistory: PointsAwarded event received', { 
        logs,
        currentAddress: address,
        isConnected
      });
      
      if (logs.length === 0) {
        console.log('PointsHistory: Empty logs received');
        setIsLoading(false);
        return
      }

      const log = logs[0];
      console.log('PointsHistory: Processing log', { log });
      
      const event = log as unknown as { 
        args: { user: string; points: bigint; action: string };
        transactionHash: string;
      };
      console.log('PointsHistory: Raw watch event action', event.args.action);
      console.log('PointsHistory: Parsed event', { 
        event,
        eventUser: event.args.user,
        currentUser: address,
        eventUserLower: event.args.user.toLowerCase(),
        currentUserLower: address?.toLowerCase()
      });
      
      // Ensure we have an address before comparing
      if (!address) {
        console.log('PointsHistory: No current user address available');
        return;
      }

      // Compare addresses case-insensitively
      const eventUserLower = event.args.user.toLowerCase();
      const currentUserLower = address.toLowerCase();
      
      if (eventUserLower === currentUserLower) {
        console.log('PointsHistory: Event matches current user address', {
          eventUser: event.args.user,
          currentUser: address,
          eventUserLower,
          currentUserLower
        });
        
        const type = event.args.action === "sayArise" ? "say-arise" :
                    event.args.action === "ethTransfer" ? "send-eth" :
                    event.args.action === "socialShare" ? "share" :
                    event.args.action === "burn" ? "burn" : "say-arise";
        
        console.log('PointsHistory: Determined transaction type', { 
          originalAction: event.args.action,
          mappedType: type 
        });
        
        const newTransaction: PointTransaction = {
          id: `${event.args.user}-${Date.now()}`,
          type,
          points: Number(event.args.points),
          timestamp: new Date(),
          transactionHash: event.transactionHash,
          details: (type === "send-eth" || type === "burn") ? 
            `Transaction: ${event.transactionHash.slice(0, 8)}...${event.transactionHash.slice(-6)}` : 
            undefined
        };
        console.log('PointsHistory: Created new transaction object', { newTransaction });
        
        setTransactions(prev => {
          console.log('PointsHistory: Updating transactions', {
            previousCount: prev.length,
            newTransaction,
            allTransactions: [...prev, newTransaction]
          });
          return [newTransaction, ...prev];
        });
        setIsLoading(false);
        console.log('PointsHistory: State updated, loading set to false');
      } else {
        console.log('PointsHistory: Event user does not match current user', {
          eventUser: event.args.user,
          currentUser: address,
          eventUserLower,
          currentUserLower
        });
      }
    },
  })

  // Add debug logging for transactions state
  useEffect(() => {
    console.log('PointsHistory: Current transactions state', {
      transactionCount: transactions.length,
      transactions,
      isConnected,
      address
    });
  }, [transactions, isConnected, address]);

  // Ensure loading is cleared after first render if there are no transactions
  useEffect(() => {
    if (isLoading && transactions.length === 0) {
      const timeout = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, transactions.length])

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.timestamp.getTime() - a.timestamp.getTime()
      case "oldest":
        return a.timestamp.getTime() - b.timestamp.getTime()
      case "points-high":
        return b.points - a.points
      case "points-low":
        return a.points - b.points
      default:
        return 0
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Initial skeletal loading indicator before rendering main UI
  if (isLoadingInitial) {
    return (
      <div className="space-y-4">
        {Array(ITEMS_PER_PAGE).fill(0).map((_, idx) => (
          <SkeletonTransactionCard key={idx} />
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-sm text-gray-400 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Connect your wallet to view points history
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-sm text-gray-400 flex items-center gap-2">
        <Clock className="w-4 h-4 animate-spin" />
        Loading points history...
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-sm text-white/80 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        No points earned yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sorting Controls */}
      <div className="flex items-center justify-between mb-6">
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="w-[180px] bg-white/5">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="points-high">Highest Points</SelectItem>
            <SelectItem value="points-low">Lowest Points</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <AnimatePresence mode="popLayout" initial={false}>
        {paginatedTransactions.map((transaction) => {
          const Icon = transactionIcons[transaction.type]
          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 25,
              }}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <motion.div 
                className="p-2 bg-white/20 rounded-lg"
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <motion.div 
                  className="flex items-center justify-between"
                >
                  <h3 className="font-medium text-white">{transactionLabels[transaction.type]}</h3>
                  <motion.span 
                    className="text-sm font-semibold text-white"
                  >
                    {transaction.type === "burn" ? "-" : "+"}{transaction.points} points
                  </motion.span>
                </motion.div>
                <motion.div 
                  className="flex items-center justify-between mt-1"
                >
                  <p className="text-sm text-white/80">
                    {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                  </p>
                  {transaction.details && (
                    <p className="text-sm text-white/80">{transaction.details}</p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-white/80">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-white/5">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={async () => { const next = Math.min(totalPages, currentPage+1); if ((next)*ITEMS_PER_PAGE > transactions.length) await loadMore(); setCurrentPage(next);} } disabled={isLoadingMore} className="bg-white/5">
              {isLoadingMore ? <Clock className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Removed redundant summary card to avoid duplication with dashboard */}
    </div>
  )
} 