"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
        "flex flex-col space-y-1",
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
              buttonVariants({
                variant: isActive ? "gradient" : "ghost",
                size: "default",
                className: "justify-start w-full",
              }),
              "relative transition-all hover:pl-8",
              isActive && "pl-8"
            )}
          >
            {isActive && (
              <span className="absolute left-2 flex h-6 w-6 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-current" />
              </span>
            )}
            {item.icon && (
              <span className="mr-2">{item.icon}</span>
            )}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 