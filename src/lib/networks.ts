export const RISE_CHAIN_TESTNET = {
  id: 11155931,
  name: 'RISE Testnet',
  network: 'rise-testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.riselabs.xyz'],
      webSocket: ['wss://testnet.riselabs.xyz/ws'],
    },
    public: {
      http: ['https://testnet.riselabs.xyz'],
      webSocket: ['wss://testnet.riselabs.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'RISE Explorer',
      url: 'https://explorer.testnet.riselabs.xyz',
    },
  },
  testnet: true,
} as const;

export const SUPPORTED_NETWORKS = [RISE_CHAIN_TESTNET]; 