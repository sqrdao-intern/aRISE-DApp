import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface NetworkBadgeProps {
  isConnected: boolean
  isCorrectNetwork: boolean
  networkName: string
  className?: string
}

export function NetworkBadge({ isConnected, isCorrectNetwork, networkName, className }: NetworkBadgeProps) {
  if (!isConnected) {
    return (
      <Badge variant="outline" className={cn("text-white/60", className)}>
        Not Connected
      </Badge>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <Badge variant="destructive" className={cn("animate-pulse", className)}>
        Wrong Network
      </Badge>
    )
  }

  return (
    <Badge variant="gradient" className={cn("gap-1", className)}>
      <span className="size-2 rounded-full bg-green-400 animate-pulse" />
      {networkName}
    </Badge>
  )
} 