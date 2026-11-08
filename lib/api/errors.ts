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
  ORDER_NOT_FOUND: "الطلب غير موجود.",
  ORDER_NOT_PENDING: "تغيّرت حالة هذا الطلب مسبقاً. أعد تحميل الصفحة.",
  INSUFFICIENT_STOCK: "الكمية غير متوفرة في المخزون.",
  PRODUCT_INACTIVE: "هذا المنتج موقوف عن البيع.",
  EXCHANGE_RATE_REQUIRED: "لا يوجد سعر صرف بعد، وهو مطلوب للبيع أو الدفع بالليرة. أدخل سعر اليوم من صفحة أسعار الصرف.",
  DELIVERY_COMPANY_NOT_FOUND: "شركة التوصيل غير موجودة، ربما حُذفت.",
  DELIVERY_COMPANY_INACTIVE: "شركة التوصيل هذه غير فعّالة.",
  DELIVERY_COMPANY_NAME_EXISTS: "توجد شركة توصيل بهذا الاسم.",
  DELIVERY_COMPANY_IN_USE: "لهذه الشركة طلبات، فلا يمكن حذفها. يمكنك تعطيلها بدلاً من ذلك.",
  CASH_ACCOUNT_NOT_FOUND: "الصندوق غير موجود.",
  CASH_ACCOUNT_INACTIVE: "هذا الصندوق غير فعّال.",
  CASH_ACCOUNT_NAME_EXISTS: "يوجد صندوق بهذا الاسم.",
  CASH_ACCOUNT_DEFAULT: "لا يمكن تعطيل الصندوق الافتراضي.",
  SAME_ACCOUNT: "اختر صندوقين مختلفين.",
  EXPENSE_NOT_FOUND: "المصروف غير موجود.",
  EXPENSE_ALREADY_VOIDED: "هذا المصروف ملغى مسبقاً.",
  EXPENSE_BELONGS_TO_ORDER: "أجرة توصيل الطلب تُلغى مع الطلب نفسه (إدخال بالغلط) من صفحة الطلب.",
  EXPENSE_FROM_ADVANCE: "هذا المصروف صُرف من سلفة، ولا يُلغى من هنا.",
  EXPENSE_CATEGORY_NOT_FOUND: "الفئة غير موجودة.",
  EXPENSE_CATEGORY_INACTIVE: "هذه الفئة غير فعّالة.",
  EXPENSE_CATEGORY_NAME_EXISTS: "توجد فئة بهذا الاسم.",
  EXPENSE_CATEGORY_IN_USE: "لهذه الفئة مصاريف، فلا يمكن حذفها. يمكنك تعطيلها بدلاً من ذلك.",
  EXPENSE_CATEGORY_SYSTEM: "يستخدم النظام هذه الفئة، فلا يمكن حذفها أو تعطيلها.",
  PERSON_NOT_FOUND: "الشخص غير موجود.",
  PERSON_INACTIVE: "هذا الشخص غير فعّال.",
  PERSON_NAME_EXISTS: "يوجد شخص بهذا الاسم.",
  ADVANCE_EXCEEDS_BALANCE: "المبلغ أكبر مما عليه من سلفة بهذه العملة.",
  INVALID_PERIOD: "الفترة غير صالحة: تاريخ البداية يجب أن يسبق تاريخ النهاية.",
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
