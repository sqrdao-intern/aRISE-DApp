"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WalletConnect } from "@/components/wallet-connect";

const SHARE_MESSAGE = "Come say aRISE with me!";

export default function Home() {
  const [canTap, setCanTap] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user has tapped within the last 24 hours
    const lastTap = localStorage.getItem("lastTap");
    if (lastTap) {
      const lastTapTime = new Date(lastTap).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (now - lastTapTime < twentyFourHours) {
        setCanTap(false);
      } else {
        setCanTap(true);
      }
    }
  }, []);

  const handleTap = async () => {
    if (!canTap) {
      toast({
        title: "Too soon!",
        description: "You can only tap once every 24 hours.",
      });
      return;
    }

    if (!walletConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet first.",
      });
      return;
    }

    try {
      // Simulate transaction
      await sayArise();
      setInviteLink(generateInviteLink());
      setCanTap(false);
      localStorage.setItem("lastTap", new Date().toISOString());
      toast({
        title: "aRISE transaction successful!",
        description: "Share your invite link:",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transaction failed",
        description: error.message,
      });
    }
  };

  const sayArise = async () => {
    // Implement your transaction logic here
    // This is a placeholder function
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  };

  const generateInviteLink = () => {
    // Generate a unique invite link
    const link = `https://risenetwork.io/invite/${Date.now()}`;
    return link;
  };

  const shareOnX = () => {
    const tweetText = `${SHARE_MESSAGE} ${inviteLink}`;
    const xLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(xLink, "_blank");
  };

  const shareOnTelegram = () => {
    const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(
      inviteLink
    )}&text=${encodeURIComponent(SHARE_MESSAGE)}`;
    window.open(telegramLink, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md bg-background shadow-xl rounded-lg">
        <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
          <h1 className="text-3xl font-semibold tracking-tight">aRISE</h1>
          <Button
            variant="default"
            size="lg"
            className="w-full"
            disabled={!canTap}
            onClick={handleTap}
          >
            {canTap ? "Tap to say aRISE" : "Wait 24 hours to tap again"}
          </Button>

          {inviteLink && (
            <div className="flex flex-col items-center space-y-2 w-full">
              <p className="text-sm text-muted-foreground">
                Share your invite link:
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={shareOnX}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on X
                </Button>
                <Button variant="outline" size="sm" onClick={shareOnTelegram}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Telegram
                </Button>
              </div>
            </div>
          )}

          {!walletConnected && <WalletConnect onConnect={() => setWalletConnected(true)} />}
        </CardContent>
      </Card>
    </div>
  );
}
