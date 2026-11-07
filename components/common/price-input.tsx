import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** USD amount input with a "$" prefix, laid out left-to-right like the number itself. */
export function PriceInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <div className="relative" dir="ltr">
      <span className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
        $
      </span>
      <Input inputMode="decimal" placeholder="0.00" className={cn("ps-7", className)} {...props} />
    </div>
  )
}
