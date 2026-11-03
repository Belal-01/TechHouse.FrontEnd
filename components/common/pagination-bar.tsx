"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationBarProps = {
  /** Zero-based page index, as returned by the backend. */
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  previousLabel?: string
  nextLabel?: string
  /** e.g. (from, to, total) => "1–20 من 57" */
  summary?: (from: number, to: number, total: number) => string
}

export function PaginationBar({
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  className,
  previousLabel = "السابق",
  nextLabel = "التالي",
  summary = (from, to, total) => `${from}–${to} من ${total}`,
}: PaginationBarProps) {
  if (totalElements === 0) return null
  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)

  return (
    <nav aria-label="التنقل بين الصفحات" className={cn("flex items-center justify-between gap-4", className)}>
      <p className="small text-muted-foreground" aria-live="polite">
        {summary(from, to, totalElements)}
      </p>
      <div className="flex items-center gap-2">
        {/* RTL: "previous" points right, "next" points left. */}
        <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
          <ChevronRight aria-hidden />
          {previousLabel}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          {nextLabel}
          <ChevronLeft aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
