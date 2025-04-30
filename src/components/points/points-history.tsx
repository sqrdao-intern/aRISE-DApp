"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, Send, Share2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PointTransaction {
  id: string
  type: "say-arise" | "send-eth" | "share"
  points: number
  timestamp: Date
  details?: string
}

const transactionIcons = {
  "say-arise": MessageSquare,
  "send-eth": Send,
  "share": Share2,
}

const transactionLabels = {
  "say-arise": "Said aRISE",
  "send-eth": "Sent ETH",
  "share": "Shared on Social Media",
}

type SortOption = "newest" | "oldest" | "points-high" | "points-low"

const ITEMS_PER_PAGE = 5

export function PointsHistory({ transactions }: { transactions: PointTransaction[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [currentPage, setCurrentPage] = useState(1)

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
                    +{transaction.points} points
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
    </div>
  )
} 