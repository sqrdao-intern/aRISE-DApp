# aRISE DApp

aRISE is a decentralized application built with Next.js and Firebase, designed to create an engaging social experience through RISE blockchain. The application allows users to participate in a unique "aRISE" ritual by connecting their wallet and sharing their participation with others.

## Features

- 🔐 Wallet Integration: Connect your Web3 wallet to participate
- ⏱️ Time-based Participation: Users can participate once every 24 hours
- 📱 Social Sharing: Share your participation on X (Twitter) and Telegram
- 🔗 Unique Invite Links: Generate and share personalized invite links
- 🎨 Modern UI: Built with Tailwind CSS and Radix UI components

## Tech Stack

- **Frontend Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI with custom shadcn/ui components
- **State Management**: React Query
- **Backend**: Firebase
- **Blockchain**: Ethereum (via Hardhat)
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts

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
   - Fill in the required environment variables

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
- `/src/hooks`: Custom React hooks
- `/contracts`: Smart contract code
- `/docs`: Project documentation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
