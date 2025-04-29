"use client";

import { AriseButton } from '@/components/arise-button';
import { TokenDisplay } from '@/components/token-display';
import { TokenTransfer } from '@/components/token-transfer';
import { useRiseChain } from '@/hooks/useRiseChain';

export default function Home() {
  const { isConnected, address } = useRiseChain();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-12 pt-8">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Say aRISE!</h1>
        <AriseButton />
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TokenDisplay
              address={address}
              isConnected={isConnected}
            />
          </div>
          <div>
            <TokenTransfer
              onTransferComplete={() => {
                // Refresh token display after transfer
                window.location.reload();
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
