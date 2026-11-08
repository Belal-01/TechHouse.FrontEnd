import type { ComponentProps } from "react"
import { formatMoney } from "@/lib/format"
import { SypAmount } from "./syp-amount"

type MoneyAmountProps = ComponentProps<"span"> & {
  value: number
  currency: "USD" | "SYP" | (string & {})
}

/** An amount in its own currency: "$12" or "174,000 ل.س". */
export function MoneyAmount({ value, currency, ...props }: MoneyAmountProps) {
  if (currency === "SYP") return <SypAmount value={value} {...props} />
  return (
    <span dir="ltr" {...props}>
      {formatMoney(value)}
    </span>
  )
}
