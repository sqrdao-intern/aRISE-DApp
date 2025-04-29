import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('flex items-center gap-3 bg-primary/20 px-6 py-4 backdrop-blur-sm', className)}>
      <div className="flex items-center gap-2">
        <Image
          src="/rise-logo.svg"
          alt="RISE Logo"
          width={24}
          height={24}
          className="h-6 w-6"
        />
        <span className="text-xl font-semibold text-white">Testnet</span>
      </div>
      <span className="text-lg font-light text-white/60">Where Milliseconds Matter</span>
    </header>
  );
} 