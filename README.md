# aRISE DApp

aRISE is a decentralized application built with Next.js and Firebase, designed to create an engaging social experience through RISE blockchain. The application features a modern, professional UI matching the RISE Chain Portal style, with a clean purple gradient theme and glass-morphic design elements.

## Features

- 🔐 Wallet Integration: Connect your Web3 wallet to participate with real-time network status
- ⏱️ 24-Hour Cooldown: Users can participate once every 24 hours with a visual countdown timer
- 📱 Social Sharing: Share your participation on X (Twitter) and Telegram with real-time count updates
- 🔗 Unique Invite Links: Generate and share personalized invite links
- 🎨 Modern UI: Built with Tailwind CSS, featuring RISE Chain Portal-inspired design
  - Glass-morphic components with gradient effects
  - Smooth animations and transitions
  - Responsive layout with modern typography
- 🔄 Real-time Updates: Live updates of user and total aRISE counts
- 🎯 Transaction Status: Clear visual feedback for transaction states with expandable details
- 🎉 Interactive Animations: Smooth animations for count updates and state changes
- 🛡️ Error Handling: Comprehensive error handling with toast notifications
- 💎 Token Management: View balances and transaction history with modern card UI

## Tech Stack

- **Frontend Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom animations and glass-morphic effects
- **UI Components**: Radix UI with custom shadcn/ui components
- **State Management**: React Query
- **Backend**: Firebase
- **Blockchain**: RISE Chain (EVM-compatible)
- **Web3 Integration**: Wagmi and Viem
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Notifications**: Custom toast system with glass-morphic design

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables:
     - `NEXT_PUBLIC_RISE_CHAIN_ID`: RISE Chain network ID
     - `NEXT_PUBLIC_RISE_RPC_URL`: RISE Chain RPC endpoint
     - `NEXT_PUBLIC_CONTRACT_ADDRESS`: aRISE smart contract address

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:9002](http://localhost:9002) in your browser

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript type checking

## Project Structure

- `/src/app`: Next.js app router pages and layouts
- `/src/components`: Reusable UI components
  - `arise-button.tsx`: Main interaction component with gradient effects
  - `social-share.tsx`: Social sharing functionality
  - `transaction-status.tsx`: Transaction state display with expandable details
  - `token-display.tsx`: Token balance and transaction history
  - `token-transfer.tsx`: Token transfer interface
- `/src/hooks`: Custom React hooks
  - `useRiseChain.ts`: RISE Chain connection management
  - `useTransactionStatus.ts`: Transaction status tracking
  - `useCooldown.ts`: 24-hour cooldown implementation
- `/contracts`: Smart contract code
- `/lib`: Utility functions and constants
- `/docs`: Project documentation

## Key Features in Detail

### Wallet Integration
- Seamless connection to Web3 wallets
- Real-time network status indicator
- Automatic network detection and switching
- Clear error messages with toast notifications

### Token Management
- Modern glass-morphic card design for balances
- Transaction history with expandable details
- Secure transfer functionality with validation
- Real-time balance updates
- Loading states with skeleton UI

### 24-Hour Cooldown
- Visual countdown timer
- Persistent cooldown state using localStorage
- Clear feedback when cooldown is active

### Social Sharing
- Real-time count updates in share messages
- Support for X (Twitter) and Telegram
- Personalized share URLs with referral tracking

### Transaction Management
- Real-time transaction status updates
- Expandable transaction details
- Clear visual feedback for all transaction states
- Comprehensive error handling with toast notifications
- 5-second delay for balance refresh after confirmation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
