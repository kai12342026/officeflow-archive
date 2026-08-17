import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app/app-sidebar"
import { DemoBanner } from "@/components/app/demo-banner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DemoProvider } from "@/lib/demo/store"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The proxy redirect is a UX convenience; this is the actual gate.
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    redirect("/login?next=/dashboard")
  }

  return (
    <DemoProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DemoBanner />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DemoProvider>
  )
}
