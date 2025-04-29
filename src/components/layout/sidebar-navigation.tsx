"use client"

import { MessageSquare, Wallet } from "lucide-react"
import { SidebarNav } from "@/components/ui/sidebar-nav"

export function SidebarNavigation() {
  const items = [
    {
      href: "/",
      title: "Say aRISE",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      href: "/wallet",
      title: "Wallet",
      icon: <Wallet className="h-5 w-5" />,
    },
  ]

  return (
    <div className="px-4 pt-6">
      <h2 className="mb-3 px-2 text-sm font-medium text-black/70">
        Navigation
      </h2>
      <SidebarNav items={items} className="text-black/90" />
    </div>
  )
} 