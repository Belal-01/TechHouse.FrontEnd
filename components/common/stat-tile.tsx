import type { ReactNode } from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const valueVariants = cva("h2 truncate", {
  variants: {
    tone: { default: "text-foreground", negative: "text-red", accent: "text-blue" },
  },
  defaultVariants: { tone: "default" },
})

type StatTileProps = VariantProps<typeof valueVariants> & {
  label: string
  /** The headline figure, already formatted (wrap numbers in dir="ltr"). */
  value: ReactNode
  /** Small line under the value, e.g. a breakdown. */
  hint?: ReactNode
  /** Makes the whole tile a link to the screen behind the number. */
  href?: string
  className?: string
}

/** A single headline number with its label; used instead of a chart when one number is the answer. */
export function StatTile({ label, value, hint, href, tone, className }: StatTileProps) {
  const body = (
    <>
      <span className="flex items-center justify-between gap-2 small text-muted-foreground">
        {label}
        {href ? <ChevronLeft className="size-4 shrink-0" aria-hidden /> : null}
      </span>
      <span className={valueVariants({ tone })}>{value}</span>
      {hint ? <span className="small text-muted-foreground">{hint}</span> : null}
    </>
  )
  const classes = cn("flex min-w-0 flex-col gap-1 rounded-md border bg-card p-4", className)
  return href ? (
    <Link href={href} className={cn(classes, "transition-colors hover:bg-muted")}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  )
}
