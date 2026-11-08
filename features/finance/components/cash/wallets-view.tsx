"use client"

import { useState } from "react"
import { ArrowLeftRight, Coins, PiggyBank, Scale } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-hydrated"
import { useCashAccounts } from "../../api/cash"
import { useCurrentRate } from "../../api/exchange-rates"
import { AccountCards } from "./account-cards"
import { AdjustmentDialog } from "./adjustment-dialog"
import { CapitalDialog } from "./capital-dialog"
import { ExchangeDialog } from "./exchange-dialog"
import { MovementsTable } from "./movements-table"
import { TransferDialog } from "./transfer-dialog"

type DialogKind = "capital" | "transfer" | "exchange" | "adjustment"
type DialogState = { kind: DialogKind | null; session: number }

export function WalletsView() {
  const accounts = useCashAccounts()
  const rate = useCurrentRate()
  // The header reads the same rate query; render rate-based values only after hydration.
  const hydrated = useHydrated()
  const [dialog, setDialog] = useState<DialogState>({ kind: null, session: 0 })
  const open = (kind: DialogKind) => setDialog((s) => ({ kind, session: s.session + 1 }))
  // `key` goes on the element itself (React rejects it inside spread props); it remounts each opening fresh.
  const props = (kind: DialogKind) => ({
    open: dialog.kind === kind,
    onOpenChange: (isOpen: boolean) => setDialog((s) => ({ ...s, kind: isOpen ? kind : null })),
    defaultAccountId: accounts.data?.find((a) => a.isDefault)?.id ?? "",
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="الصناديق"
        description="رصيد كل صندوق بالدولار والليرة، محسوب من الحركات."
        actions={
          <>
            <Button variant="outline" onClick={() => open("adjustment")}>
              <Scale aria-hidden />
              تسوية
            </Button>
            <Button variant="outline" onClick={() => open("exchange")}>
              <Coins aria-hidden />
              تصريف
            </Button>
            <Button variant="outline" onClick={() => open("transfer")}>
              <ArrowLeftRight aria-hidden />
              تحويل
            </Button>
            <Button onClick={() => open("capital")}>
              <PiggyBank aria-hidden />
              إيداع رأس مال
            </Button>
          </>
        }
      />
      <AccountCards
        accounts={accounts.data}
        isLoading={accounts.isPending}
        error={accounts.error}
        sellRate={hydrated ? (rate.data?.current?.sellRate ?? null) : null}
      />
      <MovementsTable />
      {accounts.data ? (
        <>
          <CapitalDialog key={`capital-${dialog.session}`} {...props("capital")} />
          <TransferDialog key={`transfer-${dialog.session}`} {...props("transfer")} />
          <ExchangeDialog key={`exchange-${dialog.session}`} {...props("exchange")} />
          <AdjustmentDialog key={`adjustment-${dialog.session}`} {...props("adjustment")} />
        </>
      ) : null}
    </div>
  )
}
