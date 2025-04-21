interface Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<any>;
  };
} 