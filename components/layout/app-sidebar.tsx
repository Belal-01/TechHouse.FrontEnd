"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { isBranch, type NavBranch, type NavGroup, type NavLink } from "./navigation.types"

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  navigation: NavGroup[]
  header?: ReactNode
  footer?: ReactNode
  /** Label shown on links marked `disabled` (not built yet). */
  disabledLabel: string
}

/** Data-driven sidebar: everything it shows comes from the `navigation` config. */
export function AppSidebar({ navigation, header, footer, disabledLabel, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Sidebar collapsible="icon" {...props}>
      {header ? <SidebarHeader>{header}</SidebarHeader> : null}

      <SidebarContent>
        {navigation.map((group, index) => (
          <SidebarGroup key={group.label ?? index}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((entry) =>
                isBranch(entry) ? (
                  <NavBranchItem key={entry.title} branch={entry} isActive={isActive} disabledLabel={disabledLabel} />
                ) : (
                  <NavLinkItem key={entry.href} link={entry} active={isActive(entry.href)} disabledLabel={disabledLabel} />
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
      <SidebarRail />
    </Sidebar>
  )
}

function useCloseOnMobile() {
  const { isMobile, setOpenMobile } = useSidebar()
  return () => {
    if (isMobile) setOpenMobile(false)
  }
}

function NavLinkItem({ link, active, disabledLabel }: { link: NavLink; active: boolean; disabledLabel: string }) {
  const closeOnMobile = useCloseOnMobile()
  const Icon = link.icon

  if (link.disabled) {
    // No tooltip here: Base UI's tooltip trigger would take the `disabled` prop and leave the button focusable.
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled>
          {Icon ? <Icon aria-hidden /> : null}
          <span>{link.title}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className="font-normal text-muted-foreground">{disabledLabel}</SidebarMenuBadge>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={link.title}
        render={<Link href={link.href} aria-current={active ? "page" : undefined} onClick={closeOnMobile} />}
      >
        {Icon ? <Icon aria-hidden /> : null}
        <span>{link.title}</span>
      </SidebarMenuButton>
      {link.badge != null ? <SidebarMenuBadge>{link.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  )
}

function NavBranchItem({
  branch,
  isActive,
  disabledLabel,
}: {
  branch: NavBranch
  isActive: (href: string) => boolean
  disabledLabel: string
}) {
  const { state, isMobile, setOpen } = useSidebar()
  const closeOnMobile = useCloseOnMobile()
  const collapsed = state === "collapsed" && !isMobile
  const hasActiveChild = branch.items.some((item) => !item.disabled && isActive(item.href))
  const [expanded, setExpanded] = useState(hasActiveChild)
  const Icon = branch.icon

  return (
    <Collapsible
      open={expanded}
      // In icon mode the sub-list is hidden, so a click expands the sidebar and opens the group instead.
      onOpenChange={(next) => setExpanded(collapsed ? true : next)}
      render={<SidebarMenuItem />}
    >
      <SidebarMenuButton
        tooltip={branch.title}
        isActive={collapsed && hasActiveChild}
        render={<CollapsibleTrigger />}
        onClick={() => collapsed && setOpen(true)}
      >
        <Icon aria-hidden />
        <span>{branch.title}</span>
        <ChevronDown aria-hidden className="ms-auto transition-transform in-data-panel-open:rotate-180" />
      </SidebarMenuButton>

      <CollapsibleContent>
        <SidebarMenuSub>
          {branch.items.map((item) => {
            const active = !item.disabled && isActive(item.href)
            return (
              <SidebarMenuSubItem key={item.href}>
                {item.disabled ? (
                  <SidebarMenuSubButton render={<span aria-disabled="true" />}>
                    <span className="flex-1">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{disabledLabel}</span>
                  </SidebarMenuSubButton>
                ) : (
                  <SidebarMenuSubButton
                    isActive={active}
                    render={<Link href={item.href} aria-current={active ? "page" : undefined} onClick={closeOnMobile} />}
                  >
                    <span>{item.title}</span>
                  </SidebarMenuSubButton>
                )}
              </SidebarMenuSubItem>
            )
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
