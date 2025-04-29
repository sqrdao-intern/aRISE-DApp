'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RISE_CHAIN_TESTNET } from '@/lib/networks';
import { createClient } from 'viem';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [RISE_CHAIN_TESTNET],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 