import type { MovementType } from "../types"

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  CAPITAL_IN: "إيداع رأس مال",
  SALE_PAYMENT: "تحصيل طلب",
  EXCHANGE_IN: "تصريف (وارد)",
  TRANSFER_IN: "تحويل وارد",
  ADVANCE_RETURN: "إعادة سلفة",
  REFUND: "استرداد لزبون",
  PURCHASE_PAYMENT: "دفع فاتورة شراء",
  EXPENSE: "مصروف",
  WITHDRAWAL_PERSONAL: "سحب شخصي",
  EXCHANGE_OUT: "تصريف (صادر)",
  TRANSFER_OUT: "تحويل صادر",
  ADVANCE_OUT: "سلفة",
  CAPITAL_PAYOUT: "سحب رأس مال مستثمر",
  INSTALLATION_MATERIAL_PURCHASE: "شراء مواد تركيب",
  INSTALLATION_RECEIPT: "قبض تركيب",
  INSTALLATION_TECHNICIAN: "أجرة فني تركيب",
  PROFIT_PAYOUT: "صرف أرباح مستثمر",
  ADJUSTMENT: "تسوية",
}

/** Where a movement's cause lives in the app. */
export function referenceHref(type: string, id: string): string | null {
  switch (type) {
    case "ORDER":
      return `/sales/orders/${id}`
    case "PURCHASE_INVOICE":
      return `/purchasing/invoices/${id}`
    case "INSTALLATION":
    case "INSTALLATION_MATERIAL":
      return "/installations"
    case "PERSON":
      return `/finance/advances/${id}`
    default:
      return null
  }
}
