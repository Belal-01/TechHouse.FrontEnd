"use client"

import { ChevronDown, LoaderCircle, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserResponse } from "@/lib/api/types"
import { initials } from "@/lib/utils"
import { useLogout } from "../hooks/use-logout"
import { ROLE_LABELS } from "../lib/roles"

type ProfileMenuProps = {
  user: Pick<UserResponse, "displayName" | "email" | "role">
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const { logout, isPending } = useLogout()
  const userInitials = initials(user.displayName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-auto gap-2 px-1.5 py-1" aria-label="قائمة الحساب" />}
      >
        <Avatar>
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-sm font-semibold">{user.displayName}</span>
          <span className="text-xs font-normal text-muted-foreground">{ROLE_LABELS[user.role]}</span>
        </span>
        <ChevronDown aria-hidden className="hidden text-muted-foreground md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
            <Avatar size="lg">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-foreground">{user.displayName}</span>
              <span dir="ltr" className="truncate text-end text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" closeOnClick={false} disabled={isPending} onClick={logout}>
          {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : <LogOut aria-hidden />}
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
