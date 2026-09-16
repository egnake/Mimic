import * as React from "react"
import { cn } from "@/lib/utils"

const ClayCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "clay-card p-6 text-foreground",
      className
    )}
    {...props}
  />
))
ClayCard.displayName = "ClayCard"

export { ClayCard }
