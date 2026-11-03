import Image from "next/image"
import { cn } from "cn"

// The logo PNG has a light ground, so it is shown on light surfaces only; dark mode
// uses the wordmark set in type, as the brand rules require. Never recolor the image.
function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/tech-house-logo.png"
        alt="Tech House"
        width={359}
        height={296}
        priority={priority}
        className="h-full w-auto dark:hidden"
      />
      <span className="hidden h2 text-ink dark:block" dir="ltr">
        Tech House
      </span>
    </span>
  )
}

export { Logo }
