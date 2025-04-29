"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex flex-col space-y-1 w-full",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors w-full",
              isActive 
                ? "bg-black/10 text-black font-medium" 
                : "text-black/70 hover:bg-black/5 hover:text-black"
            )}
          >
            {item.icon && (
              <span className={cn(
                "h-5 w-5",
                isActive ? "text-black" : "text-black/70"
              )}>{item.icon}</span>
            )}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 