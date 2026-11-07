// Backend error codes → Arabic messages shown to the user. Unknown codes fall back to a generic message.
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  ACCOUNT_DISABLED: "هذا الحساب معطّل. تواصل مع مدير النظام.",
  INVALID_TOKEN: "انتهت الجلسة. سجّل الدخول من جديد.",
  UNAUTHORIZED: "انتهت الجلسة. سجّل الدخول من جديد.",
  FORBIDDEN: "ليست لديك صلاحية لتنفيذ هذا الإجراء.",
  STORE_ACCESS_DENIED: "ليست لديك صلاحية على هذا المتجر.",
  VALIDATION_ERROR: "تحقّق من الحقول المُدخلة.",
  MALFORMED_REQUEST: "الطلب غير صالح.",
  CONCURRENT_MODIFICATION: "عدّل شخص آخر هذا السجل. أعد تحميل الصفحة وحاول مجدداً.",
  DATA_CONFLICT: "تتعارض هذه البيانات مع بيانات موجودة.",
  BACKEND_UNAVAILABLE: "تعذّر الاتصال بالخادم. حاول مرة أخرى بعد قليل.",
  NETWORK_ERROR: "تعذّر الاتصال. تحقّق من الشبكة وحاول مرة أخرى.",
  INVALID_FIELD: "قيمة غير صالحة.",
  STORE_HEADER_MISSING: "لم يُحدَّد المتجر. سجّل الدخول من جديد.",
  ENDPOINT_NOT_FOUND: "العنصر المطلوب غير موجود.",
  CATEGORY_NOT_FOUND: "التصنيف غير موجود، ربما حُذف. أعد تحميل الصفحة.",
  CATEGORY_NAME_EXISTS: "يوجد تصنيف بهذا الاسم.",
  CATEGORY_IN_USE: "لا يمكن حذف تصنيف ما زالت فيه منتجات. انقل المنتجات إلى تصنيف آخر أو احذفها أولاً.",
  PRODUCT_NOT_FOUND: "المنتج غير موجود، ربما حُذف. أعد تحميل الصفحة.",
  PRODUCT_SKU_EXISTS: "هذا الرمز (SKU) مستخدم في منتج آخر.",
  PRODUCT_BARCODE_EXISTS: "هذا الباركود مستخدم في منتج آخر.",
  IMAGE_NOT_FOUND: "الصورة غير موجودة، ربما حُذفت.",
  IMAGE_EMPTY: "الملف فارغ.",
  IMAGE_TOO_LARGE: "حجم الصورة أكبر من 5 ميغابايت.",
  FILE_TOO_LARGE: "حجم الملف أكبر من الحد المسموح.",
  IMAGE_TYPE_NOT_ALLOWED: "صيغة غير مدعومة. استخدم JPEG أو PNG أو WebP.",
  IMAGE_LIMIT_REACHED: "وصلت إلى الحد الأقصى: 10 صور لكل منتج.",
  IMAGE_ORDER_INVALID: "تعذّر حفظ ترتيب الصور. أعد تحميل الصفحة.",
  FILE_REQUIRED: "اختر ملفاً.",
  FILE_EMPTY: "الملف فارغ.",
  FILE_NOT_PDF: "الملف ليس PDF. ارفع نسخة PDF من الفاتورة.",
  SUPPLIER_NOT_FOUND: "المورد غير موجود، ربما حُذف. أعد تحميل الصفحة.",
  SUPPLIER_NAME_EXISTS: "يوجد مورد بهذا الاسم.",
  SUPPLIER_IN_USE: "لهذا المورد فواتير شراء، فلا يمكن حذفه. يمكنك تعطيله بدلاً من ذلك.",
  SUPPLIER_INACTIVE: "هذا المورد غير فعّال. فعّله أولاً أو اختر مورداً آخر.",
  RATE_API_NOT_CONFIGURED: "جلب السعر تلقائياً غير مفعّل (لا يوجد مفتاح API). أدخل السعر يدوياً.",
  RATE_FETCH_FAILED: "تعذّر جلب سعر الصرف الآن. يبقى آخر سعر محفوظ مستخدماً؛ حاول لاحقاً أو أدخله يدوياً.",
  RATE_QUOTA_EXHAUSTED: "انتهت طلبات جلب السعر لهذا الشهر. أدخل السعر يدوياً حتى بداية الشهر القادم.",
  RATE_NOT_FOUND: "هذا السعر غير موجود، ربما استُبدل. أعد تحميل الصفحة.",
  RATE_NOT_PENDING: "هذا السعر لا ينتظر المراجعة.",
  RATE_SELL_BELOW_BUY: "سعر المبيع لا يمكن أن يكون أقل من سعر الشراء.",
  STORE_NOT_FOUND: "المتجر غير موجود.",
  INVOICE_NOT_FOUND: "الفاتورة غير موجودة.",
  ATTACHMENT_NOT_FOUND: "لا يوجد ملف مرفق بهذه الفاتورة.",
}

const FALLBACK = "حدث خطأ غير متوقع. حاول مرة أخرى."

export function errorMessage(code: string | undefined): string {
  return (code && MESSAGES[code]) || FALLBACK
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message?: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message ?? code)
    this.name = "ApiError"
  }

  get userMessage(): string {
    return errorMessage(this.code)
  }
}

/** Arabic message for anything thrown by a request (ApiError or not). */
export function toUserMessage(error: unknown): string {
  return error instanceof ApiError ? error.userMessage : errorMessage(undefined)
}
