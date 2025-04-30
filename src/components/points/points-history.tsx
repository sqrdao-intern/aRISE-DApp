"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, Send, Share2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePoints } from "@/hooks/usePoints"
import { useRiseChain } from "@/hooks/useRiseChain"
import { useReadContract, useWatchContractEvent } from "wagmi"
import { POINTS_CONTRACT_ADDRESS, POINTS_CONTRACT_ABI } from "@/lib/constants"

interface PointTransaction {
  id: string
  type: "say-arise" | "send-eth" | "share" | "burn"
  points: number
  timestamp: Date
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
  const { address, isConnected } = useRiseChain()
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Notify parent of history changes
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(transactions.length > 0)
    }
  }, [transactions.length, onHistoryChange])

  // Watch for points events
  useWatchContractEvent({
    address: POINTS_CONTRACT_ADDRESS,
    abi: POINTS_CONTRACT_ABI,
    eventName: "PointsUpdated",
    onLogs: (logs) => {
      if (logs.length === 0) {
        setIsLoading(false); // No logs, so stop loading
        return
      }
      const event = logs[0] as { args: { user: string; newPoints: bigint; type: string } }
      if (event.args.user.toLowerCase() === address?.toLowerCase()) {
        const newTransaction: PointTransaction = {
          id: `${event.args.user}-${Date.now()}`,
          type: event.args.type as PointTransaction["type"],
          points: Number(event.args.newPoints),
          timestamp: new Date(),
        }
        setTransactions(prev => [newTransaction, ...prev])
        setIsLoading(false)
      }
    },
  })

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
      <div className="text-sm text-gray-400 flex items-center gap-2">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {(isLoading || transactions.length > 0) && (
        <Card className="p-6 mb-8 bg-white/10 backdrop-blur-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Points</h2>
          {transactions.length > 0 ? (
            <motion.div 
              key={transactions[0].points?.toString()}
              initial={{ scale: 1.5, color: "#A855F7" }}
              animate={{ scale: 1, color: "#FFFFFF" }}
              className="text-4xl font-bold mb-2"
            >
              {isLoading ? "Loading..." : transactions[0].points?.toString()}
            </motion.div>
          ) : (
            isLoading && (
              <motion.div 
                initial={{ scale: 1.5, color: "#A855F7" }}
                animate={{ scale: 1, color: "#FFFFFF" }}
                className="text-4xl font-bold mb-2"
              >
                Loading...
              </motion.div>
            )
          )}
          <p className="text-sm text-white/70">Total points earned</p>
        </Card>
      )}
    </div>
  )
} 