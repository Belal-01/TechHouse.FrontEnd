"use client"

import { TriangleAlert } from "lucide-react"
import { MoneyAmount } from "@/components/common/money-amount"
import type { Currency } from "@/lib/currency"
import { useCashAccounts } from "../api/cash"

type BalanceHintProps = {
  accountId: string
  currency: Currency
  /** Money leaving the box; when it exceeds the balance a warning shows (the action is still allowed). */
  outgoing: number
}

/** "الرصيد الحالي" of a box, and a warning when this movement would take it below zero. */
export function BalanceHint({ accountId, currency, outgoing }: BalanceHintProps) {
  const accounts = useCashAccounts()
  const account = accounts.data?.find((a) => a.id === accountId)
  if (!account) return null
  const balance = currency === "USD" ? account.usd : account.syp
  const after = balance - (Number.isFinite(outgoing) ? outgoing : 0)
  return (
    <div className="flex flex-col gap-1 small" aria-live="polite">
      <p className="text-muted-foreground">
        الرصيد الحالي في {account.name}: <MoneyAmount value={balance} currency={currency} className="text-foreground" />
      </p>
      {outgoing > 0 && after < 0 ? (
        <p className="flex items-center gap-1.5 text-red">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          سيصبح الرصيد سالباً (<MoneyAmount value={after} currency={currency} />). تأكد من المبلغ أو من الحركات المسجّلة.
        </p>
      ) : null}
    </div>
  )
}
