"use client"

import { Card } from "@/components/ui/card";
import { Share2, MessageSquare, Send } from "lucide-react";
import { PointsHistory } from "@/components/points/points-history";
import { useState } from "react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  type: "say-arise" | "send-eth" | "share";
  points: number;
  timestamp: Date;
  details?: string;
}

// Initial mock data
const initialTransactions: Transaction[] = [
  {
    id: "1",
    type: "say-arise",
    points: 10,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: "2",
    type: "send-eth",
    points: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    details: "0.1 ETH to 0x123...456",
  },
  {
    id: "3",
    type: "share",
    points: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    details: "Shared on Twitter",
  },
  {
    id: "4",
    type: "say-arise",
    points: 10,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: "5",
    type: "send-eth",
    points: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    details: "0.05 ETH to 0x789...012",
  },
  {
    id: "6",
    type: "share",
    points: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    details: "Shared on LinkedIn",
  },
  {
    id: "7",
    type: "say-arise",
    points: 10,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: "8",
    type: "send-eth",
    points: 50,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7), // 7 hours ago
    details: "0.2 ETH to 0x345...678",
  },
];

export default function PointsDashboard() {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Points Dashboard</h1>
      
      {/* Current Points Display */}
      <Card className="p-6 mb-8 bg-white/10 backdrop-blur-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Points</h2>
        <motion.div 
          key={totalPoints}
          initial={{ scale: 1.5, color: "#A855F7" }}
          animate={{ scale: 1, color: "#FFFFFF" }}
          className="text-4xl font-bold mb-2"
        >
          {totalPoints}
        </motion.div>
        <p className="text-sm text-white/70">Total points earned</p>
      </Card>

      {/* Points Rules */}
      <Card className="p-6 mb-8 bg-white/10 backdrop-blur-lg">
        <h2 className="text-2xl font-semibold mb-4">How to Earn Points</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Say aRISE</h3>
              <p className="text-sm text-white/80">Earn 10 points each time</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
            <div className="p-2 bg-white/20 rounded-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Send ETH</h3>
              <p className="text-sm text-white/80">Earn 50 points for each transfer</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
            <div className="p-2 bg-white/20 rounded-lg">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Share on Social Media</h3>
              <p className="text-sm text-white/80">Earn 1 point for each share</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Points History */}
      <Card className="p-6 bg-white/10 backdrop-blur-lg">
        <h2 className="text-2xl font-semibold mb-4">Points History</h2>
        <PointsHistory transactions={transactions} />
      </Card>
    </div>
  );
} 