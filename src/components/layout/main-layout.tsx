"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"
import { cn } from "@/lib/utils"
import { SidebarNavigation } from "@/components/layout/sidebar-navigation"
import { Sidebar } from "@/components/ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarContent } from "@/components/ui/sidebar"
import { SidebarHeader } from "@/components/ui/sidebar"
import { SidebarFooter } from "@/components/ui/sidebar"
import { SidebarSeparator } from "@/components/ui/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-purple-500 to-purple-600">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 shrink-0 min-h-screen fixed left-0 top-0 p-4">
          <SidebarProvider defaultOpen>
            <Sidebar variant="inset" collapsible="none" className="min-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-lg">
              <SidebarContent className="flex flex-col h-full pt-6">
                {/* Sidebar Header */}
                <div className="px-6">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo-dark.svg"
                      alt="RISE Logo"
                      width={50}
                      height={50}
                      className="h-12 w-12"
                    />
                    <span className="text-xl font-semibold text-black">Testnet</span>
                  </div>
                  <div className="mt-1 text-base text-black/60">
                    Where Milliseconds Matter
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 w-full">
                  <SidebarNavigation />
                </div>

                {/* Bottom Icon */}
                {/* <div className="p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5">
                    
                  </div>
                </div> */}
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-end bg-primary/20 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <WalletConnect />
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-4rem)] p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 