"use client"

import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/app/actions"

export function AppHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="h-5" />

      <div className="grid min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <ThemeToggle />
      <form action={signOut}>
        <Button variant="ghost" size="icon" type="submit" aria-label="יציאה">
          <LogOut />
        </Button>
      </form>
    </header>
  )
}
