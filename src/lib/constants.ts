import { RISE_CHAIN_TESTNET } from '@/lib/networks';
import { createConfig, http } from 'wagmi';

export const ARISE_CONTRACT_ADDRESS = '0x302D51b6d19a0dC8dD4893e383cC9240B51a03Ca'; // RISE Testnet contract address
export const POINTS_CONTRACT_ADDRESS = "0x302D51b6d19a0dC8dD4893e383cC9240B51a03Ca"; // Replace with actual address

export const ARISE_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'sayArise',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'AriseSaid',
    type: 'event',
  },
] as const;

export const POINTS_CONTRACT_ABI = [
  {
    inputs: [],
    name: 'sayArise',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'transactionHash',
        type: 'bytes32',
      },
    ],
    name: 'processTransactionHash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'awardSocialSharePoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserPoints',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'burnPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
    ],
    name: 'getUserAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalAriseCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'transactionHash',
        type: 'bytes32',
      },
    ],
    name: 'isTransactionHashUsed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'points', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'action', type: 'string' },
    ],
    name: 'PointsAwarded',
    type: 'event',
  },
] as const; 

// Load RISE Testnet RPC URL from environment
const RISE_RPC_URL = process.env.NEXT_PUBLIC_RISE_RPC_URL;
if (!RISE_RPC_URL) {
  throw new Error('NEXT_PUBLIC_RISE_RPC_URL environment variable is not defined');
}

export const config = createConfig({
  chains: [RISE_CHAIN_TESTNET],
  transports: {
    [RISE_CHAIN_TESTNET.id]: http(RISE_RPC_URL),
  },
});