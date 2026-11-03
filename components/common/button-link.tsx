import type { ComponentProps } from "react"
import Link from "next/link"
import type { VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonLinkProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>

/**
 * Navigation styled as a button. Keeps real link semantics; rendering a Link through <Button render>
 * would announce it as a button (Base UI adds role="button").
 */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
