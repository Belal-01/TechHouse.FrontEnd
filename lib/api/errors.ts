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
  PRODUCT_OPTIONS_REQUIRED: "المنتج بعدة أنواع يحتاج خياراً واحداً على الأقل (مثل اللون).",
  PRODUCT_OPTION_DUPLICATE: "اسم الخيار مكرر.",
  VARIANT_OPTIONS_MISMATCH: "حدّد قيمة لكل خيار.",
  VARIANT_COMBINATION_DUPLICATE: "هذه التركيبة موجودة في نوع آخر.",
  VARIANT_SKU_DUPLICATE: "هذا الرمز مستخدم في نوع آخر من المنتج نفسه.",
  VARIANT_BARCODE_DUPLICATE: "هذا الباركود مستخدم في نوع آخر من المنتج نفسه.",
  VARIANT_SKU_EXISTS: "هذا الرمز (SKU) مستخدم في منتج آخر.",
  VARIANT_BARCODE_EXISTS: "هذا الباركود مستخدم في منتج آخر.",
  VARIANT_NOT_FOUND: "أحد الأنواع لم يعد موجوداً. أعد تحميل الصفحة.",
  IMAGE_NOT_FOUND: "الصورة غير موجودة، ربما حُذفت.",
  IMAGE_EMPTY: "الملف فارغ.",
  IMAGE_TOO_LARGE: "حجم الصورة أكبر من 5 ميغابايت.",
  FILE_TOO_LARGE: "حجم الصورة أكبر من 5 ميغابايت.",
  IMAGE_TYPE_NOT_ALLOWED: "صيغة غير مدعومة. استخدم JPEG أو PNG أو WebP.",
  IMAGE_LIMIT_REACHED: "وصلت إلى الحد الأقصى: 10 صور لكل منتج.",
  IMAGE_ORDER_INVALID: "تعذّر حفظ ترتيب الصور. أعد تحميل الصفحة.",
  FILE_REQUIRED: "اختر ملفاً.",
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
