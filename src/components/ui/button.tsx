import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-rise-gradient bg-rise-gradient-size text-white hover:animate-gradient-shift hover:scale-[1.02] active:scale-[0.98] shadow-rise hover:shadow-rise-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]",
        outline: "border-2 border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-white/80 text-primary backdrop-blur-sm hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-rise-gradient bg-rise-gradient-size text-white font-semibold hover:animate-gradient-shift hover:scale-[1.02] active:scale-[0.98] shadow-rise hover:shadow-rise-lg enabled:animate-pulse-subtle border-2 border-white/30 enabled:hover:border-white/50 backdrop-blur-sm",
        "gradient-outline": "border-2 border-transparent bg-rise-gradient bg-rise-gradient-size bg-clip-text text-transparent hover:animate-gradient-shift hover:scale-[1.02] active:scale-[0.98]"
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base font-semibold tracking-wide",
        xl: "h-14 rounded-xl px-10 text-lg font-semibold tracking-wide",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
