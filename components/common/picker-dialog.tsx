"use client"

import type { ReactNode } from "react"
import { PackageSearch } from "lucide-react"
import { SearchInput } from "@/components/common/search-input"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type PickerDialogProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  searchLabel: string
  search: string
  onSearchChange: (value: string) => void
  items: T[] | undefined
  isLoading?: boolean
  error?: string | null
  emptyText: string
  getKey: (item: T) => string
  /** Content of one row button. */
  renderItem: (item: T) => ReactNode
  onSelect: (item: T) => void
  isDisabled?: (item: T) => boolean
}

/** Search a list and pick one entry. Remount (key) per opening so the search starts empty. */
export function PickerDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  searchLabel,
  search,
  onSearchChange,
  items,
  isLoading = false,
  error,
  emptyText,
  getKey,
  renderItem,
  onSelect,
  isDisabled,
}: PickerDialogProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <SearchInput label={searchLabel} placeholder={searchLabel} value={search} onValueChange={onSearchChange} autoFocus />

        <div className="-mx-2 min-h-40 overflow-y-auto px-2" aria-live="polite" aria-busy={isLoading || undefined}>
          {error ? (
            <Alert>{error}</Alert>
          ) : isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !items || items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center small text-muted-foreground">
              <PackageSearch className="size-6" aria-hidden />
              {emptyText}
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const disabled = isDisabled?.(item) ?? false
                return (
                  <li key={getKey(item)}>
                    <button
                      type="button"
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-start transition-colors",
                        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted",
                      )}
                      onClick={() => onSelect(item)}
                    >
                      {renderItem(item)}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
