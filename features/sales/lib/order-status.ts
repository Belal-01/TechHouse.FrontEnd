import type { OrderStatus, OrderTransition } from "../types"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "قيد التوصيل",
  DELIVERED: "تم التسليم",
  RETURNED: "مرتجع",
  VOIDED: "ملغى",
}

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

/** What each status change does, shown in its confirmation. */
export const TRANSITIONS: Record<
  OrderTransition,
  { label: string; title: string; description: string; success: string }
> = {
  deliver: {
    label: "تم التسليم",
    title: "تأكيد التسليم؟",
    description: "يُضاف المبلغ كاملاً إلى المحفظة ويُحتسب الربح. لا يمكن التراجع.",
    success: "سُجّل التسليم وأُضيف المبلغ إلى المحفظة.",
  },
  return: {
    label: "مرتجع",
    title: "تسجيل الطلب كمرتجع؟",
    description: "الزبون لم يستلم: تعود البضاعة إلى المخزون، وتبقى أجرة التوصيل مصروفاً. لا يمكن التراجع.",
    success: "سُجّل المرتجع وعادت البضاعة إلى المخزون.",
  },
  void: {
    label: "إدخال بالغلط",
    title: "إلغاء الطلب كإدخال بالغلط؟",
    description: "يُلغى كل أثر للطلب: تعود البضاعة، وتعود أجرة التوصيل إلى المحفظة. استخدمه فقط إذا لم يخرج الطلب فعلاً.",
    success: "أُلغي الطلب.",
  },
}
