import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes: require auth
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // Logged-in users visiting login go to dashboard
  if (pathname === "/login") {
    if (user) {
      const redirectTo =
        request.nextUrl.searchParams.get("redirectTo") ?? "/dashboard"
      const path = redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`
      const destination = path.startsWith("/dashboard") ? path : "/dashboard"
      const redirectResponse = NextResponse.redirect(
        new URL(destination, request.url)
      )
      // Preserve session cookies on redirect so the dashboard sees the user
      response.cookies.getAll().forEach((cookie) =>
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      )
      return redirectResponse
    }
    return response
  }

  // Auth flows: allow unauthenticated access; redirect logged-in users to dashboard
  if (
    pathname === "/auth/forgot-password" ||
    pathname === "/auth/reset-password"
  ) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - static assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
