import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "primary" | "danger" | "success" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const ClayButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Ghost variant doesn't have the clay effect unless active/hovered, but for simplicity
    // we'll apply it minimally or conditionally.
    
    const variantClasses = {
      default: "clay-btn bg-surface text-foreground",
      primary: "clay-btn bg-primary text-primary-foreground",
      danger: "clay-btn bg-danger text-white",
      success: "clay-btn bg-success text-white",
      ghost: "hover:bg-surface/50 text-foreground",
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10 flex items-center justify-center",
    }

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
ClayButton.displayName = "ClayButton"

export { ClayButton }
