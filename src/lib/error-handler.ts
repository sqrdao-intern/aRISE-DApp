import { customToast } from '@/components/ui/custom-toast';

export class BlockchainError extends Error {
  constructor(
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'BlockchainError';
  }
}

export function handleBlockchainError(error: unknown) {
  if (error instanceof BlockchainError) {
    customToast.error('Blockchain Error', error.message);
    return;
  }

  if (error instanceof Error) {
    // Handle common blockchain errors
    if (error.message.includes('insufficient funds')) {
      customToast.error('Insufficient Funds', 'Please ensure you have enough RISE tokens');
      return;
    }

    if (error.message.includes('user rejected')) {
      customToast.warning('Transaction Rejected', 'You rejected the transaction');
      return;
    }

    if (error.message.includes('network')) {
      customToast.error('Network Error', 'Please check your internet connection');
      return;
    }

    if (error.message.includes('chain')) {
      customToast.error('Wrong Network', 'Please switch to RISE Chain testnet');
      return;
    }

    // Generic error
    customToast.error('Transaction Failed', error.message);
    return;
  }

  // Unknown error
  customToast.error('Unknown Error', 'An unexpected error occurred');
} 