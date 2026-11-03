import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-md bg-blue-tint text-blue">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <h2 className="h3">{title}</h2>
      {description ? <p className="max-w-md small text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  )
}
