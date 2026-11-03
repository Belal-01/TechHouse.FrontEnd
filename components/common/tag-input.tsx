"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type TagInputProps = {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  /** Accessible name of each chip's remove button, e.g. (tag) => `حذف ${tag}`. */
  removeLabel?: (tag: string) => string
  maxLength?: number
  invalid?: boolean
  describedBy?: string
  className?: string
}

/** Free-text chips: Enter or comma adds, Backspace on empty input removes the last. Duplicates are ignored. */
export function TagInput({
  id,
  value,
  onChange,
  placeholder,
  removeLabel = (tag) => `حذف ${tag}`,
  maxLength = 50,
  invalid,
  describedBy,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState("")

  const add = (raw: string) => {
    const tag = raw.trim()
    setDraft("")
    if (!tag || value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return
    onChange([...value, tag])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "," || event.key === "،") {
      event.preventDefault()
      add(draft)
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-2 rounded-sm border border-input bg-card px-2 py-1.5",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        invalid && "border-destructive",
        className,
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-sm bg-blue-tint py-0.5 pe-1 ps-2 text-sm text-blue">
          {tag}
          <button
            type="button"
            className="rounded-sm p-0.5 hover:bg-muted"
            aria-label={removeLabel(tag)}
            onClick={() => onChange(value.filter((existing) => existing !== tag))}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        maxLength={maxLength}
        placeholder={value.length === 0 ? placeholder : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        className="min-w-24 flex-1 bg-transparent py-1 text-base placeholder:text-muted-foreground focus-visible:outline-none"
      />
    </div>
  )
}
