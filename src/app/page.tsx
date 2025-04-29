"use client";

import { AriseButton } from '@/components/arise-button';
import { useRiseChain } from '@/hooks/useRiseChain';

export default function Home() {
  const { isConnected, address } = useRiseChain();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to aRISE</h1>
        <div className="mb-4">
          {isConnected ? (
            <p className="text-center">Connected: {address}</p>
          ) : (
            <p className="text-center">Please connect your wallet</p>
          )}
        </div>
        <AriseButton />
      </div>
    </main>
  );
}
