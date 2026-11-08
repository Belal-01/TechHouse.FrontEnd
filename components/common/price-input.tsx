import type { ComponentProps } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PriceInputProps = ComponentProps<typeof Input> & {
  /** USD shows "$" before the number; SYP shows "ل.س" after it. */
  currency?: "USD" | "SYP"
}

/** Amount input laid out left-to-right like the number itself, with its currency mark. */
export function PriceInput({ className, currency = "USD", ...props }: PriceInputProps) {
  const syp = currency === "SYP"
  return (
    <div className="relative" dir="ltr">
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          syp ? "inset-e-3 small" : "inset-s-3",
        )}
        aria-hidden
      >
        {syp ? "ل.س" : "$"}
      </span>
      <Input inputMode="decimal" placeholder={syp ? "0" : "0.00"} className={cn(syp ? "pe-12" : "ps-7", className)} {...props} />
    </div>
  )
}
