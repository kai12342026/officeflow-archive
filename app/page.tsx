import Link from "next/link"

import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/server"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-mono text-sm font-medium tracking-tight">orti</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Orti
          </h1>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
            A Next.js app with Supabase auth, ready to build on. Sign in to get
            started, or jump straight into the code.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <form action={signOut}>
                <Button type="submit" size="lg" variant="outline">
                  Sign out
                </Button>
              </form>
            ) : (
              <>
                <Button size="lg" render={<Link href="/login" />}>
                  Get started
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/login" />}>
                  Sign in
                </Button>
              </>
            )}
          </div>
          {user ? (
            <p className="font-mono text-xs text-muted-foreground">
              Signed in as {user.email}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
