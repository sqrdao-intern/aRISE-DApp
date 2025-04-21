'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

// RISE Testnet configuration
const RISE_TESTNET = {
  id: 11155931,
  name: 'RISE Testnet',
  network: 'rise-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://testnet.riselabs.xyz'] },
    default: { http: ['https://testnet.riselabs.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.testnet.riselabs.xyz' },
  },
  testnet: true
};

// Type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<any>;
    };
  }
}

interface WalletConnectProps {
  onConnect: () => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wait24Hours, setWait24Hours] = useState(false);

  const addRiseTestnet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      await (window.ethereum as any).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${RISE_TESTNET.id.toString(16)}`,
          chainName: RISE_TESTNET.name,
          nativeCurrency: RISE_TESTNET.nativeCurrency,
          rpcUrls: RISE_TESTNET.rpcUrls.default.http,
          blockExplorerUrls: [RISE_TESTNET.blockExplorers.default.url]
        }]
      });
    } catch (error) {
      console.error('Error adding RISE Testnet:', error);
      setError('Failed to add RISE Testnet');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create a provider using ethers v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the signer
      const signer = await provider.getSigner();

      // Get the address
      const address = await signer.getAddress();
      setAddress(address);
      setIsConnected(true);
      setError(null);
      onConnect();
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError('Failed to connect wallet');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Connected: {address}</p>
          <button
            onClick={() => {
              setIsConnected(false);
              setAddress(null);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={addRiseTestnet}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Add RISE Testnet
      </button>
      {wait24Hours && (
        <div className="flex gap-2">
          <button
            onClick={() => window.open('https://x.com/share?text=Check%20this%20out!', '_blank')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Share on X
          </button>
          <button
            onClick={() => window.open('https://t.me/share/url?url=https://example.com&text=Check%20this%20out!', '_blank')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Share on Telegram
          </button>
        </div>
      )}
    </div>
  );
} 