import type { ComponentProps } from "react"
import { formatSyp } from "@/lib/format"
import { cn } from "@/lib/utils"

type SypAmountProps = ComponentProps<"span"> & {
  value: number
  /** Hide the "ل.س" unit, e.g. in tight spaces where a label says it already. */
  hideUnit?: boolean
}

/** "14,487.5 ل.س": the number stays left-to-right inside Arabic text. */
export function SypAmount({ value, hideUnit = false, className, ...props }: SypAmountProps) {
  return (
    <span className={cn("whitespace-nowrap", className)} {...props}>
      <span dir="ltr">{formatSyp(value)}</span>
      {hideUnit ? null : " ل.س"}
    </span>
  )
}
