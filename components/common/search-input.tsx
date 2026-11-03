"use client"

import type { ComponentProps } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string
  onValueChange: (value: string) => void
  /** Accessible name of the input, e.g. "بحث في المنتجات". */
  label: string
  clearLabel?: string
}

export function SearchInput({
  value,
  onValueChange,
  label,
  clearLabel = "مسح البحث",
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="ps-9 pe-10 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={clearLabel}
          className="absolute inset-e-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => onValueChange("")}
        >
          <X aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
