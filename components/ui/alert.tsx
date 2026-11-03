import type { ReactNode } from "react"
import { CircleAlert } from "lucide-react"
import { cn } from "cn"

// Error alert built from tokens only: red-text on the card surface with a red-text edge.
function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-sm border border-destructive bg-card px-3 py-2 small text-red",
        className,
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export { Alert }
