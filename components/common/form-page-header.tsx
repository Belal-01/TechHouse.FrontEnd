import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type FormPageHeaderProps = {
  title: ReactNode
  backHref: string
  backLabel: string
  /** Save / cancel / delete buttons. Keep one primary action. */
  actions?: ReactNode
  className?: string
}

/** Header of a full-page form: back link, title and actions. Sticky under the app header so Save stays reachable. */
export function FormPageHeader({ title, backHref, backLabel, actions, className }: FormPageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-16 z-10 -mx-4 -mt-6 flex flex-col gap-3 border-b bg-background px-4 py-4 sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <Link href={backHref} className="inline-flex items-center gap-1 small text-muted-foreground hover:text-foreground">
          <ArrowRight className="size-4" aria-hidden />
          {backLabel}
        </Link>
        <h1 className="truncate h2">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
