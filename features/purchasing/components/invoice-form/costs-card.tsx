"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CostLinesEditor } from "../cost-lines-editor"

/** Costs known when the invoice is entered (shipping inside China...). More can be added on arrival or later. */
export function CostsCard({ sellRate }: { sellRate: number | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>التكاليف</CardTitle>
        <CardDescription>
          ما دفعته فوق سعر البضاعة حتى الآن، مثل الشحن داخل الصين. الشحن البحري والجمارك تُضاف عند تأكيد الوصول. تُوزَّع
          التكاليف على البنود حسب قيمتها.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CostLinesEditor idPrefix="invoice-cost" newKind="OTHER" sellRate={sellRate} emptyText="لا تكاليف حتى الآن." />
      </CardContent>
    </Card>
  )
}
