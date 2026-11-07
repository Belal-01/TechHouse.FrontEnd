"use client"

import { format } from "date-fns"
import { InvoiceForm } from "./invoice-form/invoice-form"

export function InvoiceCreateView() {
  // Local date, not UTC: late in the evening the UTC date is already tomorrow.
  return <InvoiceForm today={format(new Date(), "yyyy-MM-dd")} />
}
