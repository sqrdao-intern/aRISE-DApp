'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NetworkBadge } from '@/components/ui/network-badge';
import { Loader2, Power, Plus, ExternalLink } from 'lucide-react';
import { customToast } from '@/components/ui/custom-toast';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { RISE_CHAIN_TESTNET } from '@/lib/networks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);

  const isCorrectNetwork = chainId === RISE_CHAIN_TESTNET.id;

  const addRiseTestnet = async () => {
    setIsAddingNetwork(true);
    if (!window.ethereum) {
      customToast.error('Wallet Not Found', 'Please install MetaMask or another Web3 wallet');
      setIsAddingNetwork(false);
      return;
    }

    try {
      await switchChain({ chainId: RISE_CHAIN_TESTNET.id });
      customToast.success('Network Added', 'RISE Testnet has been added to your wallet');
    } catch (error) {
      console.error('Error adding RISE Testnet:', error);
      customToast.error('Network Error', 'Failed to add RISE Testnet');
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const handleConnect = async () => {
    try {
      const connector = connectors[0]; // Usually MetaMask
      if (connector) {
        await connect({ connector });
      } else {
        customToast.error('No Wallet Found', 'Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Connection error:', error);
      customToast.error('Connection Failed', 'Failed to connect wallet');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <NetworkBadge
          isConnected={isConnected}
          isCorrectNetwork={isCorrectNetwork}
          networkName={RISE_CHAIN_TESTNET.name}
          className="mr-2"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="gradient"
                size="icon"
                onClick={handleConnect}
                disabled={isPending || isAddingNetwork}
                className="md:hidden w-8 h-8 p-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Connect Wallet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="gradient"
          size="default"
          onClick={handleConnect}
          disabled={isPending || isAddingNetwork}
          className="hidden md:flex gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}
          Connect Wallet
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={addRiseTestnet}
                disabled={isPending || isAddingNetwork}
                className="md:hidden w-8 h-8 p-0 hover:bg-white/10 hover:text-white transition-colors"
              >
                {isAddingNetwork ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add RISE Testnet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          size="default"
          onClick={addRiseTestnet}
          disabled={isPending || isAddingNetwork}
          className="hidden md:flex hover:bg-white/10 hover:text-white transition-colors gap-2"
        >
          {isAddingNetwork ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add RISE Testnet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NetworkBadge
        isConnected={isConnected}
        isCorrectNetwork={isCorrectNetwork}
        networkName={RISE_CHAIN_TESTNET.name}
        className="mr-2"
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden w-8 h-8 p-0 font-mono bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => window.open(RISE_CHAIN_TESTNET.blockExplorers.default.url + '/address/' + address, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View on Explorer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        variant="outline"
        size="default"
        className="hidden md:flex font-mono gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors"
        onClick={() => window.open(RISE_CHAIN_TESTNET.blockExplorers.default.url + '/address/' + address, '_blank')}
      >
        {formatAddress(address!)}
        <ExternalLink className="h-4 w-4" />
      </Button>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => disconnect()}
              className="md:hidden w-8 h-8 p-0 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors"
            >
              <Power className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disconnect</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button
        variant="outline"
        size="default"
        onClick={() => disconnect()}
        className="hidden md:flex gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors"
      >
        <Power className="h-4 w-4" />
        Disconnect
      </Button>
    </div>
  );
} 