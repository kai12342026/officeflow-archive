"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChartPie,
  FileText,
  FileUp,
  LayoutDashboard,
  RotateCcw,
  Settings,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useDemo } from "@/lib/demo/store"

const NAV_ITEMS = [
  { href: "/dashboard", label: "דשבורד גבייה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
] as const

const ROADMAP_ITEMS = [
  { label: "קליטת מסמכים", icon: FileUp },
  { label: "הפקת דוחות", icon: FileText },
  { label: "תובנות ואנליטיקה", icon: ChartPie },
  { label: "הגדרות והרשאות", icon: Settings },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const { dispatch } = useDemo()

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
              OS
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold" dir="ltr">
              Ortal Shalom
            </span>
            <span className="truncate text-xs text-muted-foreground">
              משרד רואי חשבון
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ניהול יומיומי</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>בשלב הבא</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ROADMAP_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    disabled
                    tooltip={`${item.label} — בפיתוח`}
                    className="opacity-55"
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="text-[10px] text-muted-foreground">
                    בקרוב
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="אפס את נתוני ההדגמה"
              onClick={() => {
                dispatch({ type: "RESET" })
                toast.success("נתוני ההדגמה אופסו")
              }}
            >
              <RotateCcw />
              <span>אפס הדגמה</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
