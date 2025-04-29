export {};

declare global {
  interface EthereumRequestArguments {
    method: string;
    params?: unknown[];
  }

  interface Ethereum {
    request(args: EthereumRequestArguments): Promise<any>;
    on(eventName: string | symbol, listener: (...args: any[]) => void): void;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): void;
  }

  interface Window {
    ethereum?: Ethereum;
  }
} 