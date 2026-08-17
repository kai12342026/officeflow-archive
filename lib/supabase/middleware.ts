import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Paths reachable without a session. Everything else redirects to /login. */
const PUBLIC_PREFIXES = ["/login", "/auth"]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // The second argument carries `Cache-Control: no-store`. Dropping it lets
        // a CDN cache a response that sets auth cookies — i.e. serve one user's
        // session to another. Always forward it.
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getClaims() — it refreshes
  // the auth token, and skipping it can log users out at random.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  const { pathname } = request.nextUrl
  const isPublic =
    pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (!claims && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    url.searchParams.set("next", pathname + request.nextUrl.search)
    return withRefreshedCookies(NextResponse.redirect(url), supabaseResponse)
  }

  if (claims && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return withRefreshedCookies(NextResponse.redirect(url), supabaseResponse)
  }

  return supabaseResponse
}

/**
 * A bare NextResponse.redirect() throws away any token Supabase just rotated
 * during getClaims(), which silently kills the session. Carry them across.
 */
function withRefreshedCookies(
  redirectResponse: NextResponse,
  supabaseResponse: NextResponse
) {
  supabaseResponse.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie))

  const cacheControl = supabaseResponse.headers.get("cache-control")
  if (cacheControl) {
    redirectResponse.headers.set("cache-control", cacheControl)
  }

  return redirectResponse
}
