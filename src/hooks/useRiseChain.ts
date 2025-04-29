import { useAccount, useChainId, useConnect, useDisconnect } from 'wagmi';

export function useRiseChain() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const isOnRiseChain = chainId === 11155931; // RISE Chain testnet chain ID

  return {
    address,
    isConnected,
    isOnRiseChain,
    connect,
    disconnect,
    connectors,
  };
} 