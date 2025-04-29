"use client";

import { AriseButton } from '@/components/arise-button';
import { useRiseChain } from '@/hooks/useRiseChain';

export default function Home() {
  const { isConnected } = useRiseChain();

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-white">Say aRISE!</h1>
      <div className="w-full">
        <AriseButton />
      </div>
    </div>
  );
}
