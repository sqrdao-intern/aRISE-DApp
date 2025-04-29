import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface SkeletonProps extends Omit<HTMLMotionProps<"div">, "className" | "variant"> {
  className?: string
  variant?: "glass" | "default"
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "rounded-md bg-gray-200/20",
        variant === "glass" && "backdrop-blur-sm bg-white/10 border border-white/20",
        className
      )}
      {...props}
    />
  )
}
