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
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <SidebarProvider defaultOpen>
          <div className="w-64 shrink-0 min-h-screen fixed left-0 top-0 p-4 md:block hidden">
            <Sidebar 
              variant="floating" 
              collapsible="offcanvas" 
              className="min-h-[calc(100vh-2rem)] rounded-2xl shadow-lg [&_[data-sidebar=sidebar]]:rounded-2xl [&_[data-sidebar=sidebar]]:shadow-lg [&>div>div]:!p-0"
            >
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
              </SidebarContent>
            </Sidebar>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-screen md:pl-64">
            {/* Header */}
            <header className="sticky top-0 z-30 flex h-auto min-h-16 items-center justify-between px-4 md:px-6 py-2 backdrop-blur-sm">
              <div className="md:hidden">
                <SidebarTrigger className="h-9 w-9 text-white hover:bg-white/10" />
              </div>
              <div className="flex items-center md:ml-auto">
                <WalletConnect />
              </div>
            </header>

            {/* Main Content */}
            <main className="p-4">
              <div className="min-h-[calc(100vh-6rem)] rounded-2xl shadow-lg p-6">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  )
} 