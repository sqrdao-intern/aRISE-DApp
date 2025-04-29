"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-primary/20 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="RISE Logo"
              width={50}
              height={50}
              className="h-12 w-12"
            />
            <span className="text-xl font-semibold text-white">Testnet</span>
          </Link>
          <div className="text-lg font-light text-white/60">
            Where Milliseconds Matter
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  )
} 