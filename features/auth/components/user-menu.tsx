import { Skeleton } from "@/components/ui/skeleton"
import { requireSession } from "../server/require-session"
import { ProfileMenu } from "./profile-menu"

/** Reads the session at request time: render it inside a <Suspense> boundary. */
export async function UserMenu() {
  const { user } = await requireSession()
  return <ProfileMenu user={{ displayName: user.displayName, email: user.email, role: user.role }} />
}

export function UserMenuSkeleton() {
  return <Skeleton className="h-10 w-10 md:w-36" />
}
