"use client"

import { Card } from "@/components/ui/card";
import { Share2, MessageSquare, Send, Trophy, Flame } from "lucide-react";
import { PointsHistory } from "@/components/points/points-history";
import { usePoints } from "@/hooks/usePoints";
import { useRiseChain } from "@/hooks/useRiseChain";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatEther } from "viem";

export default function PointsDashboard() {
  const { isConnected, address } = useRiseChain();
  const { points, isLoading, error, burnPoints } = usePoints();
  const [burnAmount, setBurnAmount] = useState<string>("");
  const [isBurning, setIsBurning] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);

  const handleBurnPoints = async () => {
    if (!burnAmount) return;
    const amount = BigInt(burnAmount);
    setIsBurning(true);
    try {
      await burnPoints(amount);
      setBurnAmount("");
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Points Dashboard</h1>
      
      {/* Current Points Display */}
      {(
        <Card className="p-6 mb-8 bg-white/10 backdrop-blur-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Points</h2>
          <motion.div 
            key={points?.toString()}
            initial={{ scale: 1.5, color: "#A855F7" }}
            animate={{ scale: 1, color: "#FFFFFF" }}
            className="text-4xl font-bold mb-2"
          >
            {isLoading ? "Loading..." : points?.toString() || "0"}
          </motion.div>
          <p className="text-sm text-white/70">Total points earned</p>
        </Card>
      )}

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
              <p className="text-sm text-white/80">Earn 20 points each time</p>
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
              <p className="text-sm text-white/80">Earn 10 points for each share</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Points Burning */}
      {/* {isConnected && points && points >= BigInt(1000) && (
        <Card className="p-6 mb-8 bg-white/10 backdrop-blur-lg">
          <h2 className="text-2xl font-semibold mb-4">Burn Points</h2>
          <p className="text-sm text-white/70 mb-4">
            Burn your points to unlock future perks. Minimum burn amount is 1000 points.
          </p>
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Amount to burn"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
              className="bg-white/5 border-white/20"
            />
            <Button
              onClick={handleBurnPoints}
              disabled={isBurning || !burnAmount || BigInt(burnAmount) < BigInt(1000)}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              {isBurning ? (
                <Flame className="w-4 h-4 animate-pulse" />
              ) : (
                <Flame className="w-4 h-4" />
              )}
              Burn Points
            </Button>
          </div>
        </Card>
      )} */}

      {/* Points History */}
      <Card className="p-6 bg-white/10 backdrop-blur-lg">
        <h2 className="text-2xl font-semibold mb-4">Points History</h2>
        <PointsHistory onHistoryChange={setHasHistory} />
      </Card>
      {/* End Points History */}
    </div>
  );
} 