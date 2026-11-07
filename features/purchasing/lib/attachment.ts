export const PDF_ACCEPT = "application/pdf,.pdf"
const MAX_BYTES = 10 * 1024 * 1024

/** Client-side check before uploading; the server checks again (it reads the file's bytes). */
export function checkInvoicePdf(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!isPdf) return `${file.name}: الملف ليس PDF.`
  if (file.size > MAX_BYTES) return `${file.name}: حجم الملف أكبر من 10 ميغابايت.`
  return null
}
