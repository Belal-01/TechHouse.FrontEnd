"use client"

import type { ReactNode } from "react"
import { RotateCw } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DataTableColumn<TRow> = {
  id: string
  header: ReactNode
  cell: (row: TRow) => ReactNode
  /** Applied to both the header and the cells, e.g. "hidden md:table-cell" or a width. */
  className?: string
  align?: "start" | "center" | "end"
}

type DataTableProps<TRow> = {
  columns: DataTableColumn<TRow>[]
  rows: TRow[] | undefined
  getRowId: (row: TRow) => string
  /** Screen-reader caption describing the table. */
  caption: string
  isLoading?: boolean
  loadingRows?: number
  /** User-facing error message; shows an error row with a retry button. */
  error?: string | null
  onRetry?: () => void
  retryLabel?: string
  /** Rendered instead of the table when there are no rows. */
  empty?: ReactNode
  className?: string
}

const ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const

export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  caption,
  isLoading = false,
  loadingRows = 5,
  error,
  onRetry,
  retryLabel = "إعادة المحاولة",
  empty,
  className,
}: DataTableProps<TRow>) {
  if (!isLoading && !error && rows?.length === 0 && empty) return <>{empty}</>

  const cellClass = (column: DataTableColumn<TRow>) => cn(ALIGN[column.align ?? "start"], column.className)

  return (
    <div className={cn("overflow-hidden rounded-md border bg-card", className)}>
      <Table aria-busy={isLoading || undefined}>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} scope="col" className={cellClass(column)}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {error ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-auto py-6 whitespace-normal">
                <div className="flex flex-col items-center gap-3">
                  <Alert className="w-full max-w-md">{error}</Alert>
                  {onRetry ? (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RotateCw aria-hidden />
                      {retryLabel}
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: loadingRows }, (_, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.id} className={cellClass(column)}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            rows?.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={cellClass(column)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
