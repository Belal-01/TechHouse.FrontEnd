import type { ComponentProps } from "react"
import { cn } from "cn"

// 14px / 600 instead of the 12px `label` style: its letter-spacing breaks Arabic letter joining.
function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    />
  )
}

export { Label }
