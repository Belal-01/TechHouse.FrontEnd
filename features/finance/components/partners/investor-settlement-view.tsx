"use client"

import { ButtonLink } from "@/components/common/button-link"
import { FormPageHeader } from "@/components/common/form-page-header"
import { Alert } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toUserMessage } from "@/lib/api/errors"
import { usePartners } from "../../api/partners"
import { InvestorStatement } from "./investor-statement"

export function InvestorSettlementView({ investorId }: { investorId: string }) {
  const partners = usePartners()
  if (partners.isPending) return <Skeleton className="h-64 w-full" />
  const investor = partners.data?.find((partner) => partner.id === investorId && partner.kind === "INVESTOR")

  return (
    <div className="flex flex-col gap-6">
      <FormPageHeader
        title={investor?.name ?? "تسوية المستثمر"}
        backHref="/finance/partners"
        backLabel="الشركاء والمستثمرون"
        actions={investor ? (
          <ButtonLink variant="outline" href={`/finance/advances/${investor.advanceProfileId}`}>السلف</ButtonLink>
        ) : null}
      />
      {investor ? <InvestorStatement investorId={investor.id} /> : (
        <Alert>{partners.isError ? toUserMessage(partners.error) : "المستثمر غير موجود."}</Alert>
      )}
    </div>
  )
}
